let agent = {
  id: 1,
  nome: "Marco Bianchi",
  cbUnitaria: 85,
  targetMensile: 28,
  targetTrimestrale: 84,
  targetAnnuale: 320,
};

const defaultContracts = [
  {
    id: 1,
    agenteId: 1,
    dataInserimento: "2026-04-02",
    ragioneSociale: "Rossi Impianti SRL",
    cellulare: "+39 333 120 4501",
    tipoCliente: "Business",
    piva: "03849270121",
    email: "info@rossiimpianti.it",
    indirizzo: "Via Roma 12, Milano",
    indirizzoFatturazione: "Via Roma 12, Milano",
    indirizzoFornitura: "Via Industria 7, Milano",
    descrizione: "Cliente business con doppia fornitura.",
    statoContratto: "validato",
    cbMaturata: 85,
  },
  {
    id: 2,
    agenteId: 1,
    dataInserimento: "2026-04-04",
    ragioneSociale: "Studio Verdi",
    cellulare: "+39 349 882 1044",
    tipoCliente: "Business",
    piva: "01923440982",
    email: "amministrazione@studioverdi.it",
    indirizzo: "Corso Italia 41, Torino",
    indirizzoFatturazione: "Corso Italia 41, Torino",
    indirizzoFornitura: "Corso Italia 41, Torino",
    descrizione: "",
    statoContratto: "in attesa",
    cbMaturata: 85,
  },
  {
    id: 3,
    agenteId: 1,
    dataInserimento: "2026-04-06",
    ragioneSociale: "Laura Neri",
    cellulare: "+39 347 221 0034",
    tipoCliente: "Privato",
    piva: "",
    email: "laura.neri@email.it",
    indirizzo: "Via Manzoni 8, Pavia",
    indirizzoFatturazione: "Via Manzoni 8, Pavia",
    indirizzoFornitura: "Via Manzoni 8, Pavia",
    descrizione: "",
    statoContratto: "validato",
    cbMaturata: 85,
  },
  {
    id: 4,
    agenteId: 1,
    dataInserimento: "2026-04-07",
    ragioneSociale: "Condominio Aurora",
    cellulare: "+39 02 8899 1200",
    tipoCliente: "Condominio",
    piva: "09777130159",
    email: "aurora@amministrazioni.it",
    indirizzo: "Via Piave 22, Monza",
    indirizzoFatturazione: "Via Piave 22, Monza",
    indirizzoFornitura: "Via Piave 22, Monza",
    descrizione: "Documenti incompleti.",
    statoContratto: "scartato",
    cbMaturata: 0,
  },
  {
    id: 5,
    agenteId: 1,
    dataInserimento: "2026-04-09",
    ragioneSociale: "Market Sole SNC",
    cellulare: "+39 331 771 4540",
    tipoCliente: "Business",
    piva: "02900341209",
    email: "marketsole@email.it",
    indirizzo: "Piazza Garibaldi 3, Novara",
    indirizzoFatturazione: "Piazza Garibaldi 3, Novara",
    indirizzoFornitura: "Piazza Garibaldi 3, Novara",
    descrizione: "",
    statoContratto: "in attesa",
    cbMaturata: 85,
  },
  {
    id: 6,
    agenteId: 1,
    dataInserimento: "2026-03-12",
    ragioneSociale: "Gianni Costa",
    cellulare: "+39 348 900 1180",
    tipoCliente: "Privato",
    piva: "",
    email: "gianni@email.it",
    indirizzo: "Via Dante 14, Como",
    indirizzoFatturazione: "Via Dante 14, Como",
    indirizzoFornitura: "Via Dante 14, Como",
    descrizione: "",
    statoContratto: "validato",
    cbMaturata: 85,
  },
  {
    id: 7,
    agenteId: 1,
    dataInserimento: "2026-02-18",
    ragioneSociale: "Bar Centrale",
    cellulare: "+39 331 440 9021",
    tipoCliente: "Business",
    piva: "08111230963",
    email: "barcentrale@email.it",
    indirizzo: "Via Milano 90, Lecco",
    indirizzoFatturazione: "Via Milano 90, Lecco",
    indirizzoFornitura: "Via Milano 90, Lecco",
    descrizione: "",
    statoContratto: "validato",
    cbMaturata: 85,
  },
];

