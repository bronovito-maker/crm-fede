// config.js
//
// Setup locale:
// 1. Apri l'app nel browser.
// 2. Apri la console.
// 3. Esegui:
//    localStorage.setItem("ENERGIA_CRM_BASEROW_TOKEN", "TOKEN_BASEROW")
// 4. Ricarica la pagina.
//
// Nota: per produzione non usare token Baserow nel browser.
// Metti Baserow dietro un piccolo proxy/API server.

const CONFIG = {
  BASEROW_BASE_URL: "https://api.baserow.io",

  BASEROW_TOKEN_STORAGE_KEY: "ENERGIA_CRM_BASEROW_TOKEN",
  BASEROW_TOKEN: localStorage.getItem("ENERGIA_CRM_BASEROW_TOKEN") || "",

  BASEROW_TABLE_AGENTI_ID: "925635",
  BASEROW_TABLE_CONTRATTI_ID: "925638",

  CURRENT_AGENT_ID: 3
};
