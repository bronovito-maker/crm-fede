require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG = {
  baserowBaseUrl: process.env.BASEROW_BASE_URL || "https://api.baserow.io",
  baserowToken: process.env.BASEROW_TOKEN || "",
  agentiTableId: process.env.BASEROW_TABLE_AGENTI_ID || "",
  contrattiTableId: process.env.BASEROW_TABLE_CONTRATTI_ID || "",
  contrattiAgenteField: process.env.BASEROW_FIELD_CONTRATTI_AGENTE || "agente",
  sessionTtlMs: Number(process.env.SESSION_TTL_HOURS || 12) * 60 * 60 * 1000,
  cookieSecure: process.env.NODE_ENV === "production",
};

const allowedClientTypes = new Set(["Business", "Privato", "Condominio"]);
const allowedStatuses = new Set(["in attesa", "validato", "scartato"]);
const allowedOperations = new Set(["switch", "switch + voltura", "cambio listino", "subentro"]);
const allowedSupplyTypes = new Set(["luce", "gas", "dual"]);
const allowedPaymentMethods = new Set(["bollettino", "rid"]);
const sessions = new Map();
const sessionCookieName = "crm_session";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: isConfigured(),
    service: "crm-energia",
  });
});

app.get("/api/session", attachSession, async (req, res) => {
  if (!req.session) {
    res.json({ authenticated: false });
    return;
  }

  try {
    ensureConfigured();
    const agent = await getCurrentAgent(req.session.agentId);
    res.json({ authenticated: true, agent });
  } catch (error) {
    clearSessionCookie(res);
    handleApiError(res, error, "SESSION_LOAD_FAILED", "Sessione non valida.");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    ensureConfigured();

    const email = cleanText(req.body.email).toLowerCase();
    const password = cleanText(req.body.password);

    if (!email || !password) {
      throw publicError(401, "LOGIN_FAILED", "Credenziali non valide.");
    }

    const agent = await getAgentByEmail(email);
    const passwordOk = agent.passwordHash ? await bcrypt.compare(password, agent.passwordHash) : false;

    if (!passwordOk) {
      throw publicError(401, "LOGIN_FAILED", "Credenziali non valide.");
    }

    if (!agent.attivo) {
      throw publicError(403, "AGENT_DISABLED", "Agente non attivo.");
    }

    const token = createSession(agent.id, email);
    setSessionCookie(res, token);
    res.json({ authenticated: true, agent: publicAgent(agent) });
  } catch (error) {
    handleApiError(res, error, "LOGIN_FAILED", "Accesso non riuscito.");
  }
});

app.post("/api/logout", attachSession, (req, res) => {
  if (req.sessionToken) {
    sessions.delete(req.sessionToken);
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/agent", requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const agent = await getCurrentAgent(req.session.agentId);
    res.json(agent);
  } catch (error) {
    handleApiError(res, error, "AGENT_LOAD_FAILED", "Impossibile caricare l'agente.");
  }
});

app.get("/api/contracts", requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const contracts = await listContracts(req.session.agentId);
    res.json(contracts);
  } catch (error) {
    handleApiError(res, error, "CONTRACTS_LOAD_FAILED", "Impossibile caricare i contratti.");
  }
});

app.post("/api/contracts", requireAuth, upload.single("fileContratto"), async (req, res) => {
  try {
    ensureConfigured();
    const agent = await getCurrentAgent(req.session.agentId);
    const contract = sanitizeContractInput(req.body);
    const uploadedFile = req.file ? await uploadContractFile(req.file) : null;
    const payload = {
      agente: [req.session.agentId],
      data_inserimento: todayIsoDate(),
      ragione_sociale: contract.ragioneSociale,
      cellulare: contract.cellulare,
      tipo_cliente: contract.tipoCliente,
      fornitore: contract.fornitore,
      nome_offerta: contract.nomeOfferta,
      tipo_operazione: contract.tipoOperazione,
      tipo_fornitura: contract.tipoFornitura,
      pod: contract.pod,
      pdr: contract.pdr,
      metodo_pagamento: contract.metodoPagamento,
      iban: contract.iban,
      piva: contract.piva,
      email: contract.email,
      indirizzo: contract.indirizzo,
      indirizzo_fatturazione: contract.indirizzoFatturazione,
      indirizzo_fornitura: contract.indirizzoFornitura,
      descrizione: contract.descrizione,
      stato_contratto: "in attesa",
      cb_unitaria_snapshot: agent.cbUnitaria,
    };

    if (uploadedFile) {
      payload.file_contratto = [
        {
          name: uploadedFile.name,
          visible_name: req.file.originalname,
        },
      ];
    }

    const created = await createBaserowContract(payload);
    res.status(201).json(normalizeContract(created));
  } catch (error) {
    handleApiError(res, error, "CONTRACT_NOT_SAVED", "Contratto non salvato.");
  }
});

