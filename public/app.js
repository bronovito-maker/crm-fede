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
    categoriaCliente: 'Prospect',
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
    categoriaCliente: 'Prospect',
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
    categoriaCliente: 'Prospect',
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
let clients = [];
let clientsRefreshInFlight = false;
let selectedContractFiles = [];
let existingContractFiles = [];
let contractsRefreshInFlight = false;
const contractEditorState = {
  editingId: null,
  originalStatus: 'Caricato',
};
const adminState = {
  stats: null,
  agents: [],
  contracts: [],
  editingAgentId: null,
  contractSearch: '',
  contractAgentId: 'all',
  contractStatus: 'all',
  contractSentFilter: 'all',
  contractSort: 'recent',
  selectedContractIds: [],
  competenceMonth: monthKey(new Date()),
  competenceCutoffDate: '',
  supplierCutoffMonth: monthKey(new Date()),
  supplierCutoffBySupplier: {},
  agentSearch: '',
  agentRole: 'all',
  agentState: 'all',
};
let cbCategoryFilter = 'all';

const pages = {
  dashboard: 'Dashboard',
  'new-contract': 'Nuovo contratto',
  contracts: 'Contratti',
  cb: 'Client Base',
  'switch ricorrente': 'Switch ricorrente',
  progress: 'Avanzamento',
  admin: 'Admin',
  clients: 'Anagrafiche Clienti',
};

const statusColors = {
  Bozza: '#64748b',
  OK: '#15803d',
  Caricato: '#b7791f',
  Inviato: '#2563eb',
  'K.O.': '#c2410c',
  'Switch - Out': '#dc2626',
};

const today = new Date();
let currentCompetence = {
  month: monthKey(today),
  quarter: getQuarterKey(today),
  year: String(today.getFullYear()),
};
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
let competitionData = {}; // Global store for cutoffs

/**
 * Calcola la data d'ingresso in fornitura.
 * Usa i cutoff dinamici se disponibili, altrimenti fallback al giorno 20.
 * @param {string} inputDate - La data di inserimento (YYYY-MM-DD)
 * @returns {string} - Data inizio fornitura (YYYY-MM-DD)
 */
function normalizeSupplierKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function calculateSupplyStartDate(inputDate, supplierName = '') {
  const date = inputDate ? new Date(inputDate) : new Date();
  const day = date.getDate();
  const isoDate = toInputDate(date);
  const monthKey = isoDate.slice(0, 7); // YYYY-MM

  // Cerchiamo il cutoff dinamico per questo mese
  const config = competitionData[monthKey];
  const supplierKey = normalizeSupplierKey(supplierName);
  const supplierCutoff =
    config && config.suppliers && supplierKey ? config.suppliers[supplierKey] : '';
  const fallbackCutoff = config && config.cutoffDate ? config.cutoffDate : '';
  const cutoffDate = supplierCutoff || fallbackCutoff;
  const cutoffDay = cutoffDate ? new Date(cutoffDate).getDate() : 20;

  let targetMonth;
  const month = date.getMonth();

  if (day <= cutoffDay) {
    // Entro il cutoff -> primo del mese tra due mesi
    targetMonth = month + 2;
  } else {
    // Dopo il cutoff -> primo del mese tra tre mesi
    targetMonth = month + 3;
  }

  // Crea la data al 1° del mese target (JS gestisce l'overflow dei mesi automatically)
  const resultDate = new Date(date.getFullYear(), targetMonth, 1);

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
document.getElementById('current-period').textContent = currentPeriodLabel();
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
  .getElementById('fornitore-input')
  .addEventListener('change', () => updateStartDatePrediction());
document
  .getElementById('contract-files-input')
  .addEventListener('change', handleContractFilesSelection);
document.getElementById('cb-category-filter').addEventListener('change', (event) => {
  renderCbPage();
});

// ---- Clienti listeners ----
document.getElementById('clients-search')?.addEventListener('input', renderClientsTable);
document.getElementById('close-client-modal')?.addEventListener('click', closeClientModal);
document.getElementById('cancel-client-edit')?.addEventListener('click', closeClientModal);
document.getElementById('edit-client-form')?.addEventListener('submit', handleClientEditSubmit);
setupContractClientAutocomplete();

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
document.querySelectorAll('.logout-button').forEach((button) => {
  button.addEventListener('click', handleLogout);
});
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
document
  .getElementById('admin-supplier-cutoff-form')
  .addEventListener('submit', (event) => handleAdminSupplierCutoffSubmit(event));
document
  .getElementById('admin-supplier-cutoff-load')
  .addEventListener('click', () => loadAdminSupplierCutoffs());
document
  .getElementById('admin-supplier-cutoff-supplier')
  .addEventListener('change', () => handleAdminSupplierSelectionChange());
document
  .getElementById('admin-supplier-cutoff-list')
  .addEventListener('click', (event) => handleSupplierCutoffListClick(event));

document.getElementById('close-contract-modal').addEventListener('click', closeContractModal);
document.getElementById('contract-modal').addEventListener('click', (event) => {
  if (event.target.id === 'contract-modal') closeContractModal();
});
document
  .getElementById('edit-contract-button')
  .addEventListener('click', () => startEditingCurrentContract());
document
  .getElementById('delete-contract-button')
  .addEventListener('click', () => handleDeleteCurrentContract());
document.getElementById('cancel-contract-edit').addEventListener('click', resetContractEditor);
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
  const saveMode = event.submitter?.dataset.saveMode === 'draft' ? 'draft' : 'submit';
  const draft = buildContractDraft(form, saveMode);
  const submitBtn = event.submitter || formElement.querySelector('button[type="submit"]');
  const isEditing = Boolean(contractEditorState.editingId);

  const validationMessage = validateContractDraft(draft, saveMode);
  if (validationMessage) {
    setFormFeedback('error', validationMessage);
    return;
  }

  submitBtn.disabled = true;
  setFormFeedback('saving', 'Salvataggio in corso...');

  if (typeof baserowClient !== 'undefined' && baserowClient.isConfigured()) {
    try {
      const payload = buildContractFormData(draft);
      if (isEditing) {
        await baserowClient.updateContract(contractEditorState.editingId, payload);
      } else {
        await baserowClient.createContract(payload);
      }
      await loadAndRenderContracts({ silent: true, force: true });
      setFormFeedback(
        'success',
        isEditing
          ? saveMode === 'draft'
            ? 'Bozza aggiornata nel database.'
            : 'Contratto aggiornato nel database.'
          : saveMode === 'draft'
            ? 'Bozza salvata nel database.'
            : 'Contratto salvato nel database.'
      );
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      setFormFeedback('error', err.message || 'Contratto non salvato. I dati sono ancora qui.');
      return;
    }
  } else if (demoFallbackEnabled) {
    if (isEditing) {
      contracts = contracts.map((contract) =>
        Number(contract.id) === Number(contractEditorState.editingId)
          ? {
              ...contract,
              ...draft,
              id: contract.id,
              fileContratto: [...draft.existingFileContratto, ...draft.fileContratto],
              statoContratto:
                saveMode === 'draft'
                  ? 'Bozza'
                  : contract.statoContratto === 'Bozza'
                    ? 'Caricato'
                    : contract.statoContratto,
            }
          : contract
      );
    } else {
      contracts.unshift(draft);
    }
    saveContracts();
    setFormFeedback(
      'success',
      isEditing
        ? saveMode === 'draft'
          ? 'Bozza aggiornata in modalità demo.'
          : 'Contratto aggiornato in modalità demo.'
        : saveMode === 'draft'
          ? 'Bozza salvata in modalità demo.'
          : 'Contratto salvato in modalità demo.'
    );
  } else {
    submitBtn.disabled = false;
    setFormFeedback('error', 'Connessione non disponibile. Contratto non salvato.');
    return;
  }

  submitBtn.disabled = false;
  resetContractEditor({ keepFeedback: true });
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

  // Eyebrow sempre con il mese corrente
  document.getElementById('current-period').textContent = currentPeriodLabel();

  // Saluto personalizzato nel titolo della dashboard
  if (pageId === 'dashboard' && agent && agent.nome) {
    const hour = new Date().getHours();
    const greeting = hour < 18 ? 'Buongiorno' : 'Buonasera';
    const firstName = titleCase(agent.nome.split(' ')[0]);
    document.getElementById('page-title').textContent = `${greeting}, ${firstName}`;
  }

  // Nascondi "Nuovo contratto" quick-action nelle pagine dove è fuori contesto
  const quickBtn = document.querySelector('.quick-action');
  if (quickBtn) {
    quickBtn.hidden = pageId === 'admin';
  }

  if (pageId === 'new-contract') {
    syncContractEditorUi();
    loadAndRenderClients({ silent: true }); // precarica per autocomplete
  }

  if (pageId === 'clients') {
    loadAndRenderClients();
  }
}

