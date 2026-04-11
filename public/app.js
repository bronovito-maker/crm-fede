let agent = {
  id: 1,
  nome: 'Marco Bianchi',
  cbUnitaria: 85,
  targetMensile: 28,
  targetTrimestrale: 84,
  targetAnnuale: 320,
};

const defaultContracts = [
  {
    id: 1,
    agenteId: 1,
    dataInserimento: '2026-04-02',
    idContratto: '277541',
    ragioneSociale: 'Rossi Impianti SRL',
    cellulare: '+39 333 120 4501',
    tipoCliente: 'Business',
    categoriaCliente: 'switch ricorrente',
    piva: '03849270121',
    email: 'info@rossiimpianti.it',
    fornitore: 'Enel Energia',
    nomeOfferta: 'Flex Business Luce',
    tipoOperazione: ['switch'],
    tipoFornitura: 'luce',
    pod: 'IT001E12345678',
    pdr: '',
    metodoPagamento: 'rid',
    iban: 'IT60X0542811101000000123456',
    indirizzoFatturazione: 'Via Roma 12, Milano',
    indirizzoFornitura: 'Via Industria 7, Milano',
    descrizione: 'Cliente business con doppia fornitura.',
    statoContratto: 'OK',
    cbMaturata: 85,
    dataInizioFornitura: '2026-06-01',
  },
  {
    id: 2,
    agenteId: 1,
    dataInserimento: '2026-04-04',
    idContratto: '277542',
    ragioneSociale: 'Studio Verdi',
    cellulare: '+39 349 882 1044',
    tipoCliente: 'Business',
    categoriaCliente: 'prospect',
    piva: '01923440982',
    email: 'amministrazione@studioverdi.it',
    fornitore: 'A2A Energia',
    nomeOfferta: 'Gas Smart',
    tipoOperazione: ['cambio listino'],
    tipoFornitura: 'gas',
    pod: '',
    pdr: '12345678901234',
    metodoPagamento: 'bollettino',
    iban: '',
    indirizzoFatturazione: 'Corso Italia 41, Torino',
    indirizzoFornitura: 'Corso Italia 41, Torino',
    descrizione: '',
    statoContratto: 'Caricato',
    cbMaturata: 85,
    dataInizioFornitura: '2026-06-01',
  },
  {
    id: 3,
    agenteId: 1,
    dataInserimento: '2026-04-06',
    idContratto: '277543',
    ragioneSociale: 'Laura Neri',
    cellulare: '+39 347 221 0034',
    tipoCliente: 'Privato',
    categoriaCliente: 'switch ricorrente',
    piva: '',
    email: 'laura.neri@email.it',
    fornitore: 'Edison',
    nomeOfferta: 'Dual Casa',
    tipoOperazione: ['switch + voltura'],
    tipoFornitura: 'dual',
    pod: 'IT001E87654321',
    pdr: '99887766554433',
    metodoPagamento: 'rid',
    iban: 'IT60X0542811101000000654321',
    indirizzoFatturazione: 'Via Manzoni 8, Pavia',
    indirizzoFornitura: 'Via Manzoni 8, Pavia',
    descrizione: '',
    statoContratto: 'OK',
    cbMaturata: 85,
    dataInizioFornitura: '2026-06-01',
  },
  {
    id: 4,
    agenteId: 1,
    dataInserimento: '2026-04-07',
    idContratto: '277544',
    ragioneSociale: 'Condominio Aurora',
    cellulare: '+39 02 8899 1200',
    tipoCliente: 'Condominio',
    categoriaCliente: 'prospect',
    piva: '09777130159',
    email: 'aurora@amministrazioni.it',
    fornitore: 'Sorgenia',
    nomeOfferta: 'Condominio Luce',
    tipoOperazione: ['subentro'],
    tipoFornitura: 'luce',
    pod: 'IT001E55555555',
    pdr: '',
    metodoPagamento: 'bollettino',
    iban: '',
    indirizzoFatturazione: 'Via Piave 22, Monza',
    indirizzoFornitura: 'Via Piave 22, Monza',
    descrizione: 'Documenti incompleti.',
    statoContratto: 'K.O.',
    cbMaturata: 0,
    dataInizioFornitura: '2026-06-01',
  },
  {
    id: 5,
    agenteId: 1,
    dataInserimento: '2026-04-09',
    idContratto: '277545',
    ragioneSociale: 'Market Sole SNC',
    cellulare: '+39 331 771 4540',
    tipoCliente: 'Business',
    categoriaCliente: 'switch ricorrente',
    piva: '02900341209',
    email: 'marketsole@email.it',
    fornitore: 'Plenitude',
    nomeOfferta: 'Business Dual',
    tipoOperazione: ['switch'],
    tipoFornitura: 'dual',
    pod: 'IT001E44444444',
    pdr: '11223344556677',
    metodoPagamento: 'rid',
    iban: 'IT60X0542811101000000112233',
    indirizzoFatturazione: 'Piazza Garibaldi 3, Novara',
    indirizzoFornitura: 'Piazza Garibaldi 3, Novara',
    descrizione: '',
    statoContratto: 'Caricato',
    cbMaturata: 85,
    dataInizioFornitura: '2026-07-01',
  },
  {
    id: 6,
    agenteId: 1,
    dataInserimento: '2026-03-12',
    idContratto: '277546',
    ragioneSociale: 'Gianni Costa',
    cellulare: '+39 348 900 1180',
    tipoCliente: 'Privato',
    categoriaCliente: 'prospect',
    piva: '',
    email: 'gianni@email.it',
    fornitore: 'Enel Energia',
    nomeOfferta: 'Casa Luce',
    tipoOperazione: ['switch'],
    tipoFornitura: 'luce',
    pod: 'IT001E22222222',
    pdr: '',
    metodoPagamento: 'bollettino',
    iban: '',
    indirizzoFatturazione: 'Via Dante 14, Como',
    indirizzoFornitura: 'Via Dante 14, Como',
    descrizione: '',
    statoContratto: 'OK',
    cbMaturata: 85,
    dataInizioFornitura: '2026-05-01',
  },
  {
    id: 7,
    agenteId: 1,
    dataInserimento: '2026-02-18',
    idContratto: '277547',
    ragioneSociale: 'Bar Centrale',
    cellulare: '+39 331 440 9021',
    tipoCliente: 'Business',
    categoriaCliente: 'switch ricorrente',
    piva: '08111230963',
    email: 'barcentrale@email.it',
    fornitore: 'A2A Energia',
    nomeOfferta: 'Bar Gas',
    tipoOperazione: ['cambio listino'],
    tipoFornitura: 'gas',
    pod: '',
    pdr: '22334455667788',
    metodoPagamento: 'rid',
    iban: 'IT60X0542811101000000998877',
    indirizzoFatturazione: 'Via Milano 90, Lecco',
    indirizzoFornitura: 'Via Milano 90, Lecco',
    descrizione: '',
    statoContratto: 'OK',
    cbMaturata: 85,
    dataInizioFornitura: '2026-04-01',
  },
];

const storageKey = 'energia-crm-contracts';
let contracts = [];
let selectedContractFiles = [];
let contractsRefreshInFlight = false;
const adminState = {
  stats: null,
  agents: [],
  contracts: [],
  editingAgentId: null,
  contractSearch: '',
  contractAgentId: 'all',
  contractStatus: 'all',
  contractSentFilter: 'pending',
  contractSort: 'recent',
  selectedContractIds: [],
  agentSearch: '',
  agentRole: 'all',
  agentState: 'all',
};

const pages = {
  dashboard: 'Dashboard',
  'new-contract': 'Nuovo contratto',
  contracts: 'Contratti',
  'switch ricorrente': 'Switch ricorrente',
  progress: 'Avanzamento',
  admin: 'Admin',
};

const statusColors = {
  OK: '#15803d',
  Caricato: '#b7791f',
  Inviato: '#2563eb',
  'K.O.': '#c2410c',
  'Switch - Out': '#dc2626',
};

const today = new Date();
const currentMonthKey = monthKey(today);
const isStaticFileMode = window.location.protocol === 'file:';
const demoFallbackEnabled = Boolean(CONFIG.ENABLE_DEMO_FALLBACK || isStaticFileMode);
const maxContractFiles = 10;
const maxContractFileSize = 15 * 1024 * 1024;
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
const IBAN_RE = /^[A-Z]{2}[0-9A-Z]{13,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIVA_RE = /^\d{11}$/;
const CODICE_FISCALE_RE = /^[A-Z0-9]{16}$/;
/**
 * Calcola la data d'ingresso in fornitura.
 * Se inserito entro il 20 del mese corrente -> primo del mese tra due mesi.
 * Se inserito dal 21 del mese corrente -> primo del mese tra tre mesi.
 * @param {string} inputDate - La data di inserimento (YYYY-MM-DD)
 * @returns {string} - Data inizio fornitura (YYYY-MM-DD)
 */
function calculateSupplyStartDate(inputDate) {
  const date = inputDate ? new Date(inputDate) : new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let targetMonth;
  let targetYear = year;

  if (day <= 20) {
    // Due mesi dopo
    targetMonth = month + 2;
  } else {
    // Tre mesi dopo
    targetMonth = month + 3;
  }

  // Crea la data al 1° del mese target (JS gestisce l'overflow dei mesi automatically)
  const resultDate = new Date(targetYear, targetMonth, 1);

  const yyyy = resultDate.getFullYear();
  const mm = String(resultDate.getMonth() + 1).padStart(2, '0');
  const dd = '01';

  return `${yyyy}-${mm}-${dd}`;
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
const formatDate = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const formatMonth = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });

