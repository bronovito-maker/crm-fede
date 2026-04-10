// baserowClient.js

const baserowClient = {
  isConfigured() {
    return Boolean(
      String(CONFIG.BASEROW_TOKEN || "").trim() &&
      CONFIG.BASEROW_TABLE_AGENTI_ID &&
      CONFIG.BASEROW_TABLE_CONTRATTI_ID
    );
  },

  getHeaders() {
    return {
      "Authorization": `Token ${String(CONFIG.BASEROW_TOKEN).trim()}`,
      "Content-Type": "application/json"
    };
  },

  async getCurrentAgent() {
    if (!this.isConfigured()) throw new Error("Configurazione Baserow mancante");
    
    const url = `${CONFIG.BASEROW_BASE_URL}/api/database/rows/table/${CONFIG.BASEROW_TABLE_AGENTI_ID}/${CONFIG.CURRENT_AGENT_ID}/?user_field_names=true`;
    
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      throw new Error(`Errore API Baserow (Agenti): ${response.status}`);
    }
    
    const data = await response.json();
    return {
      id: data.id,
      nome: data.nome || "Agente Sconosciuto", 
      email: data.email || "",
      cbUnitaria: parseFloat(data.cb_unitaria) || 0,
      targetMensile: parseInt(data.target_mensile, 10) || 0,
      targetTrimestrale: parseInt(data.target_trimestrale, 10) || 0,
      targetAnnuale: parseInt(data.target_annuale, 10) || 0,
      ruolo: data.ruolo ? data.ruolo.value : "agente",
      attivo: data.attivo !== undefined ? data.attivo : true,
    };
  },

  async listContracts() {
    if (!this.isConfigured()) throw new Error("Configurazione Baserow mancante");

    const url = `${CONFIG.BASEROW_BASE_URL}/api/database/rows/table/${CONFIG.BASEROW_TABLE_CONTRATTI_ID}/?user_field_names=true&order_by=-data_inserimento&size=200`;
    
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      throw new Error(`Errore API Baserow (Contratti list): ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.results || [];
    
    // Filtro manuale lato frontend per MVP
    const agentContracts = rows.filter(r => {
      // Un Single Link to Table in Baserow con user_field_names ritorna un array di oggetti
      if (Array.isArray(r.agente) && r.agente.length > 0) {
        return r.agente[0].id === CONFIG.CURRENT_AGENT_ID;
      }
      return false;
    });

    return agentContracts.map(c => ({
      id: c.id,
      agenteId: Array.isArray(c.agente) && c.agente.length ? c.agente[0].id : null,
      dataInserimento: c.data_inserimento || "",
      ragioneSociale: c.ragione_sociale || "",
      cellulare: c.cellulare || "",
      tipoCliente: c.tipo_cliente && c.tipo_cliente.value ? c.tipo_cliente.value : "",
      piva: c.piva || "",
      email: c.email || "",
      indirizzo: c.indirizzo || "",
      indirizzoFatturazione: c.indirizzo_fatturazione || "",
      indirizzoFornitura: c.indirizzo_fornitura || "",
      descrizione: c.descrizione || "",
      statoContratto: c.stato_contratto && c.stato_contratto.value ? c.stato_contratto.value : "in attesa",
      cbUnitariaSnapshot: parseFloat(c.cb_unitaria_snapshot) || 0,
      cbMaturata: parseFloat(c.cb_maturata ?? (c.stato_contratto?.value !== 'scartato' ? c.cb_unitaria_snapshot : 0)) || 0,
      meseRiferimento: c.mese_riferimento || "",
      trimestreRiferimento: c.trimestre_riferimento || "",
      annoRiferimento: c.anno_riferimento || ""
    }));
  },

  async createContract(payload) {
    if (!this.isConfigured()) throw new Error("Configurazione Baserow mancante");
    
    const url = `${CONFIG.BASEROW_BASE_URL}/api/database/rows/table/${CONFIG.BASEROW_TABLE_CONTRATTI_ID}/?user_field_names=true`;
    
    const response = await fetch(url, { 
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errBody = await response.text();
      console.error("API error details:", errBody);
      throw new Error(`Errore API Baserow (Create): ${response.status}`);
    }
    
    return await response.json();
  },

  async updateContractStatus(contractId, status) {
    if (!this.isConfigured()) throw new Error("Configurazione Baserow mancante");
    
    const url = `${CONFIG.BASEROW_BASE_URL}/api/database/rows/table/${CONFIG.BASEROW_TABLE_CONTRATTI_ID}/${contractId}/?user_field_names=true`;

    const response = await fetch(url, { 
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ stato_contratto: status })
    });
    
    if (!response.ok) {
      throw new Error(`Errore API Baserow (Update): ${response.status}`);
    }
    
    return await response.json();
  }
};
