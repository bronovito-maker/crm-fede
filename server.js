require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG = {
  baserowBaseUrl: process.env.BASEROW_BASE_URL || 'https://api.baserow.io',
  baserowToken: process.env.BASEROW_TOKEN || '',
  agentiTableId: process.env.BASEROW_TABLE_AGENTI_ID || '',
  contrattiTableId: process.env.BASEROW_TABLE_CONTRATTI_ID || '',
  contrattiAgenteField: process.env.BASEROW_FIELD_CONTRATTI_AGENTE || 'agente',
  sessionTtlMs: Number(process.env.SESSION_TTL_HOURS || 12) * 60 * 60 * 1000,
  cookieSecure: process.env.NODE_ENV === 'production',
};

const allowedClientTypes = new Set(['Business', 'Privato', 'Condominio']);
const allowedCustomerCategories = new Set(['prospect', 'switch ricorrente']);
const allowedStatuses = new Set(['Bozza', 'Caricato', 'Inviato', 'OK', 'K.O.', 'Switch - Out']);
const allowedOperations = new Set(['switch', 'switch + voltura', 'cambio listino', 'subentro']);
const allowedSupplyTypes = new Set(['luce', 'gas', 'dual']);
const allowedPaymentMethods = new Set(['bollettino', 'rid']);
const maxContractFiles = 10;
const maxContractFileSize = 15 * 1024 * 1024;
const baserowPageSize = 200;
const apiCacheTtlMs = Number(process.env.API_CACHE_TTL_MS || 15_000);
const allowedContractFileExtensions = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'odt',
  'ods',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
]);
const allowedContractFileTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const apiCache = new Map();
// ---- Sessioni persistenti su SQLite ----
class SqliteSessionStore {
  constructor(dbPath) {
    this._db = new Database(dbPath);
    this._db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        token     TEXT    PRIMARY KEY,
        agent_id  INTEGER NOT NULL,
        email     TEXT    NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);
    // Rimuovi sessioni scadute all'avvio
    this._db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());

    this._get = this._db.prepare(
      'SELECT agent_id, email, expires_at FROM sessions WHERE token = ?'
    );
    this._set = this._db.prepare(
      'INSERT OR REPLACE INTO sessions (token, agent_id, email, expires_at) VALUES (?, ?, ?, ?)'
    );
    this._delete = this._db.prepare('DELETE FROM sessions WHERE token = ?');
    this._touch = this._db.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?');
    this._cleanup = this._db.prepare('DELETE FROM sessions WHERE expires_at <= ?');
  }

  get(token) {
    const row = this._get.get(token);
    if (!row) return undefined;
    return { agentId: row.agent_id, email: row.email, expiresAt: row.expires_at };
  }

  set(token, session) {
    this._set.run(token, session.agentId, session.email, session.expiresAt);
  }

  delete(token) {
    this._delete.run(token);
  }

  touch(token, expiresAt) {
    this._touch.run(expiresAt, token);
  }

  cleanup() {
    return this._cleanup.run(Date.now()).changes;
  }
}

const sessionDbPath = process.env.SESSION_DB_PATH || path.join(__dirname, 'sessions.db');
const sessions = new SqliteSessionStore(sessionDbPath);
const sessionCookieName = 'crm_session';

// Pulizia sessioni scadute ogni ora
setInterval(
  () => {
    const removed = sessions.cleanup();
    if (removed > 0) console.log(`[sessions] rimosse ${removed} sessioni scadute`);
  },
  60 * 60 * 1000
).unref();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'TOO_MANY_ATTEMPTS',
    message: 'Troppi tentativi di accesso. Riprova tra 15 minuti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const apiReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Troppe richieste. Riprova tra un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxContractFileSize,
    files: maxContractFiles,
  },
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // 'unsafe-inline' necessario per colori dinamici dei grafici (inline style nei legend dot)
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// HTTPS redirect in produzione (dietro reverse proxy: Nginx, Railway, Render, ecc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    ok: isConfigured(),
    service: 'crm-energia',
  });
});

app.get('/api/session', attachSession, async (req, res) => {
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
    handleApiError(res, error, 'SESSION_LOAD_FAILED', 'Sessione non valida.');
  }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    ensureConfigured();

    const email = cleanText(req.body.email).toLowerCase();
    const password = cleanText(req.body.password);

    if (!email || !password) {
      throw publicError(401, 'LOGIN_FAILED', 'Credenziali non valide.');
    }

    const agent = await getAgentByEmail(email);
    const passwordOk = agent.passwordHash
      ? await bcrypt.compare(password, agent.passwordHash)
      : false;

    if (!passwordOk) {
      throw publicError(401, 'LOGIN_FAILED', 'Credenziali non valide.');
    }

    if (!agent.attivo) {
      throw publicError(403, 'AGENT_DISABLED', 'Agente non attivo.');
    }

    const rememberMe = Boolean(req.body.rememberMe);
    const ttl = rememberMe ? REMEMBER_ME_TTL_MS : CONFIG.sessionTtlMs;
    const { token } = createSession(agent.id, email, ttl);
    setSessionCookie(res, token, ttl);
    res.json({ authenticated: true, agent: publicAgent(agent) });
  } catch (error) {
    handleApiError(res, error, 'LOGIN_FAILED', 'Accesso non riuscito.');
  }
});

app.post('/api/logout', attachSession, (req, res) => {
  if (req.sessionToken) {
    sessions.delete(req.sessionToken);
  }
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/agent', requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const agent = await getCurrentAgent(req.session.agentId);
    res.json(agent);
  } catch (error) {
    handleApiError(res, error, 'AGENT_LOAD_FAILED', "Impossibile caricare l'agente.");
  }
});