document.getElementById('agent-name').textContent = agent.nome;
document.getElementById('current-period').textContent = capitalize(formatMonth.format(today));
setConnectionStatus('loading', 'Connessione...');
setAppLoading(true);
setAuthLocked(true);
updateConditionalFields();

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => setActivePage(button.dataset.page));
});

document.querySelectorAll('[data-go-page]').forEach((button) => {
  button.addEventListener('click', () => setActivePage(button.dataset.goPage));
});

document.getElementById('tipo-fornitura').addEventListener('change', updateConditionalFields);
document.getElementById('metodo-pagamento').addEventListener('change', updateConditionalFields);
document
  .querySelector('select[name="categoriaCliente"]')
  .addEventListener('change', updateNewContractSummary);
document
  .getElementById('contract-files-input')
  .addEventListener('change', handleContractFilesSelection);

// ---- File drop zone ----
(function setupFileDropZone() {
  const dropZone = document.getElementById('contract-drop-zone');
  const fileInput = document.getElementById('contract-files-input');

  // Click / keyboard → apri selettore file
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Drag events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) addContractFiles(files);
  });
})();
document.getElementById('login-form').addEventListener('submit', handleLogin);

// Toggle mostra/nascondi password (login + admin)
document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.addEventListener('click', function () {
    const input = this.closest('.input-with-icon').querySelector('input');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    this.querySelector('.eye-open').hidden = !isPassword;
    this.querySelector('.eye-closed').hidden = isPassword;
    this.setAttribute('aria-label', isPassword ? 'Nascondi password' : 'Mostra password');
  });
});
document.getElementById('logout-button').addEventListener('click', handleLogout);
document.getElementById('admin-agent-form').addEventListener('submit', handleAdminAgentSubmit);
document.getElementById('admin-agent-reset').addEventListener('click', resetAdminAgentForm);
document.getElementById('admin-agent-mode-create').addEventListener('click', resetAdminAgentForm);
document.getElementById('admin-agent-mode-edit').addEventListener('click', () => {
  if (!adminState.editingAgentId) {
    setAdminFeedback('error', 'Seleziona prima un agente dalla lista.');
    document
      .getElementById('admin-agent-list')
      .scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

[
  ['admin-contract-search', 'input', handleAdminFilterChange],
  ['admin-contract-agent-filter', 'change', handleAdminFilterChange],
  ['admin-contract-status-filter', 'change', handleAdminFilterChange],
  ['admin-contract-sort', 'change', handleAdminFilterChange],
  ['admin-contract-sent-filter', 'change', handleAdminFilterChange],
  ['admin-agent-search', 'input', handleAdminFilterChange],
  ['admin-agent-role-filter', 'change', handleAdminFilterChange],
  ['admin-agent-state-filter', 'change', handleAdminFilterChange],
].forEach(([id, eventName, handler]) => {
  document.getElementById(id).addEventListener(eventName, handler);
});
document
  .getElementById('admin-select-visible')
  .addEventListener('click', () => bulkSelectVisibleAdminContracts());
document
  .getElementById('admin-clear-selection')
  .addEventListener('click', () => clearAdminContractSelection());
document.getElementById('admin-bulk-send').addEventListener('click', () => bulkMarkSelectedSent());

document.getElementById('close-contract-modal').addEventListener('click', closeContractModal);
document.getElementById('contract-modal').addEventListener('click', (event) => {
  if (event.target.id === 'contract-modal') closeContractModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeContractModal();
});

setInterval(() => {
  if (document.visibilityState === 'visible') {
    loadAndRenderContracts({ silent: true });
  }
}, 60_000);

document.getElementById('contract-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const draft = buildContractDraft(form);
  const submitBtn = formElement.querySelector('button[type="submit"]');

  const validationMessage = validateContractDraft(draft);
  if (validationMessage) {
    setFormFeedback('error', validationMessage);
    return;
  }

  submitBtn.disabled = true;
  setFormFeedback('saving', 'Salvataggio in corso...');

  if (typeof baserowClient !== 'undefined' && baserowClient.isConfigured()) {
    try {
      await baserowClient.createContract(buildContractFormData(draft));
      await loadAndRenderContracts({ silent: true, force: true });
      setFormFeedback('success', 'Contratto salvato nel database.');
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      setFormFeedback('error', err.message || 'Contratto non salvato. I dati sono ancora qui.');
      return;
    }
  } else if (demoFallbackEnabled) {
    contracts.unshift(draft);
    saveContracts();
    setFormFeedback('success', 'Contratto salvato in modalità demo.');
  } else {
    submitBtn.disabled = false;
    setFormFeedback('error', 'Connessione non disponibile. Contratto non salvato.');
    return;
  }

  submitBtn.disabled = false;
  formElement.reset();
  selectedContractFiles = [];
  renderSelectedContractFiles();
  formElement.elements.agente.value = agent.nome;
  formElement.elements.statoContratto.value = 'Caricato';
  updateConditionalFields();
  updateNewContractSummary();
  renderAll();
  setTimeout(() => setActivePage('contracts'), 350);
});

['search-input', 'month-filter', 'status-filter'].forEach((id) => {
  document.getElementById(id).addEventListener('input', renderContractsTable);
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

async function loadAndRenderContracts({ silent = false, force = false } = {}) {
  if (
    contractsRefreshInFlight ||
    typeof baserowClient === 'undefined' ||
    !baserowClient.isConfigured() ||
    (!force && document.body.classList.contains('auth-locked'))
  ) {
    return;
  }

  contractsRefreshInFlight = true;

  try {
    contracts = await baserowClient.listContracts();
    renderAll();
  } catch (error) {
    if (!silent) {
      setFormFeedback('error', error.message || 'Impossibile aggiornare i contratti.');
    }
    console.error(error);
  } finally {
    contractsRefreshInFlight = false;
  }
}

function setActivePage(pageId) {
  document
    .querySelectorAll('.page')
    .forEach((page) => page.classList.toggle('active', page.id === pageId));
  document.querySelectorAll('.nav-item').forEach((item) => {
    const isActive = item.dataset.page === pageId;
    item.classList.toggle('active', isActive);
    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });
  document.getElementById('page-title').textContent = pages[pageId];

  // Nascondi "Nuovo contratto" quick-action nelle pagine dove è fuori contesto
  const quickBtn = document.querySelector('.quick-action');
  if (quickBtn) {
    quickBtn.hidden = pageId === 'admin';
  }
}

function currentMonthContracts() {
  return contracts.filter((contract) => contract.dataInserimento.startsWith(currentMonthKey));
}

function getSummary() {
  const monthly = currentMonthContracts();
  const ok = monthly.filter((contract) => contract.statoContratto === 'OK');
  const caricati = monthly.filter((contract) => contract.statoContratto === 'Caricato');
  const inviati = monthly.filter((contract) => contract.statoContratto === 'Inviato');
  const ko = monthly.filter((contract) => contract.statoContratto === 'K.O.');
  const switchOut = monthly.filter((contract) => contract.statoContratto === 'Switch - Out');
  const scartati = monthly.filter(
    (contract) => contract.statoContratto === 'K.O.' || contract.statoContratto === 'Switch - Out'
  );
  const monthlyUnits = sumContractUnits(monthly);
  const okUnits = sumContractUnits(ok);
  const caricatiUnits = sumContractUnits(caricati);
  const inviatiUnits = sumContractUnits(inviati);
  const koUnits = sumContractUnits(ko);
  const switchOutUnits = sumContractUnits(switchOut);
  const scartatiUnits = sumContractUnits(scartati);
  const cbValidata = sumContractCommissions(ok);
  const cbPotenziale = sumContractCommissions([...ok, ...caricati, ...inviati]);
  const mancanti = Math.max(agent.targetMensile - okUnits, 0);
  const targetPercent = percent(okUnits, agent.targetMensile);

  return {
    monthly,
    ok,
    caricati,
    inviati,
    ko,
    switchOut,
    scartati,
    monthlyUnits,
    okUnits,
    caricatiUnits,
    inviatiUnits,
    koUnits,
    switchOutUnits,
    scartatiUnits,
    cbValidata,
    cbPotenziale,
    mancanti,
    targetPercent,
  };
}

function renderMetrics(containerId, metrics) {
  document.getElementById(containerId).innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric-card">
          <span>${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
        </article>
      `
    )
    .join('');
}

function renderDashboard() {
  const summary = getSummary();
  renderMetrics('dashboard-metrics', [
    { label: 'Contratti inseriti', value: summary.monthlyUnits },
    { label: 'Contratti OK', value: summary.okUnits },
    { label: 'Contratti inviati', value: summary.inviatiUnits },
    { label: 'Contratti scartati (K.O.)', value: summary.scartatiUnits },
    { label: 'CB maturata', value: formatCurrency(summary.cbValidata) },
    { label: 'CB potenziale', value: formatCurrency(summary.cbPotenziale) },
    { label: 'Target mensile', value: agent.targetMensile },
    { label: 'Manca al target', value: summary.mancanti },
    {
      label: 'In attesa (Caricati + Inviati)',
      value: summary.caricatiUnits + summary.inviatiUnits,
    },
  ]);

  renderDonut(summary);
  document.getElementById('target-percent').textContent = `${summary.targetPercent}%`;
  document.getElementById('target-copy').textContent =
    `${summary.okUnits} di ${agent.targetMensile}`;
  document.getElementById('target-bar').style.width = `${summary.targetPercent}%`;
  document.getElementById('dashboard-motivation').textContent =
    summary.mancanti === 0
      ? 'Target mensile raggiunto. Ora ogni contratto alza la CB.'
      : `Ti mancano ${summary.mancanti} contratti OK per chiudere il target.`;
  renderLineChart();
  renderBarChart();
}

function renderDonut(summary) {
  const total = Math.max(summary.monthlyUnits, 1);
  const okEnd = (summary.okUnits / total) * 100;
  const caricatiEnd = okEnd + (summary.caricatiUnits / total) * 100;
  const inviatiEnd = caricatiEnd + (summary.inviatiUnits / total) * 100;

  document.getElementById('donut-chart').style.background =
    `conic-gradient(${statusColors.OK} 0 ${okEnd}%, ${statusColors.Caricato} ${okEnd}% ${caricatiEnd}%, ${statusColors.Inviato} ${caricatiEnd}% ${inviatiEnd}%, ${statusColors['K.O.']} ${inviatiEnd}% 100%)`;

  document.getElementById('status-legend').innerHTML = [
    ['OK', summary.okUnits, statusColors.OK],
    ['Caricati', summary.caricatiUnits, statusColors.Caricato],
    ['Inviati', summary.inviatiUnits, statusColors.Inviato],
    ['Scartati / Out', summary.scartatiUnits, statusColors['K.O.']],
  ]
    .map(
      ([label, value, color]) => `
        <div class="legend-row">
          <span><i class="legend-dot" style="background:${color}"></i>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join('');
}

function renderLineChart() {
  const monthContracts = currentMonthContracts();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const step = Math.max(Math.ceil(daysInMonth / 12), 1);
  const days = Array.from(new Set([1, ...range(step, daysInMonth, step), daysInMonth])).sort(
    (a, b) => a - b
  );
  const maxCount = Math.max(sumContractUnits(monthContracts), 1);
  const points = days.map((day, index) => {
    const cumulative = sumContractUnits(
      monthContracts.filter((contract) => Number(contract.dataInserimento.slice(-2)) <= day)
    );
    return {
      x: 32 + index * (590 / Math.max(days.length - 1, 1)),
      y: 200 - (cumulative / maxCount) * 160,
    };
  });
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  document.getElementById('line-chart').innerHTML = `
    <svg viewBox="0 0 650 230" role="img" aria-label="Andamento cumulato contratti del mese">
      <line x1="30" y1="200" x2="625" y2="200" stroke="#dce3ea" />
      <line x1="30" y1="20" x2="30" y2="200" stroke="#dce3ea" />
      <path d="${path}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#0f766e" />`).join('')}
    </svg>
  `;
}

function renderBarChart() {
  const monthValues = getRecentMonths(4).map((key) => {
    const date = dateFromMonthKey(key);
    const label = capitalize(
      new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(date)
    ).replace('.', '');
    const value = sumContractUnits(
      contracts.filter(
        (contract) => contract.dataInserimento.startsWith(key) && contract.statoContratto === 'OK'
      )
    );
    return [label, value, key === currentMonthKey];
  });
  const max = Math.max(...monthValues.map((value) => value[1]), 1);

  document.getElementById('bar-chart').innerHTML = `
    <svg viewBox="0 0 420 230" role="img" aria-label="Confronto contratti validati per mese">
      ${monthValues
        .map(([label, value, isCurrent], index) => {
          const height = (value / max) * 150;
          const x = 40 + index * 90;
          return `
            <rect x="${x}" y="${190 - height}" width="54" height="${height}" rx="6" fill="${isCurrent ? '#2563eb' : '#0f766e'}" />
            <text x="${x + 27}" y="214" text-anchor="middle" fill="#667085" font-size="14">${label}</text>
            <text x="${x + 27}" y="${178 - height}" text-anchor="middle" fill="#18202a" font-size="14" font-weight="700">${value}</text>
          `;
        })
        .join('')}
    </svg>
  `;
}

function renderContractsTable() {
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const month = document.getElementById('month-filter').value;
  const status = document.getElementById('status-filter').value;

  const filtered = contracts.filter((contract) => {
    const matchesSearch = [
      contract.ragioneSociale,
      contract.cellulare,
      contract.email,
      contract.piva,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search);
    const matchesMonth = month === 'all' || contract.dataInserimento.startsWith(month);
    const matchesStatus = status === 'all' || contract.statoContratto === status;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const table = document.getElementById('contracts-table');
  const tableWrap = table.closest('.table-wrap');
  const emptyState = document.getElementById('contracts-empty');

  table.innerHTML = filtered.map(contractRow).join('');
  table.querySelectorAll('[data-contract-id]').forEach((row) => {
    row.addEventListener('click', () => openContractModal(Number(row.dataset.contractId)));
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openContractModal(Number(row.dataset.contractId));
      }
    });
  });
  tableWrap.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length > 0;

  // Empty state differenziato: zero contratti vs filtri senza risultati
  if (filtered.length === 0) {
    const hasFilters = search || month !== 'all' || status !== 'all';
    const hasAnyContracts = contracts.length > 0;
    if (!hasAnyContracts && !hasFilters) {
      emptyState.querySelector('strong').textContent = 'Nessun contratto ancora';
      emptyState.querySelector('p').textContent =
        'Inizia subito inserendo il tuo primo contratto.';
    } else {
      emptyState.querySelector('strong').textContent = 'Nessun contratto trovato';
      emptyState.querySelector('p').textContent =
        'Controlla i filtri oppure inserisci subito un nuovo contratto.';
    }
  }
}

function contractRow(contract) {
  const supplyDate = contract.dataInizioFornitura
    ? formatDate.format(new Date(contract.dataInizioFornitura))
    : '-';
  return `
    <tr data-contract-id="${contract.id}" tabindex="0" aria-label="Apri dettaglio contratto ${escapeHtml(contract.ragioneSociale)}">
      <td data-label="Cliente"><strong>${escapeHtml(contract.ragioneSociale)}</strong></td>
      <td data-label="Data inserimento">${formatDate.format(new Date(contract.dataInserimento))}</td>
      <td data-label="Inizio fornitura">${supplyDate}</td>
      <td data-label="Stato">${statusBadge(contract.statoContratto)}</td>
      <td data-label="Tipo">${escapeHtml(contract.tipoCliente)}</td>
      <td data-label="CB">${formatCurrency(contractCommissionValue(contract))}</td>
      <td data-label="Telefono">${escapeHtml(contract.cellulare)}</td>
    </tr>
  `;
}

function openContractModal(contractId) {
  const contract = contracts.find((item) => item.id === contractId);
  if (!contract) return;

  document.getElementById('contract-detail-title').textContent =
    contract.ragioneSociale || 'Contratto';
  document.getElementById('contract-detail-content').innerHTML = [
    detailItem('Cliente', contract.ragioneSociale),
    detailItem('ID contratto', contract.idContratto || 'Non inserito'),
    detailItem('Stato', capitalize(contract.statoContratto)),
    detailItem('Data inserimento', formatDate.format(new Date(contract.dataInserimento))),
    detailItem(
      'Inizio fornitura',
      contract.dataInizioFornitura
        ? formatDate.format(new Date(contract.dataInizioFornitura))
        : 'Non calcolata'
    ),
    detailItem('Tipo cliente', contract.tipoCliente),
    detailItem('Categoria cliente', contract.categoriaCliente || 'Non inserita'),
    detailItem('Fornitore', contract.fornitore || 'Non inserito'),
    detailItem('Nome offerta', contract.nomeOfferta || 'Non inserita'),
    detailItem('Tipo operazione', formatList(contract.tipoOperazione) || 'Non inserita'),
    detailItem('Tipo fornitura', capitalize(contract.tipoFornitura || 'Non inserita')),
    detailItem('Conteggio target', contractUnitCount(contract)),
    detailItem('POD', contract.pod || 'Non inserito'),
    detailItem('PDR', contract.pdr || 'Non inserito'),
    detailItem('Metodo pagamento', capitalize(contract.metodoPagamento || 'Non inserito')),
    detailItem('IBAN', contract.iban ? maskIban(contract.iban) : 'Non inserito'),
    fileDetailItem(contract.fileContratto),
    detailItem('CB', formatCurrency(contractCommissionValue(contract))),
    detailItem('Cellulare', contract.cellulare),
    detailItem('Email', contract.email || 'Non inserita'),
    detailItem('P.IVA / Cod. fiscale', contract.piva || 'Non inserita'),
    detailItem('Indirizzo fatturazione', contract.indirizzoFatturazione || 'Non inserito', true),
    detailItem('Indirizzo fornitura', contract.indirizzoFornitura || 'Non inserito', true),
    detailItem('Note', contract.descrizione || 'Nessuna nota', true),
  ].join('');

  document.getElementById('contract-modal').hidden = false;
  document.getElementById('close-contract-modal').focus();
}

function closeContractModal() {
  const modal = document.getElementById('contract-modal');
  if (modal.hidden) return;
  modal.hidden = true;
}

function detailItem(label, value, full = false) {
  return `
    <div class="detail-item ${full ? 'full' : ''}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function fileDetailItem(files) {
  const items = Array.isArray(files) ? files.filter(Boolean) : [];
  if (!items.length) return detailItem('Documenti contratto', 'Non caricati', true);

  const content = items
    .map((file) => {
      const label = escapeHtml(file.visibleName || file.name || 'Documento contratto');
      const safeUrl = sanitizeUrl(file.url);
      return safeUrl
        ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    })
    .join('<br>');

  return `
    <div class="detail-item full">
      <span>Documenti contratto</span>
      <strong>${content}</strong>
    </div>
  `;
}

function formatList(value) {
  return Array.isArray(value) ? value.join(', ') : String(value || '');
}

function maskIban(value) {
  const compact = String(value).replace(/\s+/g, '');
  return compact.length <= 4 ? compact : `•••• ${compact.slice(-4)}`;
}

function statusBadge(status) {
  return `<span class="badge ${statusClass(status)}">${capitalize(status)}</span>`;
}

function statusClass(status) {
  return String(status)
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-');
}

function renderCbPage() {
  const summary = getSummary();
  renderMetrics('cb-metrics', [
    { label: 'CB del mese', value: formatCurrency(summary.cbPotenziale) },
    { label: 'CB validata (OK)', value: formatCurrency(summary.cbValidata) },
    {
      label: 'CB in attesa',
      value: formatCurrency(sumContractCommissions([...summary.caricati, ...summary.inviati])),
    },
    { label: 'OK', value: summary.okUnits },
    { label: 'Caricati', value: summary.caricatiUnits },
    { label: 'Inviati', value: summary.inviatiUnits },
    { label: 'K.O.', value: summary.koUnits },
  ]);

  const table = document.getElementById('cb-table');
  const tableWrap = table.closest('.table-wrap');
  const emptyState = document.getElementById('cb-empty');

  table.innerHTML = summary.monthly
    .map(
      (contract) => `
        <tr data-contract-id="${contract.id}" tabindex="0" aria-label="Apri dettaglio contratto ${escapeHtml(contract.ragioneSociale)}">
          <td data-label="Cliente"><strong>${escapeHtml(contract.ragioneSociale)}</strong></td>
          <td data-label="Stato">${statusBadge(contract.statoContratto)}</td>
          <td data-label="CB">${formatCurrency(contractCommissionValue(contract))}</td>
          <td data-label="Data">${formatDate.format(new Date(contract.dataInserimento))}</td>
        </tr>
      `
    )
    .join('');

  table.querySelectorAll('[data-contract-id]').forEach((row) => {
    row.addEventListener('click', () => openContractModal(Number(row.dataset.contractId)));
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openContractModal(Number(row.dataset.contractId));
      }
    });
  });

  tableWrap.hidden = summary.monthly.length === 0;
  emptyState.hidden = summary.monthly.length > 0;
}