function currentMonthContracts() {
  return contracts.filter(
    (contract) =>
      contractMonthRef(contract) === currentCompetence.month && contract.statoContratto !== 'Bozza'
  );
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
        <article class="metric-card${metric.accent ? ` accent-${metric.accent}` : ''}">
          ${metric.icon ? `<span class="metric-icon">${metric.icon}</span>` : ''}
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
    {
      label: 'Contatori inseriti',
      value: summary.monthlyUnits,
      accent: 'blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
    },
    {
      label: 'Contatori OK',
      value: summary.okUnits,
      accent: 'green',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    },
    {
      label: 'Pratiche inviate',
      value: summary.inviati.length,
      accent: 'blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    },
    {
      label: 'Scartati / K.O.',
      value: summary.scartatiUnits,
      accent: 'red',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    },
    {
      label: 'CB maturata',
      value: formatCurrency(summary.cbValidata),
      accent: 'green',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    },
    {
      label: 'CB potenziale',
      value: formatCurrency(summary.cbPotenziale),
      accent: 'amber',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    },
    {
      label: 'Target mensile',
      value: agent.targetMensile,
      accent: 'blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    },
    {
      label: 'Manca al target',
      value: summary.mancanti,
      accent: summary.mancanti === 0 ? 'green' : 'amber',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    },
    {
      label: 'In attesa (Caricati + Inviati)',
      value: summary.caricatiUnits + summary.inviatiUnits,
      accent: 'blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
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
    ['Scartati / K.O.', summary.scartatiUnits, statusColors['K.O.']],
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
        (contract) => contractMonthRef(contract) === key && contract.statoContratto === 'OK'
      )
    );
    return [label, value, key === currentCompetence.month];
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
    const matchesMonth = month === 'all' || contractMonthRef(contract) === month;
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
      emptyState.querySelector('p').textContent = 'Inizia subito inserendo il tuo primo contratto.';
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

function openContractModal(contractLike) {
  const contract = findContractById(contractLike);
  if (!contract) return;

  document.getElementById('contract-detail-title').textContent =
    contract.ragioneSociale || 'Contratto';
  document.getElementById('contract-detail-content').innerHTML = [
    detailItem('Cliente', contract.ragioneSociale),
    detailItem('ID contratto', contract.idContratto || 'Non inserito'),
    detailItem('Stato', capitalize(contract.statoContratto)),
    detailItem('Agente', contract.agenteNome || 'Sconosciuto'),
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
    detailItem('Ex fornitore', contract.exFornitore || 'Non inserito'),
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

  document.getElementById('edit-contract-button').dataset.contractId = String(contract.id);
  document.getElementById('delete-contract-button').dataset.contractId = String(contract.id);
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
  const selectedCategory = String(cbCategoryFilter || 'all')
    .trim()
    .toLowerCase();
  const filteredMonthly =
    selectedCategory === 'all'
      ? summary.monthly
      : summary.monthly.filter(
          (contract) =>
            String(contract.categoriaCliente || '')
              .trim()
              .toLowerCase() === selectedCategory
        );
  const filteredOk = filteredMonthly.filter((contract) => contract.statoContratto === 'OK');
  const filteredCaricati = filteredMonthly.filter(
    (contract) => contract.statoContratto === 'Caricato'
  );
  const filteredInviati = filteredMonthly.filter(
    (contract) => contract.statoContratto === 'Inviato'
  );
  const filteredKo = filteredMonthly.filter((contract) => contract.statoContratto === 'K.O.');

  document.getElementById('cb-category-filter').value =
    selectedCategory === 'Prospect' || selectedCategory === 'Switch ricorrente'
      ? selectedCategory
      : 'all';
  renderMetrics('cb-metrics-money', [
    {
      label: 'CB del mese',
      value: formatCurrency(
        sumContractCommissions([...filteredOk, ...filteredCaricati, ...filteredInviati])
      ),
      accent: 'blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    },
    {
      label: 'CB validata (OK)',
      value: formatCurrency(sumContractCommissions(filteredOk)),
      accent: 'green',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    },
    {
      label: 'CB in attesa',
      value: formatCurrency(sumContractCommissions([...filteredCaricati, ...filteredInviati])),
      accent: 'amber',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    },
  ]);
  renderMetrics('cb-metrics-counts', [
    { label: 'OK', value: sumContractUnits(filteredOk), accent: 'green' },
    { label: 'Caricati', value: sumContractUnits(filteredCaricati), accent: 'blue' },
    { label: 'Inviati', value: sumContractUnits(filteredInviati), accent: 'blue' },
    { label: 'K.O.', value: sumContractUnits(filteredKo), accent: 'red' },
  ]);

  const table = document.getElementById('cb-table');
  const tableWrap = table.closest('.table-wrap');
  const emptyState = document.getElementById('cb-empty');

  table.innerHTML = filteredMonthly
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

  tableWrap.hidden = filteredMonthly.length === 0;
  emptyState.hidden = filteredMonthly.length > 0;
}

function renderProgressPage() {
  const summary = getSummary();
  const quarterKey = currentCompetence.quarter;
  const yearKey = currentCompetence.year;
  const recurringPendingDone = currentMonthContracts()
    .filter(
      (contract) =>
        contract.categoriaCliente === 'switch ricorrente' &&
        ['Caricato', 'Inviato'].includes(contract.statoContratto)
    )
    .reduce((sum, contract) => sum + contractUnitCount(contract), 0);
  const recurringMonthDone = summary.okUnits + recurringPendingDone;
  const recurringMonthPercent = percent(recurringMonthDone, agent.targetMensile);
  const quarterDone = contracts
    .filter(
      (contract) => contractQuarterRef(contract) === quarterKey && contract.statoContratto === 'OK'
    )
    .reduce((sum, contract) => sum + contractUnitCount(contract), 0);
  const yearDone = contracts
    .filter((contract) => contractYearRef(contract) === yearKey && contract.statoContratto === 'OK')
    .reduce((sum, contract) => sum + contractUnitCount(contract), 0);
  const quarterPercent = percent(quarterDone, agent.targetTrimestrale);
  const yearPercent = percent(yearDone, agent.targetAnnuale);
  const daysLeft = Math.max(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate() + 1,
    1
  );
  const dailyNeed = summary.mancanti === 0 ? 0 : summary.mancanti / daysLeft;

  document.getElementById('month-target-label').textContent =
    `${summary.okUnits}/${agent.targetMensile}`;
  document.getElementById('month-target-percent').textContent = `${summary.targetPercent}%`;
  document.getElementById('month-target-bar').style.width = `${summary.targetPercent}%`;
  document.getElementById('progress-message').textContent =
    summary.mancanti === 0 ? 'Target raggiunto.' : `Ti mancano ${summary.mancanti} contatori.`;
  document.getElementById('recurring-target').textContent =
    `${recurringMonthDone}/${agent.targetMensile} contatori`;
  document.getElementById('recurring-target-percent').textContent = `${recurringMonthPercent}%`;
  document.getElementById('recurring-target-bar').style.width = `${recurringMonthPercent}%`;
  document.getElementById('recurring-target-note').textContent =
    recurringPendingDone === 0
      ? 'Nessun ricorrente in corso.'
      : `Include ${recurringPendingDone} contatori ricorrenti.`;
  document.getElementById('quarter-target').textContent =
    `${quarterDone}/${agent.targetTrimestrale} contatori`;
  document.getElementById('quarter-target-percent').textContent = `${quarterPercent}%`;
  document.getElementById('quarter-target-bar').style.width = `${quarterPercent}%`;
  document.getElementById('year-target').textContent =
    `${yearDone}/${agent.targetAnnuale} contatori`;
  document.getElementById('year-target-percent').textContent = `${yearPercent}%`;
  document.getElementById('year-target-bar').style.width = `${yearPercent}%`;
  document.getElementById('daily-need').textContent =
    dailyNeed === 0
      ? 'Target già raggiunto'
      : `${dailyNeed.toLocaleString('it-IT', { maximumFractionDigits: 1 })} contatori al giorno`;
}

function renderMonthFilter() {
  const select = document.getElementById('month-filter');
  const selected = select.value || 'all';
  const months = Array.from(
    new Set([currentCompetence.month, ...contracts.map((contract) => contractMonthRef(contract))])
  )
    .filter(Boolean)
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
  renderClientsTable();
  updateAdminVisibility();
  syncContractEditorUi();
  if (agent.ruolo === 'admin') {
    renderAdminPage();
  }
}

function allKnownContracts() {
  return [...contracts, ...adminState.contracts].filter(Boolean);
}

function findContractById(contractLike) {
  if (contractLike && typeof contractLike === 'object') return contractLike;
  return allKnownContracts().find((item) => Number(item.id) === Number(contractLike));
}

function syncContractEditorUi() {
  const banner = document.getElementById('contract-edit-banner');
  const title = document.getElementById('contract-edit-title');
  const copy = document.getElementById('contract-edit-copy');
  const submitButton = document.getElementById('contract-submit-button');
  const help = document.getElementById('contract-files-help');
  const isEditing = Boolean(contractEditorState.editingId);

  banner.hidden = !isEditing;
  title.textContent = isEditing ? 'Modifica contratto' : 'Nuovo contratto';
  copy.textContent = isEditing
    ? 'Stai modificando un contratto esistente. I documenti gia caricati restano salvati e qui puoi aggiungerne altri.'
    : '';
  submitButton.textContent = isEditing ? 'Salva modifiche' : 'Salva contratto';
  help.textContent = isEditing
    ? 'I documenti gia caricati restano collegati al contratto. Qui puoi aggiungerne altri.'
    : "Puoi aggiungere file in più passaggi: l'elenco resta cumulativo fino al salvataggio.";
  if (document.getElementById('new-contract').classList.contains('active')) {
    document.getElementById('page-title').textContent = isEditing
      ? 'Modifica contratto'
      : 'Nuovo contratto';
  }
}

function populateContractForm(contract) {
  const form = document.getElementById('contract-form');
  form.elements.ragioneSociale.value = contract.ragioneSociale || '';
  form.elements.cellulare.value = contract.cellulare || '';
  form.elements.tipoCliente.value = contract.tipoCliente || '';
  form.elements.piva.value = contract.piva || '';
  form.elements.email.value = contract.email || '';
  form.elements.idContratto.value = contract.idContratto || '';
  form.elements.categoriaCliente.value = contract.categoriaCliente || '';
  form.elements.fornitore.value = contract.fornitore || '';
  form.elements.exFornitore.value = contract.exFornitore || '';
  form.elements.nomeOfferta.value = contract.nomeOfferta || '';
  form.elements.tipoFornitura.value = contract.tipoFornitura || '';
  form.elements.pod.value = contract.pod || '';
  form.elements.pdr.value = contract.pdr || '';
  form.elements.metodoPagamento.value = contract.metodoPagamento || '';
  form.elements.iban.value = contract.iban || '';
  form.elements.indirizzoFatturazione.value = contract.indirizzoFatturazione || '';
  form.elements.indirizzoFornitura.value = contract.indirizzoFornitura || '';
  form.elements.descrizione.value = contract.descrizione || '';
  form.elements.statoContratto.value = contract.statoContratto || 'Caricato';

  document.querySelectorAll('input[name="tipoOperazione"]').forEach((input) => {
    input.checked = Array.isArray(contract.tipoOperazione)
      ? contract.tipoOperazione.includes(input.value)
      : false;
  });

  if (agent.ruolo === 'admin' && form.elements.agenteId) {
    form.elements.agenteId.value = contract.agenteId ? String(contract.agenteId) : String(agent.id);
  }

  selectedContractFiles = [];
  existingContractFiles = Array.isArray(contract.fileContratto)
    ? contract.fileContratto.slice()
    : [];
  renderSelectedContractFiles();
  updateConditionalFields();
}

function resetContractEditor({ keepFeedback = false } = {}) {
  const form = document.getElementById('contract-form');
  contractEditorState.editingId = null;
  contractEditorState.originalStatus = 'Caricato';
  form.reset();
  const dropdown = document.getElementById('client-suggestions');
  if (dropdown) dropdown.hidden = true;
  selectedContractFiles = [];
  existingContractFiles = [];
  renderSelectedContractFiles();
  if (agent.ruolo === 'admin' && form.elements.agenteId) {
    form.elements.agenteId.value = String(agent.id);
  }
  form.elements.statoContratto.value = 'Caricato';
  updateConditionalFields();
  syncContractEditorUi();
  if (!keepFeedback) {
    setFormFeedback('', '');
  }
}

function startEditingContract(contractLike) {
  const contract = findContractById(contractLike);
  if (!contract) return;

  contractEditorState.editingId = Number(contract.id);
  contractEditorState.originalStatus = contract.statoContratto || 'Caricato';
  populateContractForm(contract);
  syncContractEditorUi();
  closeContractModal();
  setActivePage('new-contract');
  document
    .getElementById('contract-edit-banner')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function startEditingCurrentContract() {
  const contractId = Number(document.getElementById('edit-contract-button').dataset.contractId);
  if (!contractId) return;
  startEditingContract(contractId);
}

async function handleDeleteCurrentContract() {
  const contractId = Number(document.getElementById('delete-contract-button').dataset.contractId);
  if (!contractId) return;

  const contract = findContractById(contractId);
  const label = contract?.ragioneSociale || 'questo contratto';
  const confirmed = window.confirm(`Vuoi eliminare definitivamente ${label}?`);
  if (!confirmed) return;

  const deleteButton = document.getElementById('delete-contract-button');
  deleteButton.disabled = true;
  deleteButton.textContent = 'Elimino...';

  try {
    if (typeof baserowClient !== 'undefined' && baserowClient.isConfigured()) {
      await baserowClient.deleteContract(contractId);
      await loadAndRenderContracts({ silent: true, force: true });
    } else if (demoFallbackEnabled) {
      contracts = contracts.filter((item) => Number(item.id) !== contractId);
      saveContracts();
      renderAll();
    } else {
      throw new Error('Connessione non disponibile. Contratto non eliminato.');
    }

    if (Number(contractEditorState.editingId) === contractId) {
      resetContractEditor();
    }
    closeContractModal();
    setFormFeedback('success', 'Contratto eliminato.');
  } catch (error) {
    setFormFeedback('error', error.message || 'Contratto non eliminato.');
  } finally {
    deleteButton.disabled = false;
    deleteButton.textContent = 'Elimina contratto';
  }
}

function buildContractDraft(form, saveMode = 'submit') {
  const stato = saveMode === 'draft' ? 'Bozza' : normalizeStatus(form.get('statoContratto'));
  const dateInserimento = toInputDate(today);
  const fornitore = String(form.get('fornitore')).trim();
  const assignedAgentId =
    agent.ruolo === 'admin'
      ? Number.parseInt(String(form.get('agenteId') || ''), 10) || agent.id
      : agent.id;

  return {
    id: Date.now(),
    saveMode,
    agenteId: assignedAgentId,
    dataInserimento: dateInserimento,
    dataInizioFornitura: calculateSupplyStartDate(dateInserimento, fornitore),
    idContratto: String(form.get('idContratto')).trim(),
    ragioneSociale: String(form.get('ragioneSociale')).trim(),
    cellulare: String(form.get('cellulare')).trim(),
    tipoCliente: String(form.get('tipoCliente')).trim(),
    categoriaCliente: String(form.get('categoriaCliente')).trim().toLowerCase(),
    fornitore,
    exFornitore: String(form.get('exFornitore')).trim(),
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
    existingFileContratto: existingContractFiles.slice(),
    statoContratto: stato,
    cbUnitariaSnapshot: agent.cbUnitaria,
    cbMaturata:
      stato === 'Bozza' || stato === 'K.O.' || stato === 'Switch - Out' ? 0 : agent.cbUnitaria,
  };
}

function buildContractFormData(draft) {
  const formData = new FormData();
  [
    'saveMode',
    'agenteId',
    'ragioneSociale',
    'cellulare',
    'tipoCliente',
    'idContratto',
    'categoriaCliente',
    'fornitore',
    'exFornitore',
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

  draft.existingFileContratto.forEach((file) => {
    formData.append('retainedFileName', file.name || '');
  });

  draft.fileContratto.forEach((file) => {
    formData.append('fileContratto', file);
  });

  return formData;
}

function validateContractDraft(draft, saveMode = 'submit') {
  if (saveMode === 'draft') {
    if (!draft.ragioneSociale && !draft.cellulare && !draft.email && !draft.piva) {
      return 'Per salvare una bozza inserisci almeno cliente, cellulare, email o P.IVA.';
    }

    if (draft.email && !EMAIL_RE.test(draft.email)) {
      return 'Email non valida.';
    }

    if (draft.piva && !isValidVatOrFiscalCode(draft.piva)) {
      return 'Inserisci una P.IVA di 11 cifre o un codice fiscale valido.';
    }

    if (draft.iban && !IBAN_RE.test(draft.iban.replace(/\s+/g, '').toUpperCase())) {
      return 'IBAN non valido.';
    }

    if (draft.fileContratto.length + draft.existingFileContratto.length > maxContractFiles) {
      return `Puoi caricare al massimo ${maxContractFiles} documenti.`;
    }

    for (const file of draft.fileContratto) {
      if (!isAllowedContractFile(file)) {
        return 'Carica solo PDF, Word, Excel, PowerPoint, OpenDocument o immagini.';
      }

      if (file.size > maxContractFileSize) {
        return 'Ogni documento deve essere al massimo di 15 MB.';
      }
    }

    return '';
  }

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

  if (draft.fileContratto.length + draft.existingFileContratto.length > maxContractFiles) {
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
  const totalFiles = existingContractFiles.length + selectedContractFiles.length;

  container.hidden = totalFiles === 0;
  counter.textContent = contractFilesCounterLabel(totalFiles, true);
  pill.textContent = contractFilesCounterLabel(totalFiles, false);

  list.innerHTML = [
    ...existingContractFiles.map(
      (file, index) => `
        <div class="file-chip existing">
          <span class="file-chip-name">
            ${escapeHtml(file.visibleName || file.name || 'Documento')}
            <small>(gia caricato)</small>
          </span>
          <button type="button" data-remove-existing-contract-file="${index}">Rimuovi</button>
        </div>
      `
    ),
    ...selectedContractFiles.map(
      (file, index) => `
        <div class="file-chip">
          <span class="file-chip-name">${escapeHtml(file.name)} <small>(${formatFileSize(file.size)})</small></span>
          <button type="button" data-remove-contract-file="${index}">Rimuovi</button>
        </div>
      `
    ),
  ].join('');

  list.querySelectorAll('[data-remove-existing-contract-file]').forEach((button) => {
    button.addEventListener('click', () => {
      existingContractFiles.splice(Number(button.dataset.removeExistingContractFile), 1);
      renderSelectedContractFiles();
    });
  });

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
  populateContractAgentOptions();
}

function populateContractAgentOptions() {
  const select = document.getElementById('contract-agent-select');
  if (!select) return;

  if (agent.ruolo !== 'admin') {
    select.innerHTML = '';
    select.required = false;
    return;
  }

  const options = (adminState.agents.length ? adminState.agents : [agent])
    .slice()
    .sort((left, right) => left.nome.localeCompare(right.nome, 'it'));

  select.innerHTML = [
    '<option value="">Seleziona agente</option>',
    ...options.map(
      (agentRow) =>
        `<option value="${agentRow.id}">${escapeHtml(agentRow.nome)}${
          agentRow.attivo === false ? ' (disattivo)' : ''
        }</option>`
    ),
  ].join('');
  select.required = true;
  select.value = String(agent.id);
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
    populateContractAgentOptions();
    renderAdminAgentList(stats, agents);
    renderAdminContracts(adminContracts, agents);
    await loadAdminSupplierCutoffs();
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
    setAdminSupplierCutoffFeedback('error', error.message || 'Cut-off fornitore non disponibile.');
  }
}

function renderAdminMetrics(stats) {
  const activeAgents = stats.agents.filter((row) => row.attivo).length;
  renderMetrics('admin-metrics-status', [
    { label: 'Contatori mese', value: stats.totals.contracts, accent: 'blue' },
    { label: 'Validati (OK)', value: stats.totals.ok, accent: 'green' },
    { label: 'Caricati', value: stats.totals.caricati, accent: 'blue' },
    { label: 'Inviati', value: stats.totals.inviati, accent: 'blue' },
    { label: 'K.O.', value: stats.totals.ko, accent: 'red' },
    { label: 'Switch Out', value: stats.totals.switchOut, accent: 'red' },
  ]);
  renderMetrics('admin-metrics-summary', [
    {
      label: 'CB validata mese',
      value: formatCurrency(stats.totals.cbValidata),
      accent: 'green',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    },
    {
      label: 'CB potenziale mese',
      value: formatCurrency(stats.totals.cbPotenziale),
      accent: 'amber',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    },
    {
      label: 'Agenti attivi',
      value: activeAgents,
      accent: 'blue',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
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
            <div><span>Contatori</span><strong>${row.pratiche || row.contratti || 0}</strong></div>
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
          contract.exFornitore,
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
      (adminState.contractSentFilter === 'pending' &&
        contract.statoContratto !== 'Inviato' &&
        contract.statoContratto !== 'Bozza') ||
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
  if (status === 'Bozza') return 'admin-contract-row is-muted';
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
    adminState.contractSentFilter = 'all';
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
        (contract) =>
          Number(contract.id) === id &&
          contract.statoContratto !== 'Inviato' &&
          contract.statoContratto !== 'Bozza'
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
      contract.statoContratto !== 'Inviato' &&
      contract.statoContratto !== 'Bozza'
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

function setAdminSupplierCutoffFeedback(type, message) {
  const feedback = document.getElementById('admin-supplier-cutoff-feedback');
  feedback.className = type ? `is-${type}` : '';
  feedback.textContent = message;
}

function renderAdminSupplierCutoffList(cutoffs) {
  const container = document.getElementById('admin-supplier-cutoff-list');
  if (!cutoffs.length) {
    container.innerHTML = `
      <p class="admin-form-copy compact">
        Nessun cut-off fornitore salvato per questo mese.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-wrap flat admin-supplier-cutoff-table">
      <table>
        <thead>
          <tr>
            <th>Fornitore</th>
            <th>Data cut-off</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          ${cutoffs
            .map(
              (row) => `
            <tr>
              <td data-label="Fornitore">${escapeHtml(row.supplierName || 'Non assegnato')}</td>
              <td data-label="Data cut-off">${
                row.cutoffDate ? formatDate.format(new Date(row.cutoffDate)) : 'Non impostata'
              }</td>
              <td data-label="Azione">
                <button
                  class="secondary-button compact-button"
                  type="button"
                  data-cutoff-use="${Number(row.supplierId)}"
                  data-cutoff-date="${escapeHtml(row.cutoffDate || '')}"
                >
                  Modifica
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadAdminSupplierCutoffs({ silent = false } = {}) {
  const monthInput = document.getElementById('admin-supplier-cutoff-month');
  const supplierSelect = document.getElementById('admin-supplier-cutoff-supplier');
  const dateInput = document.getElementById('admin-supplier-cutoff-date');
  const currentMonth = monthInput.value || adminState.supplierCutoffMonth || monthKey(new Date());

  monthInput.value = currentMonth;
  adminState.supplierCutoffMonth = currentMonth;

  try {
    const data = await baserowClient.getAdminSupplierCutoffs(currentMonth);
    const options = data.suppliers || [];
    adminState.supplierCutoffBySupplier = Object.fromEntries(
      (data.cutoffs || []).map((row) => [String(row.supplierId), row.cutoffDate || ''])
    );
    const currentSelected = supplierSelect.value;
    supplierSelect.innerHTML = [
      '<option value="">Seleziona fornitore</option>',
      ...options.map(
        (row) => `<option value="${Number(row.id)}">${escapeHtml(titleCase(row.name))}</option>`
      ),
    ].join('');

    if (currentSelected && options.some((row) => String(row.id) === String(currentSelected))) {
      supplierSelect.value = currentSelected;
      handleAdminSupplierSelectionChange();
    } else {
      supplierSelect.value = '';
      dateInput.value = '';
    }

    renderAdminSupplierCutoffList(data.cutoffs || []);
    setAdminSupplierCutoffFeedback(
      'success',
      data.cutoffs && data.cutoffs.length
        ? `${data.cutoffs.length} cut-off fornitore caricati per ${currentMonth}.`
        : `Nessun cut-off fornitore salvato per ${currentMonth}.`
    );
  } catch (error) {
    adminState.supplierCutoffBySupplier = {};
    supplierSelect.innerHTML = '<option value="">Seleziona fornitore</option>';
    dateInput.value = '';
    renderAdminSupplierCutoffList([]);
    if (!silent) {
      console.error('[ADMIN_SUPPLIER_LOAD_ERROR]', error);
      setAdminSupplierCutoffFeedback(
        'error',
        error.message ||
          'Impossibile caricare i cut-off fornitore. Verifica la connessione a Baserow.'
      );
    }
  }
}

function handleAdminSupplierSelectionChange() {
  const supplierSelect = document.getElementById('admin-supplier-cutoff-supplier');
  const dateInput = document.getElementById('admin-supplier-cutoff-date');
  const supplierId = String(supplierSelect.value || '');
  if (!supplierId) {
    dateInput.value = '';
    return;
  }
  dateInput.value = adminState.supplierCutoffBySupplier[supplierId] || '';
}

function handleSupplierCutoffListClick(event) {
  const button = event.target.closest('[data-cutoff-use]');
  if (!button) return;
  const supplierSelect = document.getElementById('admin-supplier-cutoff-supplier');
  const dateInput = document.getElementById('admin-supplier-cutoff-date');
  supplierSelect.value = String(button.dataset.cutoffUse || '');
  dateInput.value = String(button.dataset.cutoffDate || '');
  setAdminSupplierCutoffFeedback('', 'Fornitore caricato. Puoi aggiornare la data e salvare.');
}

async function handleAdminSupplierCutoffSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const month = String(form.get('month') || '').trim();
  const supplierId = Number(String(form.get('supplierId') || '').trim());
  const cutoffDate = String(form.get('cutoffDate') || '').trim();
  const saveButton = document.getElementById('admin-supplier-cutoff-save');

  if (!month || !supplierId || !cutoffDate) {
    setAdminSupplierCutoffFeedback('error', 'Seleziona mese, fornitore e data cut-off.');
    return;
  }

  saveButton.disabled = true;
  setAdminSupplierCutoffFeedback('', 'Salvataggio cut-off fornitore...');

  try {
    await baserowClient.saveAdminSupplierCutoff({ month, supplierId, cutoffDate });
    await loadCompetitionCutoffs({ silent: true });
    await loadCurrentCompetence({ silent: true });
    await loadAndRenderContracts({ silent: true, force: true });
    await loadAdminSupplierCutoffs({ silent: true });
    setAdminSupplierCutoffFeedback('success', 'Cut-off fornitore salvato.');
  } catch (error) {
    setAdminSupplierCutoffFeedback('error', error.message || 'Cut-off fornitore non salvato.');
  } finally {
    saveButton.disabled = false;
  }
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
    await loadCurrentCompetence({ silent: true });
    await loadAndRenderContracts({ silent: true, force: true });
    document.getElementById('agent-name').textContent = agent.nome;
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

function contractMonthRef(contract) {
  return String(contract?.meseRiferimento || contract?.dataInserimento || '').slice(0, 7);
}

function contractQuarterRef(contract) {
  if (contract?.trimestreRiferimento) return String(contract.trimestreRiferimento);
  const month = contractMonthRef(contract);
  const date = month ? dateFromMonthKey(month) : new Date(contract?.dataInserimento || Date.now());
  return getQuarterKey(date);
}

function contractYearRef(contract) {
  if (contract?.annoRiferimento) return String(contract.annoRiferimento);
  const month = contractMonthRef(contract);
  return month ? month.slice(0, 4) : String(contract?.dataInserimento || '').slice(0, 4);
}

function dateFromMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getRecentMonths(count) {
  const anchor = dateFromMonthKey(currentCompetence.month || monthKey(today));
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - (count - 1 - index), 1);
    return monthKey(date);
  });
}

function getQuarterKey(date) {
  return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
}

function currentPeriodLabel() {
  return capitalize(
    formatMonth.format(dateFromMonthKey(currentCompetence.month || monthKey(today)))
  );
}

function contractUnitCount(contract) {
  if (Number.isFinite(Number(contract.unitCount)) && Number(contract.unitCount) > 0) {
    return Number(contract.unitCount);
  }
  const supplyType = String(contract.tipoFornitura || '').toLowerCase();
  const customerCategory = String(contract.categoriaCliente || '');
  return supplyType === 'dual' && customerCategory === 'Prospect' ? 2 : 1;
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
  const valid = ['Bozza', 'OK', 'Caricato', 'Inviato', 'K.O.', 'Switch - Out'];
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

function updateStartDatePrediction() {
  const predictedDateEl = document.getElementById('predicted-start-date');
  const infoBanner = document.getElementById('new-contract-summary');
  if (!predictedDateEl || !infoBanner) return;
  const fornitoreValue = document.getElementById('fornitore-input')?.value || '';
  const pred = calculateSupplyStartDate(toInputDate(new Date()), fornitoreValue);
  predictedDateEl.textContent = formatDate.format(new Date(pred));
  infoBanner.hidden = false;
}

async function initApp() {
  // Aggiungi listener per predizione data inizio fornitura nel form
  const infoBanner = document.getElementById('new-contract-summary');
  const predictedDateEl = document.getElementById('predicted-start-date');

  if (infoBanner && predictedDateEl) {
    updateStartDatePrediction();
  }

  try {
    await loadCompetitionCutoffs({ silent: true });

    if (isStaticFileMode && demoFallbackEnabled) {
      contracts = loadContracts();
      setConnectionStatus('demo', 'Modalità demo');
      setAuthLocked(false);
      await loadCurrentCompetence({ silent: true });
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
        await loadCurrentCompetence({ silent: true });
        await loadAndRenderContracts({ silent: true, force: true });
        document.getElementById('agent-name').textContent = agent.nome;
        setConnectionStatus('online', 'Database connesso');
        setAuthLocked(false);
      } catch (err) {
        console.error(err);
        contracts = demoFallbackEnabled ? loadContracts() : [];
        await loadCurrentCompetence({ silent: true });
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
      await loadCurrentCompetence({ silent: true });
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

// ---- Clienti Management ----

async function loadAndRenderClients({ silent = false, force = false } = {}) {
  if (clientsRefreshInFlight || typeof baserowClient === 'undefined' || !baserowClient.isConfigured()) return;
  
  if (!force && clients.length > 0) {
    renderClientsTable();
    return;
  }

  clientsRefreshInFlight = true;
  try {
    const data = await baserowClient.listClients();
    clients = Array.isArray(data) ? data : [];
    renderClientsTable();
  } catch (error) {
    if (!silent) console.error('Errore caricamento clienti:', error);
  } finally {
    clientsRefreshInFlight = false;
  }
}

function renderClientsTable() {
  const body = document.getElementById('clients-body');
  const searchInput = document.getElementById('clients-search');
  if (!body) return;

  const searchTerm = (searchInput?.value || '').toLowerCase().trim();
  
  const filtered = clients.filter(c => {
    return !searchTerm || 
           c.ragioneSociale.toLowerCase().includes(searchTerm) ||
           c.piva.toLowerCase().includes(searchTerm) ||
           c.email.toLowerCase().includes(searchTerm);
  });

  if (filtered.length === 0) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 3rem; color: #64748b;">Nessun cliente trovato.</td></tr>`;
    return;
  }

  body.innerHTML = filtered.map(c => `
    <tr data-client-id="${c.id}" tabindex="0">
      <td>
        <div class="client-name-cell">
          <strong>${escapeHtml(c.ragioneSociale)}</strong>
          <span class="client-id-sub">ID: ${c.id}</span>
        </div>
      </td>
      <td><code class="piva-tag">${escapeHtml(c.piva)}</code></td>
      <td>
        <div class="contact-info">
          <div class="contact-line">
            <svg class="small-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>${escapeHtml(c.email || '-')}</span>
          </div>
          <div class="contact-line">
            <svg class="small-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1-2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>${escapeHtml(c.cellulare || '-')}</span>
          </div>
        </div>
      </td>
      <td class="addr-cell">${escapeHtml(c.indirizzoFatturazione || '-')}</td>
      <td class="actions-col">
        <button class="secondary-button compact-button edit-client-action-btn" data-id="${c.id}">
          Modifica
        </button>
      </td>
    </tr>
  `).join('');

  // Aggiungi listener per i pulsanti di modifica
  body.querySelectorAll('.edit-client-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openClientModal(Number(btn.dataset.id));
    });
  });
}

function openClientModal(id) {
  const client = clients.find(c => c.id === id);
  if (!client) return;

  const modal = document.getElementById('client-modal');
  const form = document.getElementById('edit-client-form');
  const subtitle = document.getElementById('client-modal-subtitle');
  const feedback = document.getElementById('client-edit-feedback');

  form.elements['id'].value = client.id;
  form.elements['ragioneSociale'].value = client.ragioneSociale;
  form.elements['piva'].value = client.piva;
  form.elements['email'].value = client.email;
  form.elements['cellulare'].value = client.cellulare;
  form.elements['indirizzoFatturazione'].value = client.indirizzoFatturazione;

  if (subtitle) {
    subtitle.textContent = `ID: ${client.id}${client.piva ? ' · ' + client.piva : ''}`;
    subtitle.hidden = false;
  }

  if (feedback) {
    feedback.hidden = true;
    feedback.className = 'client-edit-feedback';
    feedback.textContent = '';
  }

  modal.hidden = false;
  modal.classList.add('active');
  form.elements['ragioneSociale'].focus();
}

function closeClientModal() {
  const modal = document.getElementById('client-modal');
  modal.hidden = true;
  modal.classList.remove('active');
}

async function handleClientEditSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.elements['id'].value;
  const submitBtn = document.getElementById('save-client-button');
  const feedback = document.getElementById('client-edit-feedback');

  const payload = {
    ragioneSociale: form.elements['ragioneSociale'].value.trim(),
    piva: form.elements['piva'].value.trim(),
    email: form.elements['email'].value.trim(),
    cellulare: form.elements['cellulare'].value.trim(),
    indirizzoFatturazione: form.elements['indirizzoFatturazione'].value.trim(),
  };

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Salvataggio...';
  if (feedback) {
    feedback.hidden = true;
    feedback.className = 'client-edit-feedback';
  }

  try {
    await baserowClient.updateClient(id, payload);
    await loadAndRenderClients({ force: true, silent: true });
    if (feedback) {
      feedback.textContent = 'Anagrafica aggiornata con successo.';
      feedback.className = 'client-edit-feedback is-success';
      feedback.hidden = false;
    }
    setTimeout(closeClientModal, 1200);
  } catch (error) {
    console.error(error);
    if (feedback) {
      feedback.textContent = error.message || 'Errore durante il salvataggio.';
      feedback.className = 'client-edit-feedback is-error';
      feedback.hidden = false;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function setupContractClientAutocomplete() {
  const input = document.getElementById('contract-ragione-sociale');
  const dropdown = document.getElementById('client-suggestions');
  if (!input || !dropdown) return;

  let suppressClose = false;

  function showSuggestions() {
    const q = input.value.trim().toLowerCase();
    if (!q || clients.length === 0) {
      dropdown.hidden = true;
      return;
    }
    const matches = clients
      .filter(
        (c) =>
          c.ragioneSociale.toLowerCase().includes(q) || c.piva.toLowerCase().includes(q)
      )
      .slice(0, 8);

    if (matches.length === 0) {
      dropdown.hidden = true;
      return;
    }

    dropdown.innerHTML = matches
      .map(
        (c) => `
      <li class="client-suggestion-item" data-id="${c.id}" role="option" tabindex="-1">
        <span class="client-suggestion-name">${escapeHtml(c.ragioneSociale)}</span>
        <span class="client-suggestion-meta">${escapeHtml(c.piva || '')}${c.email ? ' · ' + escapeHtml(c.email) : ''}</span>
      </li>`
      )
      .join('');

    dropdown.querySelectorAll('.client-suggestion-item').forEach((item) => {
      item.addEventListener('mousedown', () => {
        suppressClose = true;
      });
      item.addEventListener('click', () => {
        const id = Number(item.dataset.id);
        const client = clients.find((c) => c.id === id);
        if (client) fillClientFieldsFromLookup(client);
        dropdown.hidden = true;
        suppressClose = false;
        input.focus();
      });
    });

    dropdown.hidden = false;
  }

  input.addEventListener('input', showSuggestions);
  input.addEventListener('focus', showSuggestions);
  input.addEventListener('blur', () => {
    if (!suppressClose) dropdown.hidden = true;
    suppressClose = false;
  });
}

function fillClientFieldsFromLookup(client) {
  const form = document.getElementById('contract-form');
  form.elements.ragioneSociale.value = client.ragioneSociale;
  form.elements.piva.value = client.piva;
  form.elements.email.value = client.email;
  form.elements.cellulare.value = client.cellulare;
  form.elements.indirizzoFatturazione.value = client.indirizzoFatturazione;
}

initApp();

async function loadCurrentCompetence({ silent = false } = {}) {
  const fallback = {
    month: monthKey(new Date()),
    quarter: getQuarterKey(new Date()),
    year: String(new Date().getFullYear()),
  };

  if (typeof baserowClient === 'undefined' || !baserowClient.isConfigured()) {
    currentCompetence = fallback;
    return;
  }

  try {
    const period = await baserowClient.getCurrentCompetence();
    currentCompetence = {
      month: String(period.month || fallback.month),
      quarter: String(period.quarter || fallback.quarter),
      year: String(period.year || fallback.year),
    };
  } catch (error) {
    currentCompetence = fallback;
    if (!silent) {
      console.error(error);
    }
  }
}

async function loadCompetitionCutoffs({ silent = false } = {}) {
  if (typeof baserowClient === 'undefined' || !baserowClient.isConfigured()) {
    competitionData = {};
    return;
  }

  try {
    const data = await baserowClient.getCompetitionCutoffs();
    competitionData = data && typeof data === 'object' ? data : {};
  } catch (error) {
    competitionData = {};
    if (!silent) console.warn('Cut-off dinamici non disponibili:', error);
  }

  const predictedDateEl = document.getElementById('predicted-start-date');
  if (predictedDateEl) {
    updateStartDatePrediction();
  }
}
