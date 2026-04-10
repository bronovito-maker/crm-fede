// Client API interno: il browser non parla direttamente con Baserow.
const baserowClient = {
  isConfigured() {
    return true;
  },

  async getCurrentAgent() {
    return fetchJson("/api/agent");
  },

  async getSession() {
    return fetchJson("/api/session");
  },

  async login(credentials) {
    return fetchJson("/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    return fetchJson("/api/logout", {
      method: "POST",
    });
  },

  async listContracts() {
    return fetchJson("/api/contracts");
  },

  async createContract(contract) {
    return fetchJson("/api/contracts", {
      method: "POST",
      body: contract,
    });
  },

  async updateContractStatus(contractId, status) {
    return fetchJson(`/api/contracts/${contractId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

async function fetchJson(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: isFormData
      ? options.headers || {}
      : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Richiesta non riuscita.");
    error.status = response.status;
    error.code = data.error || "API_ERROR";
    throw error;
  }

  return data;
}