function renderProgressPage() {
  const summary = getSummary();
  const quarterKey = getQuarterKey(today);
  const yearKey = String(today.getFullYear());
  const quarterDone = contracts
    .filter(
      (contract) =>
        getQuarterKey(new Date(contract.dataInserimento)) === quarterKey &&
        contract.statoContratto === 'OK'
    )
    .reduce((sum, contract) => sum + contractUnitCount(contract), 0);
  const yearDone = contracts
    .filter(
      (contract) => contract.dataInserimento.startsWith(yearKey) && contract.statoContratto === 'OK'
    )
    .reduce((sum, contract) => sum + contractUnitCount(contract), 0);
  const quarterPercent = percent(quarterDone, agent.targetTrimestrale);
  const yearPercent = percent(yearDone, agent.targetAnnuale);
  const daysLeft = Math.max(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate() + 1,
    1
  );
  const dailyNeed = summary.mancanti === 0 ? 0 : summary.mancanti / daysLeft;

  document.getElementById('month-target-label').textContent =
    `${summary.okUnits} di ${agent.targetMensile}`;
  document.getElementById('month-target-percent').textContent = `${summary.targetPercent}%`;
  document.getElementById('month-target-bar').style.width = `${summary.targetPercent}%`;
  document.getElementById('progress-message').textContent =
    summary.mancanti === 0
      ? 'Target centrato. Puoi puntare al bonus extra.'
      : `Ti mancano ${summary.mancanti} contratti conteggiati per chiudere il target.`;
  document.getElementById('quarter-target').textContent =
    `${quarterDone} di ${agent.targetTrimestrale} contratti conteggiati`;
  document.getElementById('quarter-target-percent').textContent = `${quarterPercent}%`;
  document.getElementById('quarter-target-bar').style.width = `${quarterPercent}%`;
  document.getElementById('year-target').textContent =
    `${yearDone} di ${agent.targetAnnuale} contratti conteggiati`;
  document.getElementById('year-target-percent').textContent = `${yearPercent}%`;
  document.getElementById('year-target-bar').style.width = `${yearPercent}%`;
  document.getElementById('daily-need').textContent =
    dailyNeed === 0
      ? 'Target mensile già raggiunto'
      : `${dailyNeed.toLocaleString('it-IT', { maximumFractionDigits: 1 })} contratti conteggiati al giorno`;
}

