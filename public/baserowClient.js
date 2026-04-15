// Client API interno: il browser non parla direttamente con Baserow.
const baserowClient = {
  isConfigured() {
    return true;
  },

  async getCurrentAgent() {
    return fetchJson('/api/agent');
  },

  async getSession() {
    return fetchJson('/api/session');
  },

  async login(credentials) {
    return fetchJson('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    return fetchJson('/api/logout', {
      method: 'POST',
    });
  },

  async listContracts() {
    return fetchJson('/api/contracts');
  },

  async getCurrentCompetence() {
    return fetchJson('/api/competence/current');
  },

  async getCompetitionCutoffs() {
    return fetchJson('/api/competenze');
  },

  async createContract(contract) {
    return fetchJson('/api/contracts', {
      method: 'POST',
      body: contract,
    });
  },

  async updateContract(contractId, contract) {
    return fetchJson(`/api/contracts/${contractId}`, {
      method: 'PATCH',
      body: contract,
    });
  },

  async deleteContract(contractId) {
    return fetchJson(`/api/contracts/${contractId}`, {
      method: 'DELETE',
    });
  },

  async updateContractStatus(contractId, status) {
    return fetchJson(`/api/contracts/${contractId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async listAdminAgents() {
    return fetchJson('/api/admin/agents');
  },

  async listAdminContracts() {
    return fetchJson('/api/admin/contracts');
  },

  async createAdminAgent(agent) {
    return fetchJson('/api/admin/agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  },

  async updateAdminAgent(agentId, agent) {
    return fetchJson(`/api/admin/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(agent),
    });
  },

  async updateAdminContractSent(contractId, sent) {
    return fetchJson(`/api/admin/contracts/${contractId}/sent`, {
      method: 'PATCH',
      body: JSON.stringify({ sent }),
    });
  },

  async getAdminStats() {
    return fetchJson('/api/admin/stats');
  },

  async getAdminSupplierCutoffs(month) {
    const monthParam = encodeURIComponent(String(month || ''));
    return fetchJson(`/api/admin/supplier-cutoffs?month=${monthParam}`);
  },

  async saveAdminSupplierCutoff(payload) {
    return fetchJson('/api/admin/supplier-cutoffs', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

async function fetchJson(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: isFormData
      ? options.headers || {}
      : {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Richiesta non riuscita.');
    error.status = response.status;
    error.code = data.error || 'API_ERROR';
    throw error;
  }

  return data;
}