app.get('/api/contracts', apiReadLimiter, requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const cacheKey = contractsCacheKey(req.session.agentId);
    const contracts = await getCached(cacheKey, () => listContracts(req.session.agentId));
    res.json(contracts);
  } catch (error) {
    handleApiError(res, error, 'CONTRACTS_LOAD_FAILED', 'Impossibile caricare i contratti.');
  }
});

app.post(
  '/api/contracts',
  requireAuth,
  upload.array('fileContratto', maxContractFiles),
  async (req, res) => {
    try {
      ensureConfigured();
      const currentUser = await getCurrentAgent(req.session.agentId);
      const saveMode = normalizeContractSaveMode(req.body.mode || req.body.saveMode);
      const contract = sanitizeContractInput(req.body, { allowDraft: saveMode === 'draft' });
      const requestedAgentId = Number.parseInt(cleanText(req.body.agenteId), 10);
      const assignedAgentId =
        currentUser.ruolo === 'admin' && Number.isInteger(requestedAgentId) && requestedAgentId > 0
          ? requestedAgentId
          : req.session.agentId;
      const assignedAgent = await getCurrentAgent(assignedAgentId);
      const files = Array.isArray(req.files) ? req.files : [];
      const uploadedFiles = await Promise.all(files.map(uploadContractFile));
      const payload = normalizeBaserowContractPayload({
        agente: [assignedAgent.id],
        data_inserimento: todayIsoDate(),
        ragione_sociale: contract.ragioneSociale,
        cellulare: contract.cellulare,
        tipo_cliente: contract.tipoCliente,
        categoria_cliente: contract.categoriaCliente,
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
        indirizzo_fatturazione: contract.indirizzoFatturazione,
        indirizzo_fornitura: contract.indirizzoFornitura,
        descrizione: contract.descrizione,
        stato_contratto: saveMode === 'draft' ? 'Bozza' : 'Caricato',
        data_inizio_fornitura: contract.dataInizioFornitura,
        cb_unitaria_snapshot: assignedAgent.cbUnitaria,
      });

      if (contract.idContratto) {
        payload.id_contratto = contract.idContratto;
      }

      if (uploadedFiles.length) {
        payload.file_contratto = uploadedFiles.map((uploadedFile, index) => ({
          name: uploadedFile.name,
          visible_name: files[index].originalname,
        }));
      }

      const created = await createBaserowContract(payload);
      invalidateContractsCache(assignedAgent.id);
      invalidateAdminStatsCache();
      res.status(201).json(normalizeContract(created));
    } catch (error) {
      handleApiError(res, error, 'CONTRACT_NOT_SAVED', 'Contratto non salvato.');
    }
  }
);

app.patch(
  '/api/contracts/:id',
  requireAuth,
  upload.array('fileContratto', maxContractFiles),
  async (req, res) => {
    try {
      ensureConfigured();
      const contractId = Number(req.params.id);
      if (!Number.isInteger(contractId) || contractId <= 0) {
        throw publicError(400, 'INVALID_CONTRACT_ID', 'Contratto non valido.');
      }

      const currentUser = await getCurrentAgent(req.session.agentId);
      const existing = await getBaserowContract(contractId);
      const existingNormalized = normalizeContract(existing);
      const existingAgentId = Number(linkedAgentId(existing.agente)) || req.session.agentId;

      if (currentUser.ruolo !== 'admin' && existingAgentId !== req.session.agentId) {
        throw publicError(403, 'CONTRACT_FORBIDDEN', 'Contratto non accessibile.');
      }

      const saveMode = normalizeContractSaveMode(req.body.mode || req.body.saveMode);
      const contract = sanitizeContractInput(req.body, { allowDraft: saveMode === 'draft' });
      const requestedAgentId = Number.parseInt(cleanText(req.body.agenteId), 10);
      const assignedAgentId =
        currentUser.ruolo === 'admin' && Number.isInteger(requestedAgentId) && requestedAgentId > 0
          ? requestedAgentId
          : existingAgentId;
      const assignedAgent = await getCurrentAgent(assignedAgentId);
      const files = Array.isArray(req.files) ? req.files : [];
      const uploadedFiles = await Promise.all(files.map(uploadContractFile));
      const retainedFileNames = normalizeRetainedFileNames(req.body.retainedFileName);
      const preservedFiles = fileValue(existing.file_contratto)
        .filter((file) => retainedFileNames.includes(file.name))
        .map((file) => ({
          name: file.name,
          visible_name: file.visibleName || file.name,
        }));
      const nextStatus =
        saveMode === 'draft'
          ? 'Bozza'
          : existingNormalized.statoContratto === 'Bozza'
            ? 'Caricato'
            : existingNormalized.statoContratto;

      const payload = normalizeBaserowContractPayload({
        agente: [assignedAgent.id],
        ragione_sociale: contract.ragioneSociale,
        cellulare: contract.cellulare,
        tipo_cliente: contract.tipoCliente,
        categoria_cliente: contract.categoriaCliente,
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
        indirizzo_fatturazione: contract.indirizzoFatturazione,
        indirizzo_fornitura: contract.indirizzoFornitura,
        descrizione: contract.descrizione,
        stato_contratto: nextStatus,
        data_inizio_fornitura: contract.dataInizioFornitura,
        cb_unitaria_snapshot: assignedAgent.cbUnitaria,
        id_contratto: contract.idContratto,
      });

      if (preservedFiles.length || uploadedFiles.length) {
        payload.file_contratto = [
          ...preservedFiles,
          ...uploadedFiles.map((uploadedFile, index) => ({
            name: uploadedFile.name,
            visible_name: files[index].originalname,
          })),
        ];
      }

      const updated = await updateBaserowContract(contractId, payload);
      invalidateContractsCache(existingAgentId);
      invalidateContractsCache(assignedAgent.id);
      invalidateAdminStatsCache();
      res.json(normalizeContract(updated));
    } catch (error) {
      handleApiError(res, error, 'CONTRACT_NOT_UPDATED', 'Contratto non aggiornato.');
    }
  }
);

