(() => {
  'use strict';

  const output = document.getElementById('output');
  if (!output) return;

  function buildContractDraft(result) {
    const invoice = result?.invoice || {};
    const cte = result?.cte || {};
    const months = Number(invoice.billingMonths) || 1;
    const annualConsumption = Number(invoice.consumption) > 0
      ? (Number(invoice.consumption) * 12) / months
      : '';
    const tipoFornitura = ['luce', 'gas'].includes(invoice.commodity) ? invoice.commodity : '';
    const tipoCliente = cte.customerType === 'business' ? 'Business' : 'Privato';
    const supplier = cte.supplier || 'Altro';
    const offerName = supplier ? `${supplier} - Preventivo da bolletta` : 'Offerta da preventivatore';
    return {
      ragioneSociale: invoice.customerName || '',
      cellulare: invoice.phone || '',
      tipoCliente,
      categoriaCliente: 'Prospect',
      piva: invoice.vatNumber || invoice.taxId || '',
      email: invoice.email || '',
      indirizzoFatturazione: invoice.address || '',
      fornitore: supplier,
      nomeOfferta: offerName,
      tipoFornitura,
      pod: invoice.pod || '',
      pdr: invoice.pdr || '',
      consumoAnnuoLuce: tipoFornitura === 'luce' ? annualConsumption : '',
      consumoAnnuoGas: tipoFornitura === 'gas' ? annualConsumption : '',
      potenzaImpegnata: '',
      metodoPagamento: '',
      tipoOperazione: 'switch',
    };
  }

  function injectActions() {
    const report = output.querySelector('.report');
    const actions = report?.querySelector('.actions');
    const result = window.__preventivatoreLastResult;
    if (!actions || !result || actions.querySelector('[data-crm-action]')) return;
    if (!result.persistence?.saved) return;

    const createClient = document.createElement('button');
    createClient.className = 'secondary';
    createClient.type = 'button';
    createClient.dataset.crmAction = 'create-client';
    createClient.textContent = 'Crea / aggiorna cliente';

    const openContract = document.createElement('button');
    openContract.className = 'secondary';
    openContract.type = 'button';
    openContract.dataset.crmAction = 'open-contract';
    openContract.textContent = 'Apri contratto precompilato';
    actions.prepend(openContract, createClient);
  }

  async function createClient(button, result) {
    button.disabled = true;
    button.textContent = 'Salvataggio…';
    try {
      const response = await fetch(`/api/bill-analyses/${result.persistence.id}/create-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Impossibile salvare il cliente.');
      button.textContent = data.client?.created ? 'Cliente creato ✓' : 'Cliente aggiornato ✓';
    } catch (error) {
      button.disabled = false;
      button.textContent = error.message || 'Riprova';
    }
  }

  function openContract(result) {
    window.sessionStorage.setItem('preventivatoreContractDraft', JSON.stringify(buildContractDraft(result)));
    window.location.assign('/');
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-crm-action]');
    if (!button) return;
    const result = window.__preventivatoreLastResult;
    if (button.dataset.crmAction === 'create-client') createClient(button, result);
    if (button.dataset.crmAction === 'open-contract') openContract(result);
  });

  new window.MutationObserver(injectActions).observe(output, { childList: true, subtree: true });
  injectActions();
})();