const storageKey = "energia-crm-contracts";
let contracts = [];

const pages = {
  dashboard: "Dashboard",
  "new-contract": "Nuovo contratto",
  contracts: "Contratti",
  cb: "CB",
  progress: "Avanzamento",
};

const statusColors = {
  validato: "#15803d",
  "in attesa": "#b7791f",
  scartato: "#c2410c",
};

const today = new Date();
const currentMonthKey = monthKey(today);
const isStaticFileMode = window.location.protocol === "file:";
const demoFallbackEnabled = Boolean(CONFIG.ENABLE_DEMO_FALLBACK || isStaticFileMode);
const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const formatDate = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatMonth = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });

document.getElementById("agent-name").textContent = agent.nome;
document.getElementById("current-period").textContent = capitalize(formatMonth.format(today));
setConnectionStatus("loading", "Connessione...");
setAppLoading(true);
setAuthLocked(true);

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setActivePage(button.dataset.page));
});

document.querySelectorAll("[data-go-page]").forEach((button) => {
  button.addEventListener("click", () => setActivePage(button.dataset.goPage));
});

document.getElementById("login-form").addEventListener("submit", handleLogin);
document.getElementById("logout-button").addEventListener("click", handleLogout);

document.getElementById("close-contract-modal").addEventListener("click", closeContractModal);
document.getElementById("contract-modal").addEventListener("click", (event) => {
  if (event.target.id === "contract-modal") closeContractModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeContractModal();
});

document.getElementById("contract-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const draft = buildContractDraft(form);
  const submitBtn = formElement.querySelector('button[type="submit"]');
  const feedback = document.getElementById("save-feedback");

  if (!draft.ragioneSociale || !draft.cellulare || !draft.tipoCliente) {
    setFormFeedback("error", "Compila cliente, cellulare e tipo cliente.");
    return;
  }

  submitBtn.disabled = true;
  setFormFeedback("saving", "Salvataggio in corso...");

  if (typeof baserowClient !== "undefined" && baserowClient.isConfigured()) {
    try {
      await baserowClient.createContract({
        ragioneSociale: draft.ragioneSociale,
        cellulare: draft.cellulare,
        tipoCliente: draft.tipoCliente,
        piva: draft.piva,
        email: draft.email,
        indirizzo: draft.indirizzo,
        indirizzoFatturazione: draft.indirizzoFatturazione,
        indirizzoFornitura: draft.indirizzoFornitura,
        descrizione: draft.descrizione,
      });
      contracts = await baserowClient.listContracts();
      setFormFeedback("success", "Contratto salvato nel database.");
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      setFormFeedback("error", "Contratto non salvato. I dati sono ancora qui.");
      return;
    }
  } else if (demoFallbackEnabled) {
    contracts.unshift(draft);
    saveContracts();
    setFormFeedback("success", "Contratto salvato in modalità demo.");
  } else {
    submitBtn.disabled = false;
    setFormFeedback("error", "Connessione non disponibile. Contratto non salvato.");
    return;
  }

  submitBtn.disabled = false;
  formElement.reset();
  formElement.elements.agente.value = agent.nome;
  formElement.elements.statoContratto.value = "in attesa";
  renderAll();
  setTimeout(() => setActivePage("contracts"), 350);
});

["search-input", "month-filter", "status-filter"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderContractsTable);
});

function loadContracts() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(stored) ? stored : defaultContracts;
  } catch {
    return defaultContracts;
  }
}

function saveContracts() {
  localStorage.setItem(storageKey, JSON.stringify(contracts));
}