app.delete('/api/contracts/:id', requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const contractId = Number(req.params.id);
    if (!Number.isInteger(contractId) || contractId <= 0) {
      throw publicError(400, 'INVALID_CONTRACT_ID', 'Contratto non valido.');
    }

    const currentUser = await getCurrentAgent(req.session.agentId);
    const existing = await getBaserowContract(contractId);
    const existingAgentId = Number(linkedAgentId(existing.agente)) || req.session.agentId;

    if (currentUser.ruolo !== 'admin' && existingAgentId !== req.session.agentId) {
      throw publicError(403, 'CONTRACT_FORBIDDEN', 'Contratto non accessibile.');
    }

    await deleteBaserowContract(contractId);
    invalidateContractsCache(existingAgentId);
    invalidateAdminStatsCache();
    res.json({ ok: true });
  } catch (error) {
    handleApiError(res, error, 'CONTRACT_NOT_DELETED', 'Contratto non eliminato.');
  }
});

app.patch('/api/contracts/:id/status', requireAuth, async (req, res) => {
  try {
    ensureConfigured();
    const contractId = Number(req.params.id);
    const status = normalizeStatus(req.body.status);

    if (!Number.isInteger(contractId) || contractId <= 0) {
      throw publicError(400, 'INVALID_CONTRACT_ID', 'Contratto non valido.');
    }

    if (!allowedStatuses.has(status)) {
      throw publicError(400, 'INVALID_STATUS', 'Stato contratto non valido.');
    }

    const existing = await getBaserowContract(contractId);
    if (!isCurrentAgentContract(existing, req.session.agentId)) {
      throw publicError(403, 'CONTRACT_FORBIDDEN', 'Contratto non accessibile.');
    }

    const updated = await updateBaserowContract(contractId, { stato_contratto: status });
    invalidateContractsCache(req.session.agentId);
    invalidateAdminStatsCache();
    res.json(normalizeContract(updated));
  } catch (error) {
    handleApiError(res, error, 'CONTRACT_STATUS_NOT_UPDATED', 'Stato contratto non aggiornato.');
  }
});

app.get('/api/admin/agents', apiReadLimiter, requireAdmin, async (req, res) => {
  try {
    ensureConfigured();
    const agents = await listAgents();
    res.json(agents);
  } catch (error) {
    handleApiError(res, error, 'ADMIN_AGENTS_LOAD_FAILED', 'Impossibile caricare gli agenti.');
  }
});

app.get('/api/admin/contracts', apiReadLimiter, requireAdmin, async (req, res) => {
  try {
    ensureConfigured();
    const contracts = await listAllContracts();
    res.json(contracts);
  } catch (error) {
    handleApiError(
      res,
      error,
      'ADMIN_CONTRACTS_LOAD_FAILED',
      'Impossibile caricare i contratti admin.'
    );
  }
});

app.post('/api/admin/agents', requireAdmin, async (req, res) => {
  try {
    ensureConfigured();
    const agent = sanitizeAgentInput(req.body, { requirePassword: true });
    const created = await createBaserowAgent(agentToBaserowPayload(agent));
    invalidateAdminStatsCache();
    res.status(201).json(publicAgent(normalizeAgent(created)));
  } catch (error) {
    handleApiError(res, error, 'ADMIN_AGENT_NOT_CREATED', 'Agente non creato.');
  }
});

app.patch('/api/admin/agents/:id', requireAdmin, async (req, res) => {
  try {
    ensureConfigured();
    const agentId = Number(req.params.id);
    if (!Number.isInteger(agentId) || agentId <= 0) {
      throw publicError(400, 'INVALID_AGENT_ID', 'Agente non valido.');
    }

    const agent = sanitizeAgentInput(req.body, { requirePassword: false });
    const updated = await updateBaserowAgent(agentId, agentToBaserowPayload(agent));
    invalidateAdminStatsCache();
    res.json(publicAgent(normalizeAgent(updated)));
  } catch (error) {
    handleApiError(res, error, 'ADMIN_AGENT_NOT_UPDATED', 'Agente non aggiornato.');
  }
});

app.patch('/api/admin/contracts/:id/sent', requireAdmin, async (req, res) => {
  try {
    ensureConfigured();
    const contractId = Number(req.params.id);
    const sent = Boolean(req.body.sent);

    if (!Number.isInteger(contractId) || contractId <= 0) {
      throw publicError(400, 'INVALID_CONTRACT_ID', 'Contratto non valido.');
    }

    const updated = await updateBaserowContract(contractId, {
      stato_contratto: sent ? 'Inviato' : 'Caricato',
    });
    invalidateAdminStatsCache();
    res.json(normalizeContract(updated));
  } catch (error) {
    handleApiError(res, error, 'ADMIN_CONTRACT_NOT_UPDATED', 'Stato contratto non aggiornato.');
  }
});