function renderMonthFilter() {
  const select = document.getElementById('month-filter');
  const selected = select.value || 'all';
  const months = Array.from(
    new Set([currentMonthKey, ...contracts.map((contract) => contract.dataInserimento.slice(0, 7))])
  )
    .sort()
    .reverse();

  select.innerHTML = [
    `<option value="all">Tutti i mesi</option>`,
    ...months.map(
      (key) =>
        `<option value="${key}">${capitalize(formatMonth.format(dateFromMonthKey(key)))}</option>`
    ),
  ].join('');
  select.value = months.includes(selected) || selected === 'all' ? selected : 'all';
}

function renderAll() {
  renderMonthFilter();
  renderDashboard();
  renderContractsTable();
  renderCbPage();
  renderProgressPage();
  updateAdminVisibility();
  if (agent.ruolo === 'admin') {
    renderAdminPage();
  }
}

function buildContractDraft(form) {
  const stato = normalizeStatus(form.get('statoContratto'));
  const dateInserimento = toInputDate(today);

  return {
    id: Date.now(),
    agenteId: agent.id,
    dataInserimento: dateInserimento,
    dataInizioFornitura: calculateSupplyStartDate(dateInserimento),
    idContratto: String(form.get('idContratto')).trim(),
    ragioneSociale: String(form.get('ragioneSociale')).trim(),
    cellulare: String(form.get('cellulare')).trim(),
    tipoCliente: String(form.get('tipoCliente')).trim(),
    categoriaCliente: String(form.get('categoriaCliente')).trim().toLowerCase(),
    fornitore: String(form.get('fornitore')).trim(),
    nomeOfferta: String(form.get('nomeOfferta')).trim(),
    tipoOperazione: [String(form.get('tipoOperazione') || '').trim()].filter(Boolean),
    tipoFornitura: String(form.get('tipoFornitura')).trim(),
    pod: String(form.get('pod')).trim(),
    pdr: String(form.get('pdr')).trim(),
    metodoPagamento: String(form.get('metodoPagamento')).trim(),
    iban: String(form.get('iban')).trim(),
    piva: String(form.get('piva')).trim(),
    email: String(form.get('email')).trim(),
    indirizzoFatturazione: String(form.get('indirizzoFatturazione')).trim(),
    indirizzoFornitura: String(form.get('indirizzoFornitura')).trim(),
    descrizione: String(form.get('descrizione')).trim(),
    fileContratto: selectedContractFiles.slice(),
    statoContratto: stato,
    cbUnitariaSnapshot: agent.cbUnitaria,
    cbMaturata: stato === 'K.O.' || stato === 'Switch - Out' ? 0 : agent.cbUnitaria,
  };
}

