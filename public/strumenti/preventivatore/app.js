/* eslint-disable no-undef */
(() => {
  'use strict';
  const MAX_FILE = 18 * 1024 * 1024,
    CHUNK_SIZE = 256 * 1024;
  let cteFile = null,
    invoiceFile = null,
    currentReport = null;
  const $ = (id) => document.getElementById(id),
    euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }),
    num = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 6 });
  const messages = [
    'Carico i documenti in modo sicuro…',
    'Riconosco luce o gas…',
    'Cerco lo scontrino dell’energia…',
    'Leggo prezzo e quota fissa…',
    'Controllo la CTE…',
    'Calcolo il confronto sulla fattura…',
  ];
  document.querySelectorAll('.drop').forEach((card) => {
    const kind = card.dataset.kind,
      picker = card.querySelector('.picker');
    card.querySelector('.choose').onclick = () => picker.click();
    picker.onchange = () => acceptFile(kind, picker.files[0], card);
    card.ondragover = (e) => {
      e.preventDefault();
      card.classList.add('drag');
    };
    card.ondragleave = () => card.classList.remove('drag');
    card.ondrop = (e) => {
      e.preventDefault();
      card.classList.remove('drag');
      acceptFile(kind, e.dataTransfer.files[0], card);
    };
  });
  function acceptFile(kind, file, card) {
    hideAlert();
    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      showAlert('Seleziona un file PDF valido.');
      return;
    }
    if (file.size > MAX_FILE) {
      showAlert('Il PDF supera 18 MB. Riducilo e riprova.');
      return;
    }
    if (kind === 'cte') cteFile = file;
    else invoiceFile = file;
    card.classList.add('ready');
    card.querySelector('.fileIcon').textContent = '✓';
    card.querySelector('.filename').textContent = file.name;
    card.querySelector('.choose').textContent = 'Sostituisci PDF';
    updateReady();
  }
  function updateReady() {
    $('analyze').disabled = !(cteFile && invoiceFile);
  }
  function showAlert(t) {
    $('alert').textContent = t;
    $('alert').classList.remove('hidden');
    $('alert').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function hideAlert() {
    $('alert').classList.add('hidden');
  }
  async function uploadDocument(uploadId, kind, file) {
    const total = Math.ceil(file.size / CHUNK_SIZE);
    for (let index = 0; index < total; index += 1) {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Upload-Id': uploadId,
          'X-Document-Kind': kind,
          'X-Chunk-Index': String(index),
          'X-Total-Chunks': String(total),
        },
        body: file.slice(index * CHUNK_SIZE, Math.min(file.size, (index + 1) * CHUNK_SIZE)),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Non riesco a caricare uno dei PDF.');
      }
    }
    return total;
  }
  async function discardUpload(uploadId, cteChunks, invoiceChunks) {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, cteChunks, invoiceChunks }),
    }).catch(() => {});
  }
  $('analyze').onclick = async () => {
    if (!cteFile || !invoiceFile) {
      showAlert('Carica entrambi i PDF.');
      return;
    }
    hideAlert();
    $('output').innerHTML = '';
    $('loading').classList.remove('hidden');
    $('analyze').disabled = true;
    let mi = 0,
      uploadId = '',
      cteChunks = Math.ceil(cteFile.size / CHUNK_SIZE),
      invoiceChunks = Math.ceil(invoiceFile.size / CHUNK_SIZE);
    $('loadingText').textContent = messages[0];
    const timer = setInterval(() => {
      $('loadingText').textContent = messages[++mi % messages.length];
    }, 2300);
    try {
      uploadId = crypto.randomUUID();
      await Promise.all([
        uploadDocument(uploadId, 'cte', cteFile),
        uploadDocument(uploadId, 'invoice', invoiceFile),
      ]);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, cteChunks, invoiceChunks }),
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Non riesco a completare l’analisi.');
        error.title = data.title || 'Analisi non completata';
        throw error;
      }
      renderAnalysis(data);
    } catch (err) {
      if (uploadId) discardUpload(uploadId, cteChunks, invoiceChunks);
      renderBlock(
        err?.title || 'Analisi non completata',
        err?.message || 'Si è verificato un errore durante la lettura.',
        'error'
      );
    } finally {
      clearInterval(timer);
      $('loading').classList.add('hidden');
      updateReady();
    }
  };
  function meterType(value) {
    const v = (value || '').toLocaleLowerCase('it-IT').replace(/\s+/g, ' ').trim();
    if (/\baltri usi\b|\busi diversi\b|\busi non domestici\b/.test(v)) return 'business';
    if (/\bdomestico residente\b|\bdomestico non residente\b|\bclienti non domestici\b/.test(v))
      return 'domestico';
    return 'unknown';
  }
  function finite(v, min = 0) {
    return typeof v === 'number' && Number.isFinite(v) && v >= min;
  }
  function renderCustomerChoice(d) {
    const destination = d.invoice?.meterDestination || 'non trovata';
    $('output').innerHTML =
      `<div class="blocked"><span class="statusIcon">!</span><div><h2>Conferma il tipo di utenza</h2><p>Non riesco a classificare automaticamente la destinazione “${esc(destination)}”. Seleziona la categoria per continuare.</p><div class="customerChoice"><label for="customerTypeChoice">Categoria contatore</label><select id="customerTypeChoice"><option value="">Seleziona…</option><option value="domestico">Domestico</option><option value="business">Business</option></select><button id="confirmCustomerType" class="primary" type="button" disabled>Conferma e continua</button></div></div></div>`;
    const select = $('customerTypeChoice');
    const button = $('confirmCustomerType');
    select.onchange = () => {
      button.disabled = !select.value;
    };
    button.onclick = () => {
      d.invoice.meterDestination =
        select.value === 'domestico' ? 'Domestico residente' : 'Altri usi';
      renderAnalysis(d);
    };
    $('output').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function renderAnalysis(d) {
    window.__preventivatoreLastResult = d;
    const inv = d.invoice,
      cte = d.cte;
    if (!inv || !cte)
      return renderBlock('Dati mancanti', 'Il servizio non ha restituito tutti i dati necessari.');
    if (inv.commodity === 'unknown' || cte.commodity === 'unknown')
      return renderBlock(
        'Tipo di fornitura non riconosciuto',
        'Non riesco a capire con sicurezza se uno dei documenti riguarda luce o gas.'
      );
    if (inv.commodity !== cte.commodity)
      return renderBlock(
        'I documenti non corrispondono',
        `La CTE riguarda ${cte.commodity}, mentre la fattura riguarda ${inv.commodity}.`
      );
    const initialFixed =
      cte.priceType === 'ibrido' &&
      finite(cte.initialFixedMonths, 0.01) &&
      finite(cte.initialFixedUnitPrice, 0.000001) &&
      finite(inv.billingMonths, 0.01) &&
      cte.initialFixedMonths >= inv.billingMonths;
    if (
      (cte.priceType === 'ibrido' && !initialFixed) ||
      ['soglie', 'mista'].includes(cte.complexity)
    )
      return renderBlock(
        'Offerta ibrida non utilizzabile per questo periodo',
        'La fase fissa della CTE non copre interamente il periodo della fattura.'
      );
    if (cte.complexity === 'fasce' && !cte.hasMonorariaOption)
      return renderBlock(
        'Offerta a fasce non accettata',
        'Il confronto automatico viene bloccato per evitare risultati non corretti.'
      );
    const customer = meterType(inv.meterDestination);
    if (customer === 'unknown') return renderCustomerChoice(d);
    if (cte.customerType === 'unknown')
      return renderBlock(
        'Destinazione CTE non chiara',
        'Non riesco a stabilire se la CTE è domestica o business.'
      );
    if (customer !== cte.customerType)
      return renderBlock(
        'CTE non adatta al cliente',
        `La fattura risulta ${customer}, mentre la CTE è per clienti ${cte.customerType}.`
      );
    if (
      inv.hasRecalculations ||
      !inv.comparable ||
      inv.hasZeroConsumption ||
      inv.hasIncompletePeriod ||
      inv.hasMissingEnergySlip ||
      inv.priceReconstructable === false
    )
      return renderBlock(
        'Fattura non confrontabile',
        'Sono presenti ricalcoli, storni o consumi non omogenei.'
      );
    if (
      !finite(inv.consumption, 0.000001) ||
      !finite(inv.unitPrice) ||
      !finite(inv.fixedFeeTotal) ||
      !finite(inv.billingMonths, 0.01)
    )
      return renderBlock(
        'Dati economici insufficienti',
        'Non trovo con sicurezza consumo, prezzo di vendita, quota fissa o durata della fattura.'
      );
    if (!finite(d.confidence) || d.confidence < 0.72)
      return renderBlock(
        'Documento da controllare',
        'La lettura automatica non è abbastanza sicura. Usa un PDF o una scansione più nitida.'
      );
    let offerPrice,
      indexAverage = null,
      calculation = '';
    if (cte.priceType === 'fisso' || initialFixed) {
      const fixedUnitPrice = initialFixed
        ? cte.initialFixedUnitPrice
        : cte.hasMonorariaOption && finite(cte.monorariaUnitPrice)
          ? cte.monorariaUnitPrice
          : finite(cte.fixedUnitPrice) && cte.fixedUnitPrice < 10
            ? cte.fixedUnitPrice
            : null;
      if (!finite(fixedUnitPrice))
        return renderBlock(
          'Prezzo CTE non trovato',
          'Il prezzo fisso non è leggibile con sicurezza.'
        );
      if (cte.commodity === 'luce') {
        const included = cte.networkLosses === 'incluse';
        offerPrice = fixedUnitPrice * (included ? 1 : 1.1);
        calculation = included
          ? 'Prezzo fisso luce con perdite già incluse.'
          : 'Prezzo fisso luce con aggiunta del 10% per perdite di rete.';
      } else {
        offerPrice = fixedUnitPrice;
        calculation = initialFixed
          ? `Prezzo fisso gas valido per i primi ${cte.initialFixedMonths} mesi; dopo il periodo iniziale la CTE diventa variabile.`
          : 'Prezzo fisso gas: nessuna perdita di rete.';
      }
    } else if (cte.priceType === 'variabile') {
      const expected = cte.commodity === 'luce' ? 'PUN' : 'PSV';
      if (cte.referenceIndex !== expected)
        return renderBlock(
          'Indice non riconosciuto',
          `Per questa offerta è necessario ${expected}.`
        );
      const months = new Set(inv.referenceMonths || []),
        values = (d.indexValues || []).filter((x) => months.has(x.month)),
        covered = new Set(values.map((x) => x.month));
      if (!months.size || covered.size !== months.size || values.some((x) => !finite(x.value)))
        return renderBlock(
          `${expected} del periodo non disponibile`,
          `Non sono presenti tutti i valori mensili ufficiali di ${expected}.`
        );
      indexAverage = values.reduce((s, x) => s + x.value, 0) / values.length;
      if (cte.hasExplicitFormula && finite(cte.formulaMultiplier) && finite(cte.formulaAdditive)) {
        const formulaBase = indexAverage * cte.formulaMultiplier + cte.formulaAdditive;
        if (cte.commodity === 'luce') {
          const included = cte.networkLosses === 'incluse';
          offerPrice = formulaBase * (included ? 1 : 1.1);
          calculation = included
            ? `Formula CTE: ${expected} medio × ${cte.formulaMultiplier} + ${cte.formulaAdditive}; perdite incluse.`
            : `Formula CTE: (${expected} medio × ${cte.formulaMultiplier} + ${cte.formulaAdditive}) con aggiunta del 10% per perdite di rete.`;
        } else {
          offerPrice = formulaBase;
          calculation = `Formula CTE: ${expected} medio × ${cte.formulaMultiplier} + ${cte.formulaAdditive}; nessuna perdita di rete.`;
        }
      } else {
        if (!finite(cte.spread))
          return renderBlock('Spread non trovato', 'Lo spread non è leggibile con sicurezza.');
        const base = indexAverage + cte.spread;
        if (cte.commodity === 'luce') {
          const included = cte.networkLosses === 'incluse';
          offerPrice = base * (included ? 1 : 1.1);
          calculation = included
            ? 'PUN medio semplice + spread; perdite incluse.'
            : '(PUN medio semplice + spread) con aggiunta del 10% per perdite.';
        } else {
          offerPrice = base;
          calculation = 'PSV medio semplice + spread; nessuna perdita di rete.';
        }
      }
    } else
      return renderBlock(
        'Tipo di prezzo non riconosciuto',
        'La CTE non indica un prezzo soltanto fisso o soltanto variabile.'
      );
    if (!finite(cte.annualFixedFee))
      return renderBlock(
        'Costo fisso CTE non trovato',
        'Non trovo il costo fisso annuo del venditore.'
      );
    const offerFixed = (cte.annualFixedFee / 12) * inv.billingMonths,
      currentEnergy = inv.consumption * inv.unitPrice,
      offerEnergy = inv.consumption * offerPrice,
      currentTotal = currentEnergy + inv.fixedFeeTotal,
      offerTotal = offerEnergy + offerFixed,
      saving = currentTotal - offerTotal,
      pct = currentTotal > 0 ? (saving / currentTotal) * 100 : 0;
    renderReport({
      inv,
      cte,
      customer,
      offerPrice,
      indexAverage,
      calculation,
      offerFixed,
      currentEnergy,
      offerEnergy,
      currentTotal,
      offerTotal,
      saving,
      pct,
      indexValues: d.indexValues || [],
      spread: cte.spread,
      networkLosses: cte.networkLosses,
    });
  }
  function esc(v) {
    return String(v ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }
  function renderBlock(title, message, type = 'blocked') {
    $('output').innerHTML =
      `<div class="blocked ${type === 'error' ? 'error' : ''}"><span class="statusIcon">!</span><div><h2>${esc(title)}</h2><p>${esc(message)}</p></div></div>`;
    $('output').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  let pdfFontsPromise = null,
    brandLogoPromise = null;
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 32768)
      binary += String.fromCharCode(...bytes.subarray(index, index + 32768));
    return btoa(binary);
  }
  function loadPdfFonts() {
    if (!pdfFontsPromise)
      pdfFontsPromise = Promise.all(
        ['/fonts/LiberationSans-Regular.ttf', '/fonts/LiberationSans-Bold.ttf'].map((src) =>
          fetch(src).then((response) => {
            if (!response.ok) throw new Error('Font PDF non disponibile');
            return response.arrayBuffer();
          })
        )
      )
        .then(([regular, bold]) => ({
          regular: arrayBufferToBase64(regular),
          bold: arrayBufferToBase64(bold),
        }))
        .catch(() => null);
    return pdfFontsPromise;
  }
  function loadBrandLogo() {
    if (!brandLogoPromise)
      brandLogoPromise = new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas'),
            context = canvas.getContext('2d', { alpha: true });
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          context.drawImage(image, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        };
        image.onerror = () => resolve(null);
        image.src = '/logo_ufficiale/orangecall_logo_orizzontale.webp';
      });
    return brandLogoPromise;
  }
  async function downloadEstimatePdf() {
    if (!currentReport || !window.jspdf?.jsPDF) {
      showAlert('Non riesco a creare il PDF. Aggiorna la pagina e riprova.');
      return;
    }
    const button = $('downloadPdf'),
      originalText = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = 'Creo il PDF…';
    }
    try {
      const r = currentReport,
        { jsPDF } = window.jspdf;
      if (!window.OrangeCallPdf?.createEstimatePdf) throw new Error('Template PDF non disponibile');
      const [fonts, brandLogo] = await Promise.all([loadPdfFonts(), loadBrandLogo()]),
        doc = window.OrangeCallPdf.createEstimatePdf({ jsPDF, report: r, fonts, brandLogo });
      const period = String(r.inv.billingPeriod || 'periodo')
        .replace(/[^0-9A-Za-z]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
      doc.save(`preventivo-${r.inv.commodity}-${period || 'fattura'}.pdf`);
    } catch {
      showAlert('Non riesco a creare il PDF. Aggiorna la pagina e riprova.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }
  function renderReport(r) {
    currentReport = r;
    const unit = r.inv.commodity === 'luce' ? '€/kWh' : '€/Smc',
      negative = r.saving < 0,
      currentName = esc(r.inv.supplier || 'Fornitore attuale'),
      offerName = esc(r.cte.supplier || 'Nostra offerta'),
      priceBadge =
        r.cte.priceType === 'ibrido' && finite(r.cte.initialFixedMonths, 0.01)
          ? `Prezzo fisso — primi ${r.cte.initialFixedMonths} mesi`
          : r.cte.priceType === 'fisso'
            ? 'Prezzo fisso'
            : 'Prezzo variabile';
    const indexRows = (r.indexValues || [])
      .map(
        (item) =>
          `<li><span>${esc(item.month)}</span><strong>${num.format(item.value)} ${r.inv.commodity === 'luce' ? '€/kWh' : '€/Smc'}</strong></li>`
      )
      .join('');
    const indexDetails =
      r.cte.priceType === 'variabile'
        ? `<div class="calculationDetails"><h3>Dettaglio indice e formula</h3><div class="detailGrid"><div><span>Indice</span><strong>${esc(r.cte.referenceIndex)}</strong></div><div><span>Media periodo</span><strong>${r.indexAverage === null ? '—' : `${num.format(r.indexAverage)} ${unit}`}</strong></div><div><span>Spread CTE</span><strong>${r.spread === null || r.spread === undefined ? '—' : `${num.format(r.spread)} ${unit}`}</strong></div><div><span>Perdite di rete</span><strong>${r.inv.commodity === 'gas' ? 'Non applicabili' : r.networkLosses === 'incluse' ? 'Incluse' : 'Applicato +10%'}</strong></div></div>${indexRows ? `<ul class="indexMonths">${indexRows}</ul>` : ''}<p>${esc(r.calculation)}</p></div>`
        : `<div class="calculationDetails"><h3>Dettaglio offerta</h3><div class="detailGrid"><div><span>Tipo prezzo</span><strong>Fisso</strong></div><div><span>Perdite di rete</span><strong>${r.inv.commodity === 'gas' ? 'Non applicabili' : r.networkLosses === 'incluse' ? 'Incluse' : 'Applicato +10%'}</strong></div></div><p>${esc(r.calculation)}</p></div>`;
    $('output').innerHTML =
      `<article class="report"><div class="reportHead"><div><div class="eyebrow">CONFRONTO COMPLETATO</div><h2>Risultato sulla fattura</h2><p>${r.inv.commodity === 'luce' ? 'Luce' : 'Gas'} · ${r.customer === 'business' ? 'Business' : 'Domestico'} · ${esc(r.inv.billingPeriod)}</p></div><div class="badges"><span>${priceBadge}</span><span>${num.format(r.inv.consumption)} ${r.inv.commodity === 'luce' ? 'kWh' : 'Smc'}</span><span>${currentName}</span></div></div><div class="tableWrap"><table><thead><tr><th>Parametro</th><th>${currentName}</th><th>${offerName}</th></tr></thead><tbody><tr><td>Prezzo vendita materia</td><td>${num.format(r.inv.unitPrice)} ${unit}</td><td>${num.format(r.offerPrice)} ${unit}</td></tr><tr><td>Costo materia nel periodo</td><td>${euro.format(r.currentEnergy)}</td><td>${euro.format(r.offerEnergy)}</td></tr><tr><td>Quota fissa vendita</td><td>${euro.format(r.inv.fixedFeeTotal)}</td><td>${euro.format(r.offerFixed)}</td></tr><tr class="total"><td>Totale confrontato</td><td>${euro.format(r.currentTotal)}</td><td>${euro.format(r.offerTotal)}</td></tr></tbody></table></div>${indexDetails}<div class="saving ${negative ? 'negative' : ''}"><div><small>${negative ? 'MAGGIORE SPESA' : 'RISPARMIO'} SULLA FATTURA</small><strong>${euro.format(Math.abs(r.saving))}</strong></div><div class="percent">${negative ? '+' : '−'}${num.format(Math.abs(r.pct))}%</div></div><div class="actions"><button id="downloadPdf" class="primary" type="button">Scarica preventivo PDF</button><button class="secondary" type="button" onclick="location.reload()">Nuovo confronto</button></div></article>`;
    $('downloadPdf').onclick = downloadEstimatePdf;
    $('output').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  updateReady();
})();