app.get('/api/admin/stats', apiReadLimiter, requireAdmin, async (req, res) => {
  try {
    ensureConfigured();
    const stats = await getCached(adminStatsCacheKey(), async () => {
      const [agents, contracts] = await Promise.all([listAgents(), listAllContracts()]);
      return buildAdminStats(agents, contracts);
    });
    res.json(stats);
  } catch (error) {
    handleApiError(res, error, 'ADMIN_STATS_LOAD_FAILED', 'Statistiche non disponibili.');
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API_NOT_FOUND',
    message: 'Endpoint non disponibile.',
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Volt CRM avviato su http://localhost:${PORT}`);
    if (!isConfigured()) {
      console.warn('Configurazione Baserow incompleta. Controlla il file .env.');
    }
  });
}

module.exports = {
  app,
  agentToBaserowPayload,
  SqliteSessionStore,
  buildAdminStats,
  cleanText,
  contractCommissionValue,
  contractUnitCount,
  createSession,
  fetchAllRows,
  fileValue,
  getCachedWithStore,
  handleApiError,
  integerValue,
  invalidateAdminStatsCache,
  invalidateContractsCache,
  isCurrentAgentContract,
  isAllowedContractFile,
  isValidVatOrFiscalCode,
  linkedAgentId,
  multiSelectValue,
  normalizeAgent,
  normalizeContract,
  normalizeStatus,
  numberValue,
  publicError,
  publicAgent,
  sanitizeAgentInput,
  sanitizeContractInput,
  selectValue,
  todayIsoDate,
};

function isConfigured() {
  return Boolean(CONFIG.baserowToken && CONFIG.agentiTableId && CONFIG.contrattiTableId);
}

function ensureConfigured() {
  if (!isConfigured()) {
    throw publicError(503, 'BASEROW_NOT_CONFIGURED', 'Baserow non configurato.');
  }
}

function requireAuth(req, res, next) {
  attachSession(req, res, () => {
    if (!req.session) {
      res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: 'Accesso richiesto.',
      });
      return;
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const agent = await getCurrentAgent(req.session.agentId);
      if (agent.ruolo !== 'admin') {
        res.status(403).json({
          error: 'ADMIN_REQUIRED',
          message: 'Permesso admin richiesto.',
        });
        return;
      }
      req.agent = agent;
      next();
    } catch (error) {
      handleApiError(res, error, 'ADMIN_CHECK_FAILED', 'Permesso admin non verificato.');
    }
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

  // Sliding expiry: se la sessione scade tra più di sessionTtlMs (= rememberMe),
  // mantieni il TTL lungo; altrimenti usa il default
  const remainingMs = session.expiresAt - Date.now();
  const ttl = remainingMs > CONFIG.sessionTtlMs ? REMEMBER_ME_TTL_MS : CONFIG.sessionTtlMs;
  const newExpiry = Date.now() + ttl;
  session.expiresAt = newExpiry;
  sessions.touch(token, newExpiry);
  req.session = session;
  req.sessionToken = token;
  next();
}

const REMEMBER_ME_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 giorni

function createSession(agentId, email, ttlMs) {
  const ttl = ttlMs || CONFIG.sessionTtlMs;
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    agentId,
    email,
    expiresAt: Date.now() + ttl,
  });
  return { token, ttl };
}