function buildContractFormData(draft) {
  const formData = new FormData();
  [
    'ragioneSociale',
    'cellulare',
    'tipoCliente',
    'idContratto',
    'categoriaCliente',
    'fornitore',
    'nomeOfferta',
    'tipoFornitura',
    'pod',
    'pdr',
    'metodoPagamento',
    'iban',
    'piva',
    'email',
    'indirizzoFatturazione',
    'indirizzoFornitura',
    'descrizione',
    'dataInizioFornitura',
  ].forEach((key) => {
    formData.append(key, draft[key] || '');
  });

  draft.tipoOperazione.forEach((operation) => {
    formData.append('tipoOperazione', operation);
  });

  draft.fileContratto.forEach((file) => {
    formData.append('fileContratto', file);
  });

  return formData;
}

function validateContractDraft(draft) {
  if (!draft.ragioneSociale || !draft.cellulare || !draft.tipoCliente) {
    return 'Compila cliente, cellulare e tipo cliente.';
  }

  if (!draft.categoriaCliente) {
    return 'Seleziona Prospect o Switch ricorrente.';
  }

  if (!draft.fornitore || !draft.nomeOfferta) {
    return 'Compila fornitore e nome offerta.';
  }

  if (!draft.tipoOperazione.length) {
    return 'Seleziona un tipo operazione.';
  }

  if (!draft.tipoFornitura) {
    return 'Seleziona il tipo fornitura.';
  }

  if ((draft.tipoFornitura === 'luce' || draft.tipoFornitura === 'dual') && !draft.pod) {
    return 'Inserisci il POD.';
  }

  if ((draft.tipoFornitura === 'gas' || draft.tipoFornitura === 'dual') && !draft.pdr) {
    return 'Inserisci il PDR.';
  }

  if (!draft.metodoPagamento) {
    return 'Seleziona il metodo di pagamento.';
  }

  if (draft.metodoPagamento === 'rid' && !draft.iban) {
    return "Inserisci l'IBAN per il RID.";
  }

  if (draft.iban && !IBAN_RE.test(draft.iban.replace(/\s+/g, '').toUpperCase())) {
    return 'IBAN non valido.';
  }

  if (draft.email && !EMAIL_RE.test(draft.email)) {
    return 'Email non valida.';
  }

  if (draft.piva && !isValidVatOrFiscalCode(draft.piva)) {
    return 'Inserisci una P.IVA di 11 cifre o un codice fiscale valido.';
  }

  if (draft.fileContratto.length > maxContractFiles) {
    return `Puoi caricare al massimo ${maxContractFiles} documenti.`;
  }

  for (const file of draft.fileContratto) {
    if (!isAllowedContractFile(file)) {
      return 'Carica solo PDF, Word, Excel, PowerPoint, OpenDocument o immagini.';
    }

    if (file.size > maxContractFileSize) {
      return 'Ogni documento non deve superare 15 MB.';
    }
  }

  return '';
}

function addContractFiles(files) {
  if (!files.length) return;
  selectedContractFiles = mergeContractFiles(selectedContractFiles, files);
  renderSelectedContractFiles();
}

function handleContractFilesSelection(event) {
  const incomingFiles = Array.from(event.target.files || []);
  addContractFiles(incomingFiles);
  event.target.value = '';
}

function mergeContractFiles(existingFiles, incomingFiles) {
  const merged = existingFiles.slice();

  incomingFiles.forEach((file) => {
    const alreadyPresent = merged.some(
      (current) =>
        current.name === file.name &&
        current.size === file.size &&
        current.lastModified === file.lastModified
    );

    if (!alreadyPresent) {
      merged.push(file);
    }
  });

  return merged;
}

function renderSelectedContractFiles() {
  const container = document.getElementById('contract-files-selection');
  const list = document.getElementById('contract-files-list');
  const counter = document.getElementById('contract-files-count');
  const pill = document.getElementById('contract-files-pill');

  container.hidden = selectedContractFiles.length === 0;
  counter.textContent = contractFilesCounterLabel(selectedContractFiles.length, true);
  pill.textContent = contractFilesCounterLabel(selectedContractFiles.length, false);

  list.innerHTML = selectedContractFiles
    .map(
      (file, index) => `
        <div class="file-chip">
          <span class="file-chip-name">${escapeHtml(file.name)} <small>(${formatFileSize(file.size)})</small></span>
          <button type="button" data-remove-contract-file="${index}">Rimuovi</button>
        </div>
      `
    )
    .join('');

  list.querySelectorAll('[data-remove-contract-file]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedContractFiles.splice(Number(button.dataset.removeContractFile), 1);
      renderSelectedContractFiles();
    });
  });
}

function contractFilesCounterLabel(count, extended) {
  if (count === 0) {
    return extended ? 'Nessun documento selezionato' : 'Nessun documento';
  }

  if (count === 1) {
    return extended ? '1 documento selezionato' : '1 documento';
  }

  return extended ? `${count} documenti selezionati` : `${count} documenti`;
}

function updateConditionalFields() {
  const tipoFornitura = document.getElementById('tipo-fornitura').value;
  const metodoPagamento = document.getElementById('metodo-pagamento').value;
  const showPod = tipoFornitura === 'luce' || tipoFornitura === 'dual';
  const showPdr = tipoFornitura === 'gas' || tipoFornitura === 'dual';
  const showIban = metodoPagamento === 'rid';

  toggleField('pod-field', showPod);
  toggleField('pdr-field', showPdr);
  toggleField('iban-field', showIban);
  updateNewContractSummary();
}

function updateNewContractSummary() {
  const tipoFornitura = document.querySelector('select[name="tipoFornitura"]').value;
  const categoriaCliente = document.querySelector('select[name="categoriaCliente"]').value;
  const weightedUnits = contractUnitCount({ tipoFornitura, categoriaCliente });
  const predictedCommission = agent.cbUnitaria * weightedUnits;

  document.getElementById('summary-practices').textContent = '1';
  document.getElementById('summary-units').textContent = String(weightedUnits);
  document.getElementById('summary-commission').textContent = formatCurrency(predictedCommission);
}

function toggleField(id, isVisible) {
  const field = document.getElementById(id);
  const input = field.querySelector('input');
  field.hidden = !isVisible;
  input.required = isVisible;
  if (!isVisible) input.value = '';
}

function setFormFeedback(type, message) {
  const feedback = document.getElementById('save-feedback');
  feedback.className = type ? `is-${type}` : '';
  feedback.textContent = message;
}

function setAppLoading(isLoading) {
  document.body.classList.toggle('app-loading', isLoading);
  const loadingState = document.getElementById('loading-state');
  if (loadingState) loadingState.hidden = !isLoading;
}

function setAuthLocked(isLocked) {
  document.body.classList.toggle('auth-locked', isLocked);
  document.getElementById('login-screen').hidden = !isLocked;
}

function setConnectionStatus(status, label) {
  const element = document.getElementById('connection-status');
  if (!element) return;

  element.className = `connection-pill status-${status}`;
  element.innerHTML = `
    <span class="status-dot"></span>
    <span>${escapeHtml(label)}</span>
  `;
}

function updateAdminVisibility() {
  document.querySelectorAll('.admin-only').forEach((element) => {
    element.hidden = agent.ruolo !== 'admin';
  });
}

async function renderAdminPage() {
  try {
    const [stats, agents, adminContracts] = await Promise.all([
      baserowClient.getAdminStats(),
      baserowClient.listAdminAgents(),
      baserowClient.listAdminContracts(),
    ]);
    adminState.stats = stats;
    adminState.agents = agents;
    adminState.contracts = adminContracts;
    syncAdminFilterControls();
    renderAdminMetrics(stats);
    populateAdminFilterOptions(agents);
    renderAdminAgentList(stats, agents);
    renderAdminContracts(adminContracts, agents);
  } catch (error) {
    document.getElementById('admin-agent-list').innerHTML = `
      <div class="empty-state compact">
        <strong>Admin non disponibile</strong>
        <p>${escapeHtml(error.message || 'Statistiche non caricate.')}</p>
      </div>
    `;
    document.getElementById('admin-agent-empty').hidden = true;
    document.getElementById('admin-contracts-table').innerHTML = '';
    document.getElementById('admin-contracts-empty').hidden = false;
  }
}