app.patch("/api/contracts/:id/status", requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const contractId = Number(req.params.id);
    const status = normalizeStatus(req.body.status);

    if (!Number.isInteger(contractId) || contractId <= 0) {
      throw publicError(400, "INVALID_CONTRACT_ID", "Contratto non valido.");
    }

    if (!allowedStatuses.has(status)) {
      throw publicError(400, "INVALID_STATUS", "Stato contratto non valido.");
    }

    const existing = await getBaserowContract(contractId);
    if (!isCurrentAgentContract(existing, req.session.agentId)) {
      throw publicError(403, "CONTRACT_FORBIDDEN", "Contratto non accessibile.");
    }

    const updated = await updateBaserowContract(contractId, { stato_contratto: status });
    res.json(normalizeContract(updated));
  } catch (error) {
    handleApiError(res, error, "CONTRACT_STATUS_NOT_UPDATED", "Stato contratto non aggiornato.");
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API_NOT_FOUND",
    message: "Endpoint non disponibile.",
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`CRM Energia avviato su http://localhost:${PORT}`);
  if (!isConfigured()) {
    console.warn("Configurazione Baserow incompleta. Controlla il file .env.");
  }
});

function isConfigured() {
  return Boolean(
    CONFIG.baserowToken &&
      CONFIG.agentiTableId &&
      CONFIG.contrattiTableId,
  );
}

function ensureConfigured() {
  if (!isConfigured()) {
    throw publicError(503, "BASEROW_NOT_CONFIGURED", "Baserow non configurato.");
  }
}

function requireAuth(req, res, next) {
  attachSession(req, res, () => {
    if (!req.session) {
      res.status(401).json({
        error: "AUTH_REQUIRED",
        message: "Accesso richiesto.",
      });
      return;
    }
    next();
  });
}

function attachSession(req, res, next) {
  const token = getCookie(req, sessionCookieName);
  const session = token ? sessions.get(token) : null;

  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    req.session = null;
    req.sessionToken = null;
    next();
    return;
  }

  session.expiresAt = Date.now() + CONFIG.sessionTtlMs;
  req.session = session;
  req.sessionToken = token;
  next();
}

function createSession(agentId, email) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    agentId,
    email,
    expiresAt: Date.now() + CONFIG.sessionTtlMs,
  });
  return token;
}