function setSessionCookie(res, token, ttlMs) {
  const maxAge = Math.floor((ttlMs || CONFIG.sessionTtlMs) / 1000);
  const secure = CONFIG.cookieSecure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`
  );
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${sessionCookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function getCookie(req, name) {
  const cookies = String(req.headers.cookie || '')
    .split(';')
    .map((item) => item.trim());
  const prefix = `${name}=`;
  const found = cookies.find((item) => item.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : '';
}

async function getCachedWithStore(store, key, loader, ttlMs, now = Date.now()) {
  const cached = store.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await loader();
  store.set(key, {
    value,
    expiresAt: now + ttlMs,
  });
  return value;
}

async function getCached(key, loader) {
  return getCachedWithStore(apiCache, key, loader, apiCacheTtlMs);
}

function invalidateCacheByPrefix(prefix) {
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
}

function contractsCacheKey(agentId) {
  return `contracts:${agentId}`;
}

function adminStatsCacheKey() {
  return 'admin:stats';
}

function invalidateContractsCache(agentId) {
  invalidateCacheByPrefix(`contracts:${agentId}`);
}

function invalidateAdminStatsCache() {
  apiCache.delete(adminStatsCacheKey());
}

async function baserowFetch(pathname, options = {}) {
  const response = await fetch(`${CONFIG.baserowBaseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Token ${CONFIG.baserowToken}`,
      'Content-Type': 'application/json',
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
    `/api/database/rows/table/${CONFIG.agentiTableId}/${agentId}/?user_field_names=true`
  );
  return publicAgent(normalizeAgent(row));
}

async function getAgentByEmail(email) {
  const params = new URLSearchParams({
    user_field_names: 'true',
    size: '1',
    filter_type: 'AND',
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [
        {
          field: 'email',
          type: 'equal',
          value: email,
        },
      ],
    }),
  });

  const data = await baserowFetch(
    `/api/database/rows/table/${CONFIG.agentiTableId}/?${params.toString()}`
  );
  const row = (data.results || [])[0];

  if (!row) {
    throw publicError(401, 'LOGIN_FAILED', 'Credenziali non valide.');
  }

  return normalizeAgent(row);
}

async function fetchAllRows(fetchPage, params, label, pageSize = baserowPageSize, maxPages = 100) {
  const rows = [];
  let page = 1;
  let totalCount = 0;

  while (true) {
    const pageParams = new URLSearchParams(params);
    const data = await fetchPage(pageParams, page, pageSize);
    const results = Array.isArray(data.results) ? data.results : [];
    totalCount = Number(data.count) || totalCount;
    rows.push(...results);

    if (!data.next || results.length === 0) {
      break;
    }

    page += 1;

    if (page > maxPages) {
      console.warn(
        `[BASEROW_PAGINATION] Interrotta paginazione ${label}: superate ${maxPages} pagine`
      );
      break;
    }
  }

  if (page > 1) {
    console.warn(
      `[BASEROW_PAGINATION] ${label}: caricate ${rows.length} righe su ${totalCount} totali in ${page} pagine`
    );
  }

  return rows;
}

async function fetchAllBaserowRows(tableId, params, label) {
  return fetchAllRows(
    async (pageParams, page, pageSize) => {
      pageParams.set('page', String(page));
      pageParams.set('size', String(pageSize));
      return baserowFetch(`/api/database/rows/table/${tableId}/?${pageParams.toString()}`);
    },
    params,
    label,
    baserowPageSize,
    100
  );
}

async function listContracts(agentId) {
  const params = new URLSearchParams({
    user_field_names: 'true',
    order_by: '-data_inserimento',
    filter_type: 'AND',
    filters: JSON.stringify({
      filter_type: 'AND',
      filters: [
        {
          field: CONFIG.contrattiAgenteField,
          type: 'link_row_has',
          value: String(agentId),
        },
      ],
    }),
  });

  const rows = await fetchAllBaserowRows(
    CONFIG.contrattiTableId,
    params,
    `contratti agente ${agentId}`
  );
  return rows.filter((row) => isCurrentAgentContract(row, agentId)).map(normalizeContract);
}

async function listAgents() {
  const params = new URLSearchParams({
    user_field_names: 'true',
    order_by: 'nome',
  });
  const rows = await fetchAllBaserowRows(CONFIG.agentiTableId, params, 'lista agenti');
  return rows.map((row) => publicAgent(normalizeAgent(row)));
}

async function listAllContracts() {
  const params = new URLSearchParams({
    user_field_names: 'true',
    order_by: '-data_inserimento',
  });
  const rows = await fetchAllBaserowRows(CONFIG.contrattiTableId, params, 'lista contratti admin');
  return rows.map(normalizeContract);
}

async function getBaserowContract(contractId) {
  return baserowFetch(
    `/api/database/rows/table/${CONFIG.contrattiTableId}/${contractId}/?user_field_names=true`
  );
}

async function createBaserowContract(payload) {
  return baserowFetch(
    `/api/database/rows/table/${CONFIG.contrattiTableId}/?user_field_names=true`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

async function updateBaserowContract(contractId, payload) {
  return baserowFetch(
    `/api/database/rows/table/${CONFIG.contrattiTableId}/${contractId}/?user_field_names=true`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

async function deleteBaserowContract(contractId) {
  const response = await fetch(
    `${CONFIG.baserowBaseUrl}/api/database/rows/table/${CONFIG.contrattiTableId}/${contractId}/?user_field_names=true`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${CONFIG.baserowToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Baserow API ${response.status}: ${body}`);
    error.status = response.status;
    throw error;
  }
}