function renderAdminMetrics(stats) {
  const activeAgents = stats.agents.filter((row) => row.attivo).length;
  renderMetrics('admin-metrics', [
    { label: 'Pratiche inserite mese', value: stats.totals.practices || stats.totals.contracts },
    { label: 'Contratti conteggiati mese', value: stats.totals.contracts },
    { label: 'Validati (OK)', value: stats.totals.ok },
    { label: 'Caricati', value: stats.totals.caricati },
    { label: 'Inviati', value: stats.totals.inviati },
    { label: 'K.O.', value: stats.totals.ko },
    { label: 'Switch Out', value: stats.totals.switchOut },
    { label: 'CB validata mese', value: formatCurrency(stats.totals.cbValidata) },
    { label: 'CB potenziale mese', value: formatCurrency(stats.totals.cbPotenziale) },
    { label: 'Agenti attivi', value: activeAgents },
  ]);
}

function renderAdminAgentList(stats, agents) {
  const statsByAgent = new Map(stats.agents.map((row) => [Number(row.id), row]));
  const query = adminState.agentSearch.trim().toLowerCase();
  const filteredAgents = agents.filter((agentRow) => {
    const matchesQuery =
      !query || `${agentRow.nome} ${agentRow.email}`.toLowerCase().includes(query);
    const matchesRole = adminState.agentRole === 'all' || agentRow.ruolo === adminState.agentRole;
    const matchesState =
      adminState.agentState === 'all' ||
      (adminState.agentState === 'active' && agentRow.attivo) ||
      (adminState.agentState === 'inactive' && !agentRow.attivo);
    return matchesQuery && matchesRole && matchesState;
  });

  document.getElementById('admin-agent-empty').hidden = filteredAgents.length > 0;
  document.getElementById('admin-agent-list').innerHTML = filteredAgents
    .map((agentRow) => {
      const row = statsByAgent.get(Number(agentRow.id)) || {};
      const roleLabel = agentRow.ruolo === 'admin' ? 'Admin' : 'Agente';
      return `
        <article class="admin-agent-card compact ${Number(adminState.editingAgentId) === Number(agentRow.id) ? 'is-selected' : ''}">
          <header>
            <div class="admin-agent-main">
              <h3>${escapeHtml(titleCase(agentRow.nome))}</h3>
              <p>${escapeHtml(agentRow.email)}</p>
            </div>
            <div class="admin-agent-badges">
              <span class="badge ${agentRow.ruolo === 'admin' ? 'caricato' : 'ok'}">${roleLabel}</span>
              <span class="badge ${agentRow.attivo ? 'ok' : 'switch-out'}">${agentRow.attivo ? 'Attivo' : 'Disattivo'}</span>
            </div>
          </header>
          <div class="admin-stat-grid">
            <div><span>Contratti</span><strong>${row.contratti || 0}</strong></div>
            <div><span>Pratiche</span><strong>${row.pratiche || row.contratti || 0}</strong></div>
            <div><span>Mese</span><strong>${row.ok || 0}/${agentRow.targetMensile || 0}</strong><small>${row.percentualeTargetMensile || 0}%</small></div>
            <div><span>Trimestre</span><strong>${row.okTrimestre || 0}/${agentRow.targetTrimestrale || 0}</strong><small>${row.percentualeTargetTrimestrale || 0}%</small></div>
            <div><span>Anno</span><strong>${row.okAnno || 0}/${agentRow.targetAnnuale || 0}</strong><small>${row.percentualeTargetAnnuale || 0}%</small></div>
            <div><span>CB validata</span><strong>${formatCurrency(row.cbValidata || 0)}</strong></div>
            <div><span>CB potenziale</span><strong>${formatCurrency(row.cbPotenziale || 0)}</strong></div>
          </div>
          <button class="secondary-button compact-button" type="button" data-edit-agent="${agentRow.id}">Apri modifica</button>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('[data-edit-agent]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = agents.find((item) => Number(item.id) === Number(button.dataset.editAgent));
      if (selected) fillAdminAgentForm(selected);
    });
  });
}

function renderAdminContracts(adminContracts, agents) {
  const table = document.getElementById('admin-contracts-table');
  const emptyState = document.getElementById('admin-contracts-empty');
  const counters = document.getElementById('admin-contract-counters');
  const selectedIds = new Set(adminState.selectedContractIds.map(Number));
  const agentNames = new Map(agents.map((item) => [Number(item.id), item.nome]));
  const query = adminState.contractSearch.trim().toLowerCase();
  const hasSearchQuery = Boolean(query);
  const filteredRows = adminContracts.slice().filter((contract) => {
    const matchesQuery =
      !query ||
      matchesSmartSearch(
        [
          contract.ragioneSociale,
          contract.idContratto,
          contract.email,
          contract.cellulare,
          contract.fornitore,
          agentNames.get(Number(contract.agenteId)) || '',
          contract.statoContratto,
        ],
        query
      );
    const matchesAgent =
      adminState.contractAgentId === 'all' ||
      Number(contract.agenteId) === Number(adminState.contractAgentId);
    const matchesStatus =
      hasSearchQuery ||
      adminState.contractStatus === 'all' ||
      contract.statoContratto === adminState.contractStatus;
    const matchesSent =
      hasSearchQuery ||
      adminState.contractSentFilter === 'all' ||
      (adminState.contractSentFilter === 'pending' && contract.statoContratto !== 'Inviato') ||
      (adminState.contractSentFilter === 'sent' && contract.statoContratto === 'Inviato');
    return matchesQuery && matchesAgent && matchesStatus && matchesSent;
  });
  const rows = filteredRows.slice().sort((left, right) => {
    if (adminState.contractSort === 'unsent') {
      if ((left.statoContratto === 'Inviato') !== (right.statoContratto === 'Inviato')) {
        return (
          Number(left.statoContratto === 'Inviato') - Number(right.statoContratto === 'Inviato')
        );
      }
      return String(right.dataInserimento).localeCompare(String(left.dataInserimento));
    }

    if (adminState.contractSort === 'oldest') {
      return String(left.dataInserimento).localeCompare(String(right.dataInserimento));
    }

    return String(right.dataInserimento).localeCompare(String(left.dataInserimento));
  });

  const okDaInviare = filteredRows.filter((contract) => contract.statoContratto === 'OK').length;
  const caricatiDaGestire = filteredRows.filter(
    (contract) => contract.statoContratto === 'Caricato'
  ).length;
  const inviati = filteredRows.filter((contract) => contract.statoContratto === 'Inviato').length;
  const daInviareOra = okDaInviare + caricatiDaGestire;

  counters.innerHTML = [
    adminCounterCard('Da inviare ora', daInviareOra, 'urgent'),
    adminCounterCard('OK da inviare', okDaInviare, 'attention'),
    adminCounterCard('Caricati da gestire', caricatiDaGestire, 'warning'),
    adminCounterCard('Già inviati', inviati, 'neutral'),
  ].join('');

  adminState.selectedContractIds = adminState.selectedContractIds
    .map(Number)
    .filter((id) => adminContracts.some((contract) => Number(contract.id) === Number(id)));

  table.innerHTML = rows
    .map(
      (contract) => `
        <tr class="${adminContractRowClass(contract)}" data-admin-contract-view="${contract.id}">
          <td data-label="Sel.">
            <input
              class="admin-row-checkbox"
              type="checkbox"
              data-admin-contract-select="${contract.id}"
              ${selectedIds.has(Number(contract.id)) ? 'checked' : ''}
              aria-label="Seleziona contratto ${escapeHtml(contract.ragioneSociale || 'Cliente')}"
            />
          </td>
          <td data-label="Cliente"><strong>${escapeHtml(contract.ragioneSociale || 'Cliente')}</strong></td>
          <td data-label="ID">${escapeHtml(contract.idContratto || 'ID non inserito')}</td>
          <td data-label="Agente">${escapeHtml(agentNames.get(Number(contract.agenteId)) || 'Non assegnato')}</td>
          <td data-label="Stato">${statusBadge(contract.statoContratto)}</td>
          <td data-label="Fornitura">${escapeHtml(capitalize(contract.tipoFornitura || 'Non inserita'))}</td>
          <td data-label="Azione">
            <button class="secondary-button compact-button" type="button" data-admin-contract-sent="${contract.id}" data-admin-contract-next="${contract.statoContratto === 'Inviato' ? 'false' : 'true'}">
              ${contract.statoContratto === 'Inviato' ? 'Riporta a Caricato' : 'Segna inviato'}
            </button>
          </td>
        </tr>
      `
    )
    .join('');

  emptyState.hidden = rows.length > 0;

  table.querySelectorAll('[data-admin-contract-sent]').forEach((button) => {
    button.addEventListener('click', async () => {
      const contractId = Number(button.dataset.adminContractSent);
      const nextValue = button.dataset.adminContractNext === 'true';
      button.disabled = true;
      button.textContent = 'Aggiorno...';

      try {
        await baserowClient.updateAdminContractSent(contractId, nextValue);
        await loadAndRenderContracts({ silent: true, force: true });
        await renderAdminPage();
      } catch (error) {
        setAdminFeedback('error', error.message || 'Stato contratto non aggiornato.');
      } finally {
        button.disabled = false;
      }
    });
  });

  table.querySelectorAll('[data-admin-contract-select]').forEach((checkbox) => {
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    checkbox.addEventListener('change', () => {
      const contractId = Number(checkbox.dataset.adminContractSelect);
      toggleAdminContractSelection(contractId, checkbox.checked);
      updateAdminBulkBar(rows);
    });
  });

  table.querySelectorAll('[data-admin-contract-view]').forEach((row) => {
    row.addEventListener('click', (event) => {
      if (event.target.closest('button') || event.target.closest('input[type="checkbox"]')) return;
      const contract = adminContracts.find(
        (item) => Number(item.id) === Number(row.dataset.adminContractView)
      );
      if (contract) openContractModal(contract);
    });
  });

  updateAdminBulkBar(rows);
}

function adminCounterCard(label, value, tone) {
  return `
    <article class="admin-counter-card ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `;
}

function adminContractRowClass(contract) {
  const status = String(contract.statoContratto || '');
  if (status === 'K.O.') return 'admin-contract-row is-muted';
  if (status === 'Caricato') return 'admin-contract-row is-urgent';
  if (status === 'OK') return 'admin-contract-row is-attention';
  return 'admin-contract-row';
}

function populateAdminFilterOptions(agents) {
  const select = document.getElementById('admin-contract-agent-filter');
  const current = adminState.contractAgentId;
  select.innerHTML = [
    '<option value="all">Tutti gli agenti</option>',
    ...agents
      .slice()
      .sort((left, right) => left.nome.localeCompare(right.nome, 'it'))
      .map((agentRow) => `<option value="${agentRow.id}">${escapeHtml(agentRow.nome)}</option>`),
  ].join('');
  select.value = agents.some((agentRow) => String(agentRow.id) === String(current))
    ? String(current)
    : 'all';
}

function syncAdminFilterControls() {
  document.getElementById('admin-contract-search').value = adminState.contractSearch;
  document.getElementById('admin-contract-status-filter').value = adminState.contractStatus;
  document.getElementById('admin-contract-sort').value = adminState.contractSort;
  document.getElementById('admin-contract-sent-filter').value = adminState.contractSentFilter;
  document.getElementById('admin-agent-search').value = adminState.agentSearch;
  document.getElementById('admin-agent-role-filter').value = adminState.agentRole;
  document.getElementById('admin-agent-state-filter').value = adminState.agentState;
}

function handleAdminFilterChange() {
  adminState.contractSearch = document.getElementById('admin-contract-search').value;
  adminState.contractAgentId = document.getElementById('admin-contract-agent-filter').value;
  adminState.contractStatus = document.getElementById('admin-contract-status-filter').value;
  adminState.contractSort = document.getElementById('admin-contract-sort').value;
  adminState.contractSentFilter = document.getElementById('admin-contract-sent-filter').value;
  adminState.agentSearch = document.getElementById('admin-agent-search').value;
  adminState.agentRole = document.getElementById('admin-agent-role-filter').value;
  adminState.agentState = document.getElementById('admin-agent-state-filter').value;

  if (['only-caricato', 'reset'].includes(adminState.contractSort)) {
    applyAdminQuickFilter(adminState.contractSort);
    return;
  }

  if (adminState.stats) {
    renderAdminAgentList(adminState.stats, adminState.agents);
    renderAdminContracts(adminState.contracts, adminState.agents);
  }
}

function applyAdminQuickFilter(mode) {
  if (mode === 'recent') {
    adminState.contractSort = 'recent';
  } else if (mode === 'unsent') {
    adminState.contractSort = 'unsent';
    adminState.contractSentFilter = 'pending';
  } else if (mode === 'caricato' || mode === 'only-caricato') {
    adminState.contractStatus = 'Caricato';
    adminState.contractSort = 'recent';
  } else if (mode === 'reset') {
    adminState.contractSearch = '';
    adminState.contractAgentId = 'all';
    adminState.contractStatus = 'all';
    adminState.contractSort = 'recent';
    adminState.contractSentFilter = 'pending';
  }

  syncAdminFilterControls();
  if (adminState.stats) {
    renderAdminContracts(adminState.contracts, adminState.agents);
  }
}

function toggleAdminContractSelection(contractId, isSelected) {
  const ids = new Set(adminState.selectedContractIds.map(Number));
  if (isSelected) ids.add(Number(contractId));
  else ids.delete(Number(contractId));
  adminState.selectedContractIds = Array.from(ids);
}

function clearAdminContractSelection() {
  adminState.selectedContractIds = [];
  if (adminState.stats) {
    renderAdminContracts(adminState.contracts, adminState.agents);
  }
}

function bulkSelectVisibleAdminContracts() {
  const visibleIds = Array.from(document.querySelectorAll('[data-admin-contract-view]')).map(
    (row) => Number(row.dataset.adminContractView)
  );
  adminState.selectedContractIds = Array.from(
    new Set([...adminState.selectedContractIds.map(Number), ...visibleIds])
  );
  if (adminState.stats) {
    renderAdminContracts(adminState.contracts, adminState.agents);
  }
}

async function bulkMarkSelectedSent() {
  const ids = adminState.selectedContractIds
    .map(Number)
    .filter((id) =>
      adminState.contracts.some(
        (contract) => Number(contract.id) === id && contract.statoContratto !== 'Inviato'
      )
    );

  if (!ids.length) {
    setAdminFeedback('error', 'Seleziona almeno un contratto da inviare.');
    return;
  }

  const button = document.getElementById('admin-bulk-send');
  button.disabled = true;
  button.textContent = 'Aggiorno...';

  try {
    await Promise.all(ids.map((id) => baserowClient.updateAdminContractSent(id, true)));
    adminState.selectedContractIds = [];
    await loadAndRenderContracts({ silent: true, force: true });
    await renderAdminPage();
    setAdminFeedback('success', `${ids.length} contratti segnati come inviati.`);
  } catch (error) {
    setAdminFeedback('error', error.message || 'Aggiornamento multiplo non riuscito.');
  } finally {
    button.disabled = false;
    button.textContent = 'Segna inviati';
  }
}

function updateAdminBulkBar(rows) {
  const bar = document.getElementById('admin-bulk-bar');
  const count = document.getElementById('admin-bulk-count');
  const sendButton = document.getElementById('admin-bulk-send');
  const selectedVisibleIds = rows
    .map((contract) => Number(contract.id))
    .filter((id) => adminState.selectedContractIds.map(Number).includes(id));
  const totalSelected = adminState.selectedContractIds.length;
  const actionableSelected = adminState.contracts.filter(
    (contract) =>
      adminState.selectedContractIds.map(Number).includes(Number(contract.id)) &&
      contract.statoContratto !== 'Inviato'
  ).length;

  bar.hidden = rows.length === 0;
  count.textContent = totalSelected === 1 ? '1 selezionato' : `${totalSelected} selezionati`;
  sendButton.disabled = actionableSelected === 0;
  document.getElementById('admin-select-visible').disabled =
    rows.length > 0 && selectedVisibleIds.length === rows.length;
}

function fillAdminAgentForm(agentRow) {
  const form = document.getElementById('admin-agent-form');
  const editor = document.getElementById('admin-agent-editor');
  const submit = document.getElementById('admin-agent-submit');
  const reset = document.getElementById('admin-agent-reset');
  const banner = document.getElementById('admin-editing-banner');
  const createModeButton = document.getElementById('admin-agent-mode-create');
  const editModeButton = document.getElementById('admin-agent-mode-edit');
  const passwordHint = document.getElementById('admin-password-hint');
  adminState.editingAgentId = Number(agentRow.id);
  form.elements.agentId.value = agentRow.id;
  form.elements.nome.value = agentRow.nome || '';
  form.elements.email.value = agentRow.email || '';
  form.elements.password.value = '';
  form.elements.cbUnitaria.value = agentRow.cbUnitaria || 0;
  form.elements.targetMensile.value = agentRow.targetMensile || 0;
  form.elements.targetTrimestrale.value = agentRow.targetTrimestrale || 0;
  form.elements.targetAnnuale.value = agentRow.targetAnnuale || 0;
  form.elements.ruolo.value = agentRow.ruolo || 'agente';
  form.elements.attivo.checked = Boolean(agentRow.attivo);
  document.getElementById('admin-form-mode').textContent = 'modifica agente';
  document.getElementById('admin-form-copy').textContent =
    'Stai modificando un agente esistente. Salva le modifiche oppure annulla.';
  document.getElementById('admin-editing-title').textContent = `Modifica: ${agentRow.nome}`;
  document.getElementById('admin-editing-subtitle').textContent =
    `${agentRow.email} · ${agentRow.ruolo === 'admin' ? 'Admin' : 'Agente'}`;
  banner.hidden = false;
  createModeButton.classList.remove('is-active');
  createModeButton.setAttribute('aria-selected', 'false');
  editModeButton.classList.add('is-active');
  editModeButton.setAttribute('aria-selected', 'true');
  passwordHint.textContent = 'Lascia vuoto per mantenere la password attuale.';
  submit.textContent = 'Salva modifiche';
  reset.textContent = 'Torna a nuovo agente';
  renderAdminAgentList(adminState.stats || { agents: [] }, adminState.agents);
  setActivePage('admin');
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => {
    form.elements.nome.focus();
  }, 250);
}

function resetAdminAgentForm() {
  const form = document.getElementById('admin-agent-form');
  const submit = document.getElementById('admin-agent-submit');
  const reset = document.getElementById('admin-agent-reset');
  const banner = document.getElementById('admin-editing-banner');
  const createModeButton = document.getElementById('admin-agent-mode-create');
  const editModeButton = document.getElementById('admin-agent-mode-edit');
  const passwordHint = document.getElementById('admin-password-hint');
  adminState.editingAgentId = null;
  form.reset();
  form.elements.agentId.value = '';
  form.elements.attivo.checked = true;
  document.getElementById('admin-form-mode').textContent = 'nuovo agente';
  document.getElementById('admin-form-copy').textContent =
    'Inserisci i dati per creare un nuovo agente.';
  document.getElementById('admin-editing-title').textContent = 'Nuovo agente';
  document.getElementById('admin-editing-subtitle').textContent =
    'Inserisci i dati del nuovo account.';
  banner.hidden = false;
  createModeButton.classList.add('is-active');
  createModeButton.setAttribute('aria-selected', 'true');
  editModeButton.classList.remove('is-active');
  editModeButton.setAttribute('aria-selected', 'false');
  passwordHint.textContent = 'Imposta una password per il nuovo agente.';
  submit.textContent = 'Crea agente';
  reset.textContent = 'Pulisci campi';
  setAdminFeedback('', '');
  renderAdminAgentList(adminState.stats || { agents: [] }, adminState.agents);
}

function adminAgentPayload(form) {
  return {
    nome: String(form.get('nome')).trim(),
    email: String(form.get('email')).trim(),
    password: String(form.get('password')).trim(),
    cbUnitaria: Number(form.get('cbUnitaria') || 0),
    targetMensile: Number(form.get('targetMensile') || 0),
    targetTrimestrale: Number(form.get('targetTrimestrale') || 0),
    targetAnnuale: Number(form.get('targetAnnuale') || 0),
    ruolo: String(form.get('ruolo')).trim(),
    attivo: form.get('attivo') === 'on',
  };
}

async function handleAdminAgentSubmit(event) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const agentId = form.get('agentId');
  const payload = adminAgentPayload(form);
  const submit = formElement.querySelector('button[type="submit"]');

  submit.disabled = true;
  setAdminFeedback('', 'Salvataggio agente...');

  try {
    if (agentId) {
      await baserowClient.updateAdminAgent(agentId, payload);
      setAdminFeedback('success', 'Agente aggiornato.');
    } else {
      await baserowClient.createAdminAgent(payload);
      setAdminFeedback('success', 'Agente creato.');
      resetAdminAgentForm();
    }
    await renderAdminPage();
    if (agentId) {
      resetAdminAgentForm();
    }
  } catch (error) {
    setAdminFeedback('error', error.message || 'Agente non salvato.');
  } finally {
    submit.disabled = false;
  }
}