function setSessionCookie(res, token) {
  const secure = CONFIG.cookieSecure ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(CONFIG.sessionTtlMs / 1000)}${secure}`,
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function getCookie(req, name) {
  const cookies = String(req.headers.cookie || "").split(";").map((item) => item.trim());
  const prefix = `${name}=`;
  const found = cookies.find((item) => item.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : "";
}

async function baserowFetch(pathname, options = {}) {
  const response = await fetch(`${CONFIG.baserowBaseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Token ${CONFIG.baserowToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Baserow API ${response.status}: ${body}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function getCurrentAgent(agentId) {
  const row = await baserowFetch(
    `/api/database/rows/table/${CONFIG.agentiTableId}/${agentId}/?user_field_names=true`,
  );
  return publicAgent(normalizeAgent(row));
}

async function getAgentByEmail(email) {
  const params = new URLSearchParams({
    user_field_names: "true",
    size: "1",
    filter_type: "AND",
    filters: JSON.stringify({
      filter_type: "AND",
      filters: [
        {
          field: "email",
          type: "equal",
          value: email,
        },
      ],
    }),
  });

  const data = await baserowFetch(`/api/database/rows/table/${CONFIG.agentiTableId}/?${params.toString()}`);
  const row = (data.results || [])[0];

  if (!row) {
    throw publicError(401, "LOGIN_FAILED", "Credenziali non valide.");
  }

  return normalizeAgent(row);
}

async function listContracts(agentId) {
  const params = new URLSearchParams({
    user_field_names: "true",
    order_by: "-data_inserimento",
    size: "200",
    filter_type: "AND",
    filters: JSON.stringify({
      filter_type: "AND",
      filters: [
        {
          field: CONFIG.contrattiAgenteField,
          type: "link_row_has",
          value: String(agentId),
        },
      ],
    }),
  });

  const data = await baserowFetch(`/api/database/rows/table/${CONFIG.contrattiTableId}/?${params.toString()}`);
  return (data.results || []).filter((row) => isCurrentAgentContract(row, agentId)).map(normalizeContract);
}

async function getBaserowContract(contractId) {
  return baserowFetch(`/api/database/rows/table/${CONFIG.contrattiTableId}/${contractId}/?user_field_names=true`);
}

async function createBaserowContract(payload) {
  return baserowFetch(`/api/database/rows/table/${CONFIG.contrattiTableId}/?user_field_names=true`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateBaserowContract(contractId, payload) {
  return baserowFetch(`/api/database/rows/table/${CONFIG.contrattiTableId}/${contractId}/?user_field_names=true`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

async function uploadContractFile(file) {
  if (file.mimetype !== "application/pdf" || !file.originalname.toLowerCase().endsWith(".pdf")) {
    throw publicError(400, "PDF_REQUIRED", "Carica un file PDF valido.");
  }

  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append("file", blob, file.originalname);

  const response = await fetch(`${CONFIG.baserowBaseUrl}/api/user-files/upload-file/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${CONFIG.baserowToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Baserow file upload ${response.status}: ${body}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function sanitizeContractInput(input) {
  const contract = {
    ragioneSociale: cleanText(input.ragioneSociale),
    cellulare: cleanText(input.cellulare),
    tipoCliente: cleanText(input.tipoCliente),
    fornitore: cleanText(input.fornitore),
    nomeOfferta: cleanText(input.nomeOfferta),
    tipoOperazione: normalizeOperations(input.tipoOperazione),
    tipoFornitura: cleanText(input.tipoFornitura).toLowerCase(),
    pod: cleanText(input.pod).toUpperCase(),
    pdr: cleanText(input.pdr),
    metodoPagamento: cleanText(input.metodoPagamento).toLowerCase(),
    iban: cleanText(input.iban).replace(/\s+/g, "").toUpperCase(),
    piva: cleanText(input.piva),
    email: cleanText(input.email).toLowerCase(),
    indirizzo: cleanText(input.indirizzo),
    indirizzoFatturazione: cleanText(input.indirizzoFatturazione),
    indirizzoFornitura: cleanText(input.indirizzoFornitura),
    descrizione: cleanText(input.descrizione),
  };

  if (!contract.ragioneSociale) {
    throw publicError(400, "CUSTOMER_REQUIRED", "Inserisci il cliente.");
  }

  if (!contract.cellulare) {
    throw publicError(400, "PHONE_REQUIRED", "Inserisci il cellulare.");
  }

  if (!allowedClientTypes.has(contract.tipoCliente)) {
    throw publicError(400, "CLIENT_TYPE_INVALID", "Tipo cliente non valido.");
  }

  if (!contract.fornitore) {
    throw publicError(400, "SUPPLIER_REQUIRED", "Inserisci il fornitore.");
  }

  if (!contract.nomeOfferta) {
    throw publicError(400, "OFFER_REQUIRED", "Inserisci il nome dell'offerta.");
  }

  if (!contract.tipoOperazione.length || contract.tipoOperazione.some((operation) => !allowedOperations.has(operation))) {
    throw publicError(400, "OPERATION_INVALID", "Tipo operazione non valido.");
  }

  if (!allowedSupplyTypes.has(contract.tipoFornitura)) {
    throw publicError(400, "SUPPLY_TYPE_INVALID", "Tipo fornitura non valido.");
  }

  if ((contract.tipoFornitura === "luce" || contract.tipoFornitura === "dual") && !contract.pod) {
    throw publicError(400, "POD_REQUIRED", "Inserisci il POD.");
  }

  if ((contract.tipoFornitura === "gas" || contract.tipoFornitura === "dual") && !contract.pdr) {
    throw publicError(400, "PDR_REQUIRED", "Inserisci il PDR.");
  }

  if (!allowedPaymentMethods.has(contract.metodoPagamento)) {
    throw publicError(400, "PAYMENT_METHOD_INVALID", "Metodo di pagamento non valido.");
  }

  if (contract.metodoPagamento === "rid" && !contract.iban) {
    throw publicError(400, "IBAN_REQUIRED", "Inserisci l'IBAN.");
  }

  if (contract.iban && !/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(contract.iban)) {
    throw publicError(400, "IBAN_INVALID", "IBAN non valido.");
  }

  if (contract.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contract.email)) {
    throw publicError(400, "EMAIL_INVALID", "Email non valida.");
  }

  if (contract.piva && !/^\d{11}$/.test(contract.piva)) {
    throw publicError(400, "PIVA_INVALID", "La P.IVA deve avere 11 cifre.");
  }

  return contract;
}

function normalizeAgent(row) {
  return {
    id: row.id,
    nome: row.nome || "Agente sconosciuto",
    email: row.email || "",
    cbUnitaria: numberValue(row.cb_unitaria),
    targetMensile: integerValue(row.target_mensile),
    targetTrimestrale: integerValue(row.target_trimestrale),
    targetAnnuale: integerValue(row.target_annuale),
    ruolo: selectValue(row.ruolo) || "agente",
    attivo: row.attivo !== undefined ? Boolean(row.attivo) : true,
    passwordHash: row.password_hash || "",
  };
}

function publicAgent(agent) {
  return {
    id: agent.id,
    nome: agent.nome,
    email: agent.email,
    cbUnitaria: agent.cbUnitaria,
    targetMensile: agent.targetMensile,
    targetTrimestrale: agent.targetTrimestrale,
    targetAnnuale: agent.targetAnnuale,
    ruolo: agent.ruolo,
    attivo: agent.attivo,
  };
}

function normalizeContract(row) {
  const status = selectValue(row.stato_contratto) || "in attesa";
  const cbSnapshot = numberValue(row.cb_unitaria_snapshot);
  const cbMaturata = row.cb_maturata !== undefined ? numberValue(row.cb_maturata) : status === "scartato" ? 0 : cbSnapshot;

  return {
    id: row.id,
    agenteId: linkedAgentId(row.agente),
    dataInserimento: row.data_inserimento || "",
    ragioneSociale: row.ragione_sociale || "",
    cellulare: row.cellulare || "",
    tipoCliente: selectValue(row.tipo_cliente),
    fornitore: row.fornitore || "",
    nomeOfferta: row.nome_offerta || "",
    tipoOperazione: multiSelectValue(row.tipo_operazione),
    tipoFornitura: selectValue(row.tipo_fornitura),
    pod: row.pod || "",
    pdr: row.pdr || "",
    metodoPagamento: selectValue(row.metodo_pagamento),
    iban: row.iban || "",
    fileContratto: fileValue(row.file_contratto),
    piva: row.piva || "",
    email: row.email || "",
    indirizzo: row.indirizzo || "",
    indirizzoFatturazione: row.indirizzo_fatturazione || "",
    indirizzoFornitura: row.indirizzo_fornitura || "",
    descrizione: row.descrizione || "",
    statoContratto: status,
    cbUnitariaSnapshot: cbSnapshot,
    cbMaturata,
    meseRiferimento: row.mese_riferimento || "",
    trimestreRiferimento: row.trimestre_riferimento || "",
    annoRiferimento: row.anno_riferimento || "",
  };
}

function isCurrentAgentContract(row, agentId) {
  if (Array.isArray(row.agente) && row.agente.length > 0) {
    return row.agente.some((agentRow) => Number(agentRow.id) === Number(agentId));
  }

  if (typeof row.agente === "number" || typeof row.agente === "string") {
    return Number(row.agente) === Number(agentId);
  }

  if (row.agente && typeof row.agente === "object" && "id" in row.agente) {
    return Number(row.agente.id) === Number(agentId);
  }

  return false;
}

function linkedAgentId(value) {
  if (Array.isArray(value) && value.length > 0) return value[0].id;
  if (value && typeof value === "object" && "id" in value) return value.id;
  return value || null;
}

function selectValue(value) {
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value || "";
}

function multiSelectValue(value) {
  if (Array.isArray(value)) {
    return value.map(selectValue).filter(Boolean);
  }
  return value ? [selectValue(value)].filter(Boolean) : [];
}

function fileValue(value) {
  return Array.isArray(value)
    ? value.map((file) => ({
        name: file.name || "",
        visibleName: file.visible_name || file.name || "",
        url: file.url || "",
        mimeType: file.mime_type || "",
        size: numberValue(file.size),
      }))
    : [];
}

function numberValue(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function integerValue(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(value) {
  return cleanText(value).toLowerCase();
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeOperations(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map((item) => cleanText(item).toLowerCase()).filter(Boolean);
}

function todayIsoDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function publicError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.publicMessage = message;
  return error;
}

function handleApiError(res, error, code, message) {
  if (error.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      error: "FILE_TOO_LARGE",
      message: "Il PDF non deve superare 10 MB.",
    });
    return;
  }

  if (!error.publicMessage) {
    console.error(error.message);
  }

  res.status(error.status || 500).json({
    error: error.code || code,
    message: error.publicMessage || message,
  });
}