async function createBaserowAgent(payload) {
  return baserowFetch(`/api/database/rows/table/${CONFIG.agentiTableId}/?user_field_names=true`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateBaserowAgent(agentId, payload) {
  return baserowFetch(
    `/api/database/rows/table/${CONFIG.agentiTableId}/${agentId}/?user_field_names=true`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

async function uploadContractFile(file) {
  if (!isAllowedContractFile(file)) {
    throw publicError(
      400,
      'FILE_TYPE_INVALID',
      'Carica solo PDF, documenti Office/OpenDocument o immagini.'
    );
  }

  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append('file', blob, file.originalname);

  const response = await fetch(`${CONFIG.baserowBaseUrl}/api/user-files/upload-file/`, {
    method: 'POST',
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

function sanitizeContractInput(input, { allowDraft = false } = {}) {
  const contract = {
    idContratto: cleanText(input.idContratto),
    ragioneSociale: cleanText(input.ragioneSociale),
    cellulare: cleanText(input.cellulare),
    tipoCliente: cleanText(input.tipoCliente),
    categoriaCliente: cleanText(input.categoriaCliente).toLowerCase(),
    fornitore: cleanText(input.fornitore),
    nomeOfferta: cleanText(input.nomeOfferta),
    tipoOperazione: normalizeOperations(input.tipoOperazione),
    tipoFornitura: cleanText(input.tipoFornitura).toLowerCase(),
    pod: cleanText(input.pod).toUpperCase(),
    pdr: cleanText(input.pdr),
    metodoPagamento: cleanText(input.metodoPagamento).toLowerCase(),
    iban: cleanText(input.iban).replace(/\s+/g, '').toUpperCase(),
    piva: cleanText(input.piva),
    email: cleanText(input.email).toLowerCase(),
    indirizzoFatturazione: cleanText(input.indirizzoFatturazione),
    indirizzoFornitura: cleanText(input.indirizzoFornitura),
    descrizione: cleanText(input.descrizione),
    dataInizioFornitura: cleanText(input.dataInizioFornitura),
  };

  if (allowDraft) {
    if (!contract.ragioneSociale && !contract.cellulare && !contract.email && !contract.piva) {
      throw publicError(
        400,
        'DRAFT_TOO_EMPTY',
        'Per salvare una bozza inserisci almeno cliente, cellulare, email o P.IVA.'
      );
    }
  }

  if (!allowDraft && !contract.ragioneSociale) {
    throw publicError(400, 'CUSTOMER_REQUIRED', 'Inserisci il cliente.');
  }

  if (!allowDraft && !contract.cellulare) {
    throw publicError(400, 'PHONE_REQUIRED', 'Inserisci il cellulare.');
  }

  if ((!allowDraft || contract.tipoCliente) && !allowedClientTypes.has(contract.tipoCliente)) {
    throw publicError(400, 'CLIENT_TYPE_INVALID', 'Tipo cliente non valido.');
  }

  if (
    (!allowDraft || contract.categoriaCliente) &&
    !allowedCustomerCategories.has(contract.categoriaCliente)
  ) {
    throw publicError(400, 'CUSTOMER_CATEGORY_INVALID', 'Categoria cliente non valida.');
  }

  if (!allowDraft && !contract.fornitore) {
    throw publicError(400, 'SUPPLIER_REQUIRED', 'Inserisci il fornitore.');
  }

  if (!allowDraft && !contract.nomeOfferta) {
    throw publicError(400, 'OFFER_REQUIRED', "Inserisci il nome dell'offerta.");
  }

  if (
    (!allowDraft && !contract.tipoOperazione.length) ||
    contract.tipoOperazione.some((operation) => !allowedOperations.has(operation))
  ) {
    throw publicError(400, 'OPERATION_INVALID', 'Tipo operazione non valido.');
  }

  if ((!allowDraft || contract.tipoFornitura) && !allowedSupplyTypes.has(contract.tipoFornitura)) {
    throw publicError(400, 'SUPPLY_TYPE_INVALID', 'Tipo fornitura non valido.');
  }

  if (
    !allowDraft &&
    (contract.tipoFornitura === 'luce' || contract.tipoFornitura === 'dual') &&
    !contract.pod
  ) {
    throw publicError(400, 'POD_REQUIRED', 'Inserisci il POD.');
  }

  if (
    !allowDraft &&
    (contract.tipoFornitura === 'gas' || contract.tipoFornitura === 'dual') &&
    !contract.pdr
  ) {
    throw publicError(400, 'PDR_REQUIRED', 'Inserisci il PDR.');
  }

  if (
    (!allowDraft || contract.metodoPagamento) &&
    !allowedPaymentMethods.has(contract.metodoPagamento)
  ) {
    throw publicError(400, 'PAYMENT_METHOD_INVALID', 'Metodo di pagamento non valido.');
  }

  if (!allowDraft && contract.metodoPagamento === 'rid' && !contract.iban) {
    throw publicError(400, 'IBAN_REQUIRED', "Inserisci l'IBAN.");
  }

  if (contract.iban && !/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(contract.iban)) {
    throw publicError(400, 'IBAN_INVALID', 'IBAN non valido.');
  }

  if (contract.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contract.email)) {
    throw publicError(400, 'EMAIL_INVALID', 'Email non valida.');
  }

  if (contract.piva && !isValidVatOrFiscalCode(contract.piva)) {
    throw publicError(
      400,
      'PIVA_INVALID',
      'Inserisci una P.IVA di 11 cifre o un codice fiscale valido.'
    );
  }

  return contract;
}

function sanitizeAgentInput(input, { requirePassword }) {
  const agent = {
    nome: cleanText(input.nome),
    email: cleanText(input.email).toLowerCase(),
    password: cleanText(input.password),
    cbUnitaria: numberValue(input.cbUnitaria),
    targetMensile: integerValue(input.targetMensile),
    targetTrimestrale: integerValue(input.targetTrimestrale),
    targetAnnuale: integerValue(input.targetAnnuale),
    ruolo: cleanText(input.ruolo).toLowerCase() || 'agente',
    attivo: Boolean(input.attivo),
  };

  if (!agent.nome) {
    throw publicError(400, 'AGENT_NAME_REQUIRED', 'Inserisci il nome agente.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agent.email)) {
    throw publicError(400, 'AGENT_EMAIL_INVALID', 'Email agente non valida.');
  }

  if (!['agente', 'admin'].includes(agent.ruolo)) {
    throw publicError(400, 'AGENT_ROLE_INVALID', 'Ruolo agente non valido.');
  }

  if (requirePassword && agent.password.length < 8) {
    throw publicError(400, 'AGENT_PASSWORD_REQUIRED', 'La password deve avere almeno 8 caratteri.');
  }

  if (!requirePassword && agent.password && agent.password.length < 8) {
    throw publicError(
      400,
      'AGENT_PASSWORD_INVALID',
      'La nuova password deve avere almeno 8 caratteri.'
    );
  }

  return agent;
}

function agentToBaserowPayload(agent) {
  const payload = {
    nome: agent.nome,
    email: agent.email,
    cb_unitaria: agent.cbUnitaria,
    target_mensile: agent.targetMensile,
    target_trimestrale: agent.targetTrimestrale,
    target_annuale: agent.targetAnnuale,
    ruolo: agent.ruolo,
    attivo: agent.attivo,
  };

  if (agent.password) {
    payload.password_hash = bcrypt.hashSync(
      agent.password,
      Number(process.env.BCRYPT_ROUNDS || 12)
    );
  }

  return payload;
}

function normalizeAgent(row) {
  return {
    id: row.id,
    nome: row.nome || 'Agente sconosciuto',
    email: row.email || '',
    cbUnitaria: numberValue(row.cb_unitaria),
    targetMensile: integerValue(row.target_mensile),
    targetTrimestrale: integerValue(row.target_trimestrale),
    targetAnnuale: integerValue(row.target_annuale),
    ruolo: selectValue(row.ruolo) || 'agente',
    attivo: row.attivo !== undefined ? Boolean(row.attivo) : true,
    passwordHash: row.password_hash || '',
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
  const status = selectValue(row.stato_contratto) || 'Caricato';
  const cbSnapshot = numberValue(row.cb_unitaria_snapshot);
  const cbMaturata =
    row.cb_maturata !== undefined
      ? numberValue(row.cb_maturata)
      : status === 'K.O.' || status === 'Switch - Out'
        ? 0
        : cbSnapshot;
  const normalized = {
    id: row.id,
    agenteId: linkedAgentId(row.agente),
    dataInserimento: row.data_inserimento || '',
    idContratto: row.id_contratto || '',
    ragioneSociale: row.ragione_sociale || '',
    cellulare: row.cellulare || '',
    tipoCliente: selectValue(row.tipo_cliente),
    categoriaCliente: selectValue(row.categoria_cliente),
    fornitore: row.fornitore || '',
    nomeOfferta: row.nome_offerta || '',
    tipoOperazione: multiSelectValue(row.tipo_operazione),
    tipoFornitura: selectValue(row.tipo_fornitura),
    pod: row.pod || '',
    pdr: row.pdr || '',
    metodoPagamento: selectValue(row.metodo_pagamento),
    iban: row.iban || '',
    fileContratto: fileValue(row.file_contratto),
    piva: row.piva || '',
    email: row.email || '',
    indirizzoFatturazione: row.indirizzo_fatturazione || '',
    indirizzoFornitura: row.indirizzo_fornitura || '',
    descrizione: row.descrizione || '',
    statoContratto: status,
    cbUnitariaSnapshot: cbSnapshot,
    cbMaturata,
    dataInizioFornitura: row.data_inizio_fornitura || '',
    meseRiferimento: row.mese_riferimento || '',
    trimestreRiferimento: row.trimestre_riferimento || '',
    annoRiferimento: row.anno_riferimento || '',
  };
  return {
    ...normalized,
    unitCount: contractUnitCount(normalized),
    commissionValue: contractCommissionValue(normalized),
  };
}

function isCurrentAgentContract(row, agentId) {
  if (Array.isArray(row.agente) && row.agente.length > 0) {
    return row.agente.some((agentRow) => Number(agentRow.id) === Number(agentId));
  }

  if (typeof row.agente === 'number' || typeof row.agente === 'string') {
    return Number(row.agente) === Number(agentId);
  }

  if (row.agente && typeof row.agente === 'object' && 'id' in row.agente) {
    return Number(row.agente.id) === Number(agentId);
  }

  return false;
}

function buildAdminStats(agents, contracts) {
  const month = currentMonthKey();
  const quarter = currentQuarterKey();
  const year = String(new Date().getFullYear());
  const operationalContracts = contracts.filter((contract) => contract.statoContratto !== 'Bozza');
  const monthlyContracts = operationalContracts.filter((contract) =>
    contract.dataInserimento.startsWith(month)
  );
  const quarterContracts = operationalContracts.filter(
    (contract) => contract.trimestreRiferimento === quarter
  );
  const yearContracts = operationalContracts.filter(
    (contract) => contract.annoRiferimento === year || contract.dataInserimento.startsWith(year)
  );
  const agentRows = agents.map((agent) => {
    const agentContracts = monthlyContracts.filter(
      (contract) => Number(contract.agenteId) === Number(agent.id)
    );
    const agentQuarterContracts = quarterContracts.filter(
      (contract) => Number(contract.agenteId) === Number(agent.id)
    );
    const agentYearContracts = yearContracts.filter(
      (contract) => Number(contract.agenteId) === Number(agent.id)
    );
    const ok = agentContracts.filter((contract) => contract.statoContratto === 'OK');
    const okTrimestre = agentQuarterContracts.filter(
      (contract) => contract.statoContratto === 'OK'
    );
    const okAnno = agentYearContracts.filter((contract) => contract.statoContratto === 'OK');
    const caricati = agentContracts.filter((contract) => contract.statoContratto === 'Caricato');
    const inviati = agentContracts.filter((contract) => contract.statoContratto === 'Inviato');
    const ko = agentContracts.filter((contract) => contract.statoContratto === 'K.O.');
    const switchOut = agentContracts.filter(
      (contract) => contract.statoContratto === 'Switch - Out'
    );
    const contractUnits = sumContractUnits(agentContracts);
    const okUnits = sumContractUnits(ok);
    const okTrimestreUnits = sumContractUnits(okTrimestre);
    const okAnnoUnits = sumContractUnits(okAnno);
    const caricatiUnits = sumContractUnits(caricati);
    const inviatiUnits = sumContractUnits(inviati);
    const koUnits = sumContractUnits(ko);
    const switchOutUnits = sumContractUnits(switchOut);
    const cbValidata = sumContractCommissions(ok);
    const cbPotenziale = sumContractCommissions([...ok, ...caricati, ...inviati]);

    return {
      id: agent.id,
      nome: agent.nome,
      email: agent.email,
      ruolo: agent.ruolo,
      attivo: agent.attivo,
      targetMensile: agent.targetMensile,
      targetTrimestrale: agent.targetTrimestrale,
      targetAnnuale: agent.targetAnnuale,
      pratiche: agentContracts.length,
      contratti: contractUnits,
      ok: okUnits,
      okTrimestre: okTrimestreUnits,
      okAnno: okAnnoUnits,
      caricati: caricatiUnits,
      inviati: inviatiUnits,
      ko: koUnits,
      switchOut: switchOutUnits,
      cbValidata,
      cbPotenziale,
      percentualeTargetMensile: percent(okUnits, agent.targetMensile),
      percentualeTargetTrimestrale: percent(okTrimestreUnits, agent.targetTrimestrale),
      percentualeTargetAnnuale: percent(okAnnoUnits, agent.targetAnnuale),
    };
  });

  return {
    month,
    quarter,
    year,
    totals: {
      practices: monthlyContracts.length,
      contracts: sumContractUnits(monthlyContracts),
      ok: sumContractUnits(monthlyContracts.filter((contract) => contract.statoContratto === 'OK')),
      caricati: sumContractUnits(
        monthlyContracts.filter((contract) => contract.statoContratto === 'Caricato')
      ),
      inviati: sumContractUnits(
        monthlyContracts.filter((contract) => contract.statoContratto === 'Inviato')
      ),
      ko: sumContractUnits(
        monthlyContracts.filter((contract) => contract.statoContratto === 'K.O.')
      ),
      switchOut: sumContractUnits(
        monthlyContracts.filter((contract) => contract.statoContratto === 'Switch - Out')
      ),
      cbValidata: monthlyContracts
        .filter((contract) => contract.statoContratto === 'OK')
        .reduce((sum, contract) => sum + contractCommissionValue(contract), 0),
      cbPotenziale: monthlyContracts
        .filter((contract) => ['OK', 'Caricato', 'Inviato'].includes(contract.statoContratto))
        .reduce((sum, contract) => sum + contractCommissionValue(contract), 0),
    },
    agents: agentRows,
  };
}

function currentMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function currentQuarterKey() {
  const date = new Date();
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

function percent(done, target) {
  return target ? Math.min(Math.round((done / target) * 100), 100) : 0;
}

function contractUnitCount(contract) {
  if (Number.isFinite(Number(contract.unitCount)) && Number(contract.unitCount) > 0) {
    return Number(contract.unitCount);
  }
  const supplyType = cleanText(contract.tipoFornitura).toLowerCase();
  const customerCategory = cleanText(contract.categoriaCliente).toLowerCase();
  return supplyType === 'dual' && customerCategory === 'prospect' ? 2 : 1;
}

function sumContractUnits(items) {
  return items.reduce((sum, contract) => sum + contractUnitCount(contract), 0);
}

function contractCommissionValue(contract) {
  if (Number.isFinite(Number(contract.commissionValue)) && Number(contract.commissionValue) >= 0) {
    return Number(contract.commissionValue);
  }
  return numberValue(contract.cbMaturata) * contractUnitCount(contract);
}

function sumContractCommissions(items) {
  return items.reduce((sum, contract) => sum + contractCommissionValue(contract), 0);
}

function isAllowedContractFile(file) {
  const extension = path
    .extname(file.originalname || '')
    .slice(1)
    .toLowerCase();
  return (
    allowedContractFileExtensions.has(extension) || allowedContractFileTypes.has(file.mimetype)
  );
}

function isValidVatOrFiscalCode(value) {
  const normalized = cleanText(value).replace(/\s+/g, '').toUpperCase();
  return /^\d{11}$/.test(normalized) || /^[A-Z0-9]{16}$/.test(normalized);
}

function linkedAgentId(value) {
  if (Array.isArray(value) && value.length > 0) return value[0].id;
  if (value && typeof value === 'object' && 'id' in value) return value.id;
  return value || null;
}

function selectValue(value) {
  if (value && typeof value === 'object' && 'value' in value) return value.value;
  return value || '';
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
        name: file.name || '',
        visibleName: file.visible_name || file.name || '',
        url: file.url || '',
        mimeType: file.mime_type || '',
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
  const status = cleanText(value);
  // Se è uno dei nostri nuovi stati esatti, lo restituiamo tal quale.
  // Altrimenti, proviamo a mapparlo o restituiamo Caricato come default.
  if (allowedStatuses.has(status)) return status;

  const map = {
    bozza: 'Bozza',
    validato: 'OK',
    inviato: 'Inviato',
    'in attesa': 'Caricato',
    scartato: 'K.O.',
  };
  return map[status.toLowerCase()] || 'Caricato';
}

function normalizeContractSaveMode(value) {
  return cleanText(value).toLowerCase() === 'draft' ? 'draft' : 'submit';
}

function normalizeRetainedFileNames(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }
  const single = cleanText(value);
  return single ? [single] : [];
}

function normalizeBaserowContractPayload(payload) {
  const normalized = { ...payload };

  ['tipo_cliente', 'categoria_cliente', 'tipo_fornitura', 'metodo_pagamento'].forEach((field) => {
    if (normalized[field] === '') {
      normalized[field] = null;
    }
  });

  if (normalized.data_inizio_fornitura === '') {
    normalized.data_inizio_fornitura = null;
  }

  return normalized;
}

function cleanText(value) {
  return String(value || '').trim();
}

function normalizeOperations(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map((item) => cleanText(item).toLowerCase()).filter(Boolean);
}

function todayIsoDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function publicError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.publicMessage = message;
  return error;
}

function handleApiError(res, error, code, message) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: 'FILE_TOO_LARGE',
      message: 'Ogni documento non deve superare 15 MB.',
    });
    return;
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    res.status(400).json({
      error: 'TOO_MANY_FILES',
      message: `Puoi caricare al massimo ${maxContractFiles} documenti.`,
    });
    return;
  }

  if (!error.publicMessage) {
    console.error(`[${code}]`, error.message);
  }

  res.status(error.status || 500).json({
    error: error.code || code,
    message: error.publicMessage || message,
  });
}