function setActivePage(pageId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.toggle("active", page.id === pageId));
  document.querySelectorAll(".nav-item").forEach((item) => {
    const isActive = item.dataset.page === pageId;
    item.classList.toggle("active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
  document.getElementById("page-title").textContent = pages[pageId];
}

function currentMonthContracts() {
  return contracts.filter((contract) => contract.dataInserimento.startsWith(currentMonthKey));
}

function getSummary() {
  const monthly = currentMonthContracts();
  const validati = monthly.filter((contract) => contract.statoContratto === "validato");
  const attesa = monthly.filter((contract) => contract.statoContratto === "in attesa");
  const scartati = monthly.filter((contract) => contract.statoContratto === "scartato");
  const cbValidata = validati.reduce((sum, contract) => sum + contract.cbMaturata, 0);
  const cbPotenziale = [...validati, ...attesa].reduce((sum, contract) => sum + contract.cbMaturata, 0);
  const mancanti = Math.max(agent.targetMensile - validati.length, 0);
  const targetPercent = Math.min(Math.round((validati.length / agent.targetMensile) * 100), 100);

  return { monthly, validati, attesa, scartati, cbValidata, cbPotenziale, mancanti, targetPercent };
}

function renderMetrics(containerId, metrics) {
  document.getElementById(containerId).innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
        </article>
      `,
    )
    .join("");
}

function renderDashboard() {
  const summary = getSummary();
  renderMetrics("dashboard-metrics", [
    { label: "Contratti inseriti", value: summary.monthly.length },
    { label: "Contratti validati", value: summary.validati.length },
    { label: "Contratti scartati", value: summary.scartati.length },
    { label: "CB maturata", value: euro.format(summary.cbValidata) },
    { label: "CB potenziale", value: euro.format(summary.cbPotenziale) },
    { label: "Target mensile", value: agent.targetMensile },
    { label: "Manca al target", value: summary.mancanti },
    { label: "In attesa", value: summary.attesa.length },
  ]);

  renderDonut(summary);
  document.getElementById("target-percent").textContent = `${summary.targetPercent}%`;
  document.getElementById("target-copy").textContent = `${summary.validati.length} di ${agent.targetMensile}`;
  document.getElementById("target-bar").style.width = `${summary.targetPercent}%`;
  document.getElementById("dashboard-motivation").textContent =
    summary.mancanti === 0
      ? "Target mensile raggiunto. Ora ogni contratto alza la CB."
      : `Ti mancano ${summary.mancanti} contratti validati per chiudere il target.`;
  renderLineChart();
  renderBarChart();
}

function renderDonut(summary) {
  const total = Math.max(summary.monthly.length, 1);
  const validatoEnd = (summary.validati.length / total) * 100;
  const attesaEnd = validatoEnd + (summary.attesa.length / total) * 100;
  document.getElementById("donut-chart").style.background =
    `conic-gradient(${statusColors.validato} 0 ${validatoEnd}%, ${statusColors["in attesa"]} ${validatoEnd}% ${attesaEnd}%, ${statusColors.scartato} ${attesaEnd}% 100%)`;

  document.getElementById("status-legend").innerHTML = [
    ["Validati", summary.validati.length, statusColors.validato],
    ["In attesa", summary.attesa.length, statusColors["in attesa"]],
    ["Scartati", summary.scartati.length, statusColors.scartato],
  ]
    .map(
      ([label, value, color]) => `
        <div class="legend-row">
          <span><i class="legend-dot" style="background:${color}"></i>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderLineChart() {
  const monthContracts = currentMonthContracts();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const step = Math.max(Math.ceil(daysInMonth / 12), 1);
  const days = Array.from(new Set([1, ...range(step, daysInMonth, step), daysInMonth])).sort((a, b) => a - b);
  const maxCount = Math.max(monthContracts.length, 1);
  const points = days.map((day, index) => {
    const cumulative = monthContracts.filter((contract) => Number(contract.dataInserimento.slice(-2)) <= day).length;
    return {
      x: 32 + index * (590 / Math.max(days.length - 1, 1)),
      y: 200 - (cumulative / maxCount) * 160,
    };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  document.getElementById("line-chart").innerHTML = `
    <svg viewBox="0 0 650 230" role="img" aria-label="Andamento cumulato contratti del mese">
      <line x1="30" y1="200" x2="625" y2="200" stroke="#dce3ea" />
      <line x1="30" y1="20" x2="30" y2="200" stroke="#dce3ea" />
      <path d="${path}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#0f766e" />`).join("")}
    </svg>
  `;
}

function renderBarChart() {
  const monthValues = getRecentMonths(4).map((key) => {
    const date = dateFromMonthKey(key);
    const label = capitalize(new Intl.DateTimeFormat("it-IT", { month: "short" }).format(date)).replace(".", "");
    const value = contracts.filter((contract) => contract.dataInserimento.startsWith(key) && contract.statoContratto === "validato").length;
    return [label, value, key === currentMonthKey];
  });
  const max = Math.max(...monthValues.map((value) => value[1]), 1);

  document.getElementById("bar-chart").innerHTML = `
    <svg viewBox="0 0 420 230" role="img" aria-label="Confronto contratti validati per mese">
      ${monthValues
        .map(([label, value, isCurrent], index) => {
          const height = (value / max) * 150;
          const x = 40 + index * 90;
          return `
            <rect x="${x}" y="${190 - height}" width="54" height="${height}" rx="6" fill="${isCurrent ? "#2563eb" : "#0f766e"}" />
            <text x="${x + 27}" y="214" text-anchor="middle" fill="#667085" font-size="14">${label}</text>
            <text x="${x + 27}" y="${178 - height}" text-anchor="middle" fill="#18202a" font-size="14" font-weight="700">${value}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function renderContractsTable() {
  const search = document.getElementById("search-input").value.toLowerCase().trim();
  const month = document.getElementById("month-filter").value;
  const status = document.getElementById("status-filter").value;

  const filtered = contracts.filter((contract) => {
    const matchesSearch = [contract.ragioneSociale, contract.cellulare, contract.email, contract.piva]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesMonth = month === "all" || contract.dataInserimento.startsWith(month);
    const matchesStatus = status === "all" || contract.statoContratto === status;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const table = document.getElementById("contracts-table");
  const tableWrap = table.closest(".table-wrap");
  const emptyState = document.getElementById("contracts-empty");

  table.innerHTML = filtered.map(contractRow).join("");
  table.querySelectorAll("[data-contract-id]").forEach((row) => {
    row.addEventListener("click", () => openContractModal(Number(row.dataset.contractId)));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openContractModal(Number(row.dataset.contractId));
      }
    });
  });
  tableWrap.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length > 0;
}

function contractRow(contract) {
  return `
    <tr data-contract-id="${contract.id}" tabindex="0" aria-label="Apri dettaglio contratto ${escapeHtml(contract.ragioneSociale)}">
      <td data-label="Cliente"><strong>${escapeHtml(contract.ragioneSociale)}</strong></td>
      <td data-label="Data">${formatDate.format(new Date(contract.dataInserimento))}</td>
      <td data-label="Stato">${statusBadge(contract.statoContratto)}</td>
      <td data-label="Tipo">${escapeHtml(contract.tipoCliente)}</td>
      <td data-label="CB">${euro.format(contract.cbMaturata)}</td>
      <td data-label="Telefono">${escapeHtml(contract.cellulare)}</td>
    </tr>
  `;
}

function openContractModal(contractId) {
  const contract = contracts.find((item) => item.id === contractId);
  if (!contract) return;

  document.getElementById("contract-detail-title").textContent = contract.ragioneSociale || "Contratto";
  document.getElementById("contract-detail-content").innerHTML = [
    detailItem("Cliente", contract.ragioneSociale),
    detailItem("Stato", capitalize(contract.statoContratto)),
    detailItem("Data inserimento", formatDate.format(new Date(contract.dataInserimento))),
    detailItem("Tipo cliente", contract.tipoCliente),
    detailItem("CB", euro.format(contract.cbMaturata)),
    detailItem("Cellulare", contract.cellulare),
    detailItem("Email", contract.email || "Non inserita"),
    detailItem("P.IVA", contract.piva || "Non inserita"),
    detailItem("Indirizzo", contract.indirizzo || "Non inserito", true),
    detailItem("Indirizzo fatturazione", contract.indirizzoFatturazione || "Non inserito", true),
    detailItem("Indirizzo fornitura", contract.indirizzoFornitura || "Non inserito", true),
    detailItem("Note", contract.descrizione || "Nessuna nota", true),
  ].join("");

  document.getElementById("contract-modal").hidden = false;
  document.getElementById("close-contract-modal").focus();
}

function closeContractModal() {
  const modal = document.getElementById("contract-modal");
  if (modal.hidden) return;
  modal.hidden = true;
}

function detailItem(label, value, full = false) {
  return `
    <div class="detail-item ${full ? "full" : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function statusBadge(status) {
  return `<span class="badge ${status.replace(" ", "-")}">${capitalize(status)}</span>`;
}

function renderCbPage() {
  const summary = getSummary();
  renderMetrics("cb-metrics", [
    { label: "CB del mese", value: euro.format(summary.cbPotenziale) },
    { label: "CB validata", value: euro.format(summary.cbValidata) },
    { label: "CB in attesa", value: euro.format(summary.attesa.length * agent.cbUnitaria) },
    { label: "Validati", value: summary.validati.length },
    { label: "In attesa", value: summary.attesa.length },
    { label: "Scartati", value: summary.scartati.length },
  ]);

  const table = document.getElementById("cb-table");
  const tableWrap = table.closest(".table-wrap");
  const emptyState = document.getElementById("cb-empty");

  table.innerHTML = summary.monthly
    .map(
      (contract) => `
        <tr>
          <td data-label="Cliente"><strong>${escapeHtml(contract.ragioneSociale)}</strong></td>
          <td data-label="Stato">${statusBadge(contract.statoContratto)}</td>
          <td data-label="CB">${euro.format(contract.cbMaturata)}</td>
          <td data-label="Data">${formatDate.format(new Date(contract.dataInserimento))}</td>
        </tr>
      `,
    )
    .join("");
  tableWrap.hidden = summary.monthly.length === 0;
  emptyState.hidden = summary.monthly.length > 0;
}

function renderProgressPage() {
  const summary = getSummary();
  const quarterKey = getQuarterKey(today);
  const yearKey = String(today.getFullYear());
  const quarterDone = contracts.filter(
    (contract) => getQuarterKey(new Date(contract.dataInserimento)) === quarterKey && contract.statoContratto === "validato",
  ).length;
  const yearDone = contracts.filter(
    (contract) => contract.dataInserimento.startsWith(yearKey) && contract.statoContratto === "validato",
  ).length;
  const daysLeft = Math.max(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate() + 1, 1);
  const dailyNeed = summary.mancanti === 0 ? 0 : summary.mancanti / daysLeft;

  document.getElementById("month-target-label").textContent = `${summary.validati.length} di ${agent.targetMensile}`;
  document.getElementById("month-target-percent").textContent = `${summary.targetPercent}%`;
  document.getElementById("month-target-bar").style.width = `${summary.targetPercent}%`;
  document.getElementById("progress-message").textContent =
    summary.mancanti === 0
      ? "Target centrato. Puoi puntare al bonus extra."
      : `Ti mancano ${summary.mancanti} contratti per chiudere il target.`;
  document.getElementById("quarter-target").textContent = `${quarterDone} di ${agent.targetTrimestrale} contratti validati`;
  document.getElementById("year-target").textContent = `${yearDone} di ${agent.targetAnnuale} contratti validati`;
  document.getElementById("daily-need").textContent =
    dailyNeed === 0 ? "Target mensile già raggiunto" : `${dailyNeed.toLocaleString("it-IT", { maximumFractionDigits: 1 })} contratti al giorno`;
}

function renderMonthFilter() {
  const select = document.getElementById("month-filter");
  const selected = select.value || "all";
  const months = Array.from(new Set([currentMonthKey, ...contracts.map((contract) => contract.dataInserimento.slice(0, 7))])).sort().reverse();

  select.innerHTML = [
    `<option value="all">Tutti i mesi</option>`,
    ...months.map((key) => `<option value="${key}">${capitalize(formatMonth.format(dateFromMonthKey(key)))}</option>`),
  ].join("");
  select.value = months.includes(selected) || selected === "all" ? selected : "all";
}

function renderAll() {
  renderMonthFilter();
  renderDashboard();
  renderContractsTable();
  renderCbPage();
  renderProgressPage();
}

function buildContractDraft(form) {
  const stato = normalizeStatus(form.get("statoContratto"));

  return {
    id: Date.now(),
    agenteId: agent.id,
    dataInserimento: toInputDate(today),
    ragioneSociale: String(form.get("ragioneSociale")).trim(),
    cellulare: String(form.get("cellulare")).trim(),
    tipoCliente: String(form.get("tipoCliente")).trim(),
    piva: String(form.get("piva")).trim(),
    email: String(form.get("email")).trim(),
    indirizzo: String(form.get("indirizzo")).trim(),
    indirizzoFatturazione: String(form.get("indirizzoFatturazione")).trim(),
    indirizzoFornitura: String(form.get("indirizzoFornitura")).trim(),
    descrizione: String(form.get("descrizione")).trim(),
    statoContratto: stato,
    cbUnitariaSnapshot: agent.cbUnitaria,
    cbMaturata: stato === "scartato" ? 0 : agent.cbUnitaria,
  };
}

function setFormFeedback(type, message) {
  const feedback = document.getElementById("save-feedback");
  feedback.className = type ? `is-${type}` : "";
  feedback.textContent = message;
}

function setAppLoading(isLoading) {
  document.body.classList.toggle("app-loading", isLoading);
  const loadingState = document.getElementById("loading-state");
  if (loadingState) loadingState.hidden = !isLoading;
}

function setAuthLocked(isLocked) {
  document.body.classList.toggle("auth-locked", isLocked);
  document.getElementById("login-screen").hidden = !isLocked;
}

function setConnectionStatus(status, label) {
  const element = document.getElementById("connection-status");
  if (!element) return;

  element.className = `connection-pill status-${status}`;
  element.innerHTML = `
    <span class="status-dot"></span>
    <span>${escapeHtml(label)}</span>
  `;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const submitBtn = event.currentTarget.querySelector('button[type="submit"]');
  const feedback = document.getElementById("login-feedback");

  submitBtn.disabled = true;
  feedback.className = "";
  feedback.textContent = "Accesso in corso...";

  try {
    const session = await baserowClient.login({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")).trim(),
    });

    agent = session.agent;
    contracts = await baserowClient.listContracts();
    document.getElementById("agent-name").textContent = agent.nome;
    document.getElementById("contract-form").elements.agente.value = agent.nome;
    setConnectionStatus("online", "Database connesso");
    renderAll();
    setAuthLocked(false);
    event.currentTarget.reset();
    feedback.className = "is-success";
    feedback.textContent = "";
  } catch (error) {
    feedback.textContent = error.message || "Accesso non riuscito.";
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleLogout() {
  try {
    await baserowClient.logout();
  } catch (error) {
    console.error(error);
  }

  contracts = [];
  closeContractModal();
  setActivePage("dashboard");
  setConnectionStatus("loading", "Accesso richiesto");
  setAuthLocked(true);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateFromMonthKey(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getRecentMonths(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (count - 1 - index), 1);
    return monthKey(date);
  });
}

function getQuarterKey(date) {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

function normalizeStatus(value) {
  const status = String(value).toLowerCase().trim();
  return ["validato", "in attesa", "scartato"].includes(status) ? status : "in attesa";
}

function range(start, end, step) {
  const values = [];
  for (let value = start; value <= end; value += step) {
    values.push(value);
  }
  return values;
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

async function initApp() {
  try {
    if (isStaticFileMode && demoFallbackEnabled) {
      contracts = loadContracts();
      setConnectionStatus("demo", "Modalità demo");
      setAuthLocked(false);
      renderAll();
      return;
    }

    if (typeof baserowClient !== "undefined" && baserowClient.isConfigured()) {
      try {
        setConnectionStatus("loading", "Controllo accesso...");
        const session = await baserowClient.getSession();
        if (!session.authenticated) {
          setConnectionStatus("loading", "Accesso richiesto");
          setAuthLocked(true);
          return;
        }

        agent = session.agent;
        contracts = await baserowClient.listContracts();
        document.getElementById("agent-name").textContent = agent.nome;
        document.getElementById("contract-form").elements.agente.value = agent.nome;
        setConnectionStatus("online", "Database connesso");
        setAuthLocked(false);
      } catch (err) {
        console.error(err);
        contracts = demoFallbackEnabled ? loadContracts() : [];
        setConnectionStatus("error", demoFallbackEnabled ? "Errore Database" : "Connessione non disponibile");
        setAuthLocked(!demoFallbackEnabled);
      }
    } else if (demoFallbackEnabled) {
      contracts = loadContracts();
      setConnectionStatus("demo", "Modalità demo");
      setAuthLocked(false);
    } else {
      contracts = [];
      setConnectionStatus("error", "Connessione non disponibile");
      setAuthLocked(true);
    }
    renderAll();
  } finally {
    setAppLoading(false);
  }
}

initApp();