function setAdminFeedback(type, message) {
  const feedback = document.getElementById('admin-agent-feedback');
  feedback.className = type ? `is-${type}` : '';
  feedback.textContent = message;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const submitBtn = event.currentTarget.querySelector('button[type="submit"]');
  const feedback = document.getElementById('login-feedback');

  submitBtn.disabled = true;
  feedback.className = '';
  feedback.textContent = 'Accesso in corso...';

  try {
    const session = await baserowClient.login({
      email: String(form.get('email')).trim(),
      password: String(form.get('password')).trim(),
      rememberMe: !!form.get('rememberMe'),
    });

    agent = session.agent;
    await loadAndRenderContracts({ silent: true, force: true });
    document.getElementById('agent-name').textContent = agent.nome;
    document.getElementById('contract-form').elements.agente.value = agent.nome;
    setConnectionStatus('online', 'Database connesso');
    setAuthLocked(false);
    event.currentTarget.reset();
    feedback.className = 'is-success';
    feedback.textContent = '';
  } catch (error) {
    feedback.textContent = error.message || 'Accesso non riuscito.';
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
  setActivePage('dashboard');
  setConnectionStatus('loading', 'Accesso richiesto');
  setAuthLocked(true);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dateFromMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

function contractUnitCount(contract) {
  if (Number.isFinite(Number(contract.unitCount)) && Number(contract.unitCount) > 0) {
    return Number(contract.unitCount);
  }
  const supplyType = String(contract.tipoFornitura || '').toLowerCase();
  const customerCategory = String(contract.categoriaCliente || '').toLowerCase();
  return supplyType === 'dual' && customerCategory === 'prospect' ? 2 : 1;
}

function sumContractUnits(items) {
  return items.reduce((sum, contract) => sum + contractUnitCount(contract), 0);
}

function contractCommissionValue(contract) {
  if (Number.isFinite(Number(contract.commissionValue)) && Number(contract.commissionValue) >= 0) {
    return Number(contract.commissionValue);
  }
  return Number(contract.cbMaturata || 0) * contractUnitCount(contract);
}

function sumContractCommissions(items) {
  return items.reduce((sum, contract) => sum + contractCommissionValue(contract), 0);
}

function isAllowedContractFile(file) {
  const extension = String(file.name || '')
    .split('.')
    .pop()
    .toLowerCase();
  return allowedContractFileExtensions.has(extension) || allowedContractFileTypes.has(file.type);
}

function isValidVatOrFiscalCode(value) {
  const normalized = String(value || '')
    .replace(/\s+/g, '')
    .toUpperCase();
  return PIVA_RE.test(normalized) || CODICE_FISCALE_RE.test(normalized);
}

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toLocaleString('it-IT', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} MB`;
}

function percent(done, target) {
  return target ? Math.min(Math.round((done / target) * 100), 100) : 0;
}

function normalizeStatus(value) {
  const status = String(value).trim();
  const valid = ['OK', 'Caricato', 'Inviato', 'K.O.', 'Switch - Out'];
  return valid.includes(status) ? status : 'Caricato';
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

function titleCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return entities[char];
  });
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesSmartSearch(values, query) {
  const haystack = normalizeSearchText(values.filter(Boolean).join(' '));
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

function sanitizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

async function initApp() {
  // Aggiungi listener per predizione data inizio fornitura nel form
  const infoBanner = document.getElementById('new-contract-summary');
  const predictedDateEl = document.getElementById('predicted-start-date');

  if (infoBanner && predictedDateEl) {
    const updatePrediction = () => {
      const pred = calculateSupplyStartDate(toInputDate(new Date()));
      predictedDateEl.textContent = formatDate.format(new Date(pred));
      infoBanner.hidden = false;
    };
    updatePrediction();
    updateNewContractSummary();
  }

  try {
    if (isStaticFileMode && demoFallbackEnabled) {
      contracts = loadContracts();
      setConnectionStatus('demo', 'Modalità demo');
      setAuthLocked(false);
      renderAll();
      return;
    }

    if (typeof baserowClient !== 'undefined' && baserowClient.isConfigured()) {
      try {
        setConnectionStatus('loading', 'Controllo accesso...');
        const session = await baserowClient.getSession();
        if (!session.authenticated) {
          setConnectionStatus('loading', 'Accesso richiesto');
          setAuthLocked(true);
          return;
        }

        agent = session.agent;
        await loadAndRenderContracts({ silent: true, force: true });
        document.getElementById('agent-name').textContent = agent.nome;
        document.getElementById('contract-form').elements.agente.value = agent.nome;
        setConnectionStatus('online', 'Database connesso');
        setAuthLocked(false);
      } catch (err) {
        console.error(err);
        contracts = demoFallbackEnabled ? loadContracts() : [];
        setConnectionStatus(
          'error',
          demoFallbackEnabled ? 'Errore Database' : 'Connessione non disponibile'
        );
        setAuthLocked(!demoFallbackEnabled);
      }
    } else if (demoFallbackEnabled) {
      contracts = loadContracts();
      setConnectionStatus('demo', 'Modalità demo');
      setAuthLocked(false);
    } else {
      contracts = [];
      setConnectionStatus('error', 'Connessione non disponibile');
      setAuthLocked(true);
    }
    renderAll();
  } finally {
    setAppLoading(false);
  }
}

initApp();
