(function attachOrangeCallPdf(globalScope) {
  "use strict";

  const COLORS = {
    orange: [243, 91, 0],
    orangeDark: [201, 66, 0],
    orangeSoft: [255, 246, 239],
    ink: [24, 24, 24],
    muted: [109, 105, 102],
    line: [226, 221, 217],
    soft: [248, 247, 246],
    white: [255, 255, 255],
    green: [17, 148, 90],
    greenDark: [10, 105, 64],
    greenSoft: [235, 248, 241],
    red: [239, 43, 31],
    redDark: [190, 31, 22],
    redSoft: [255, 239, 237],
  };

  function setFill(doc, color) {
    doc.setFillColor(color[0], color[1], color[2]);
  }

  function setDraw(doc, color) {
    doc.setDrawColor(color[0], color[1], color[2]);
  }

  function setText(doc, color) {
    doc.setTextColor(color[0], color[1], color[2]);
  }

  function addImageContained(doc, image, x, y, maxWidth, maxHeight) {
    if (!image?.dataUrl || !image.width || !image.height) return false;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    try {
      doc.addImage(
        image.dataUrl,
        "PNG",
        x + (maxWidth - width) / 2,
        y + (maxHeight - height) / 2,
        width,
        height,
        undefined,
        "FAST",
      );
      return true;
    } catch {
      return false;
    }
  }

  function fitFontSize(doc, text, maxWidth, preferred, minimum) {
    let size = preferred;
    doc.setFontSize(size);
    while (size > minimum && doc.getTextWidth(text) > maxWidth) {
      size -= 0.25;
      doc.setFontSize(size);
    }
    return size;
  }

  function splitLimited(doc, text, maxWidth, maxLines) {
    const lines = doc.splitTextToSize(String(text || ""), maxWidth);
    if (lines.length <= maxLines) return lines;
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 1 && doc.getTextWidth(`${last}...`) > maxWidth) {
      last = last.slice(0, -1);
    }
    kept[maxLines - 1] = `${last.trim()}...`;
    return kept;
  }

  function registerFonts(doc, fonts) {
    if (!fonts?.regular || !fonts?.bold) return "helvetica";
    doc.addFileToVFS("LiberationSans-Regular.ttf", fonts.regular);
    doc.addFont("LiberationSans-Regular.ttf", "LiberationSans", "normal");
    doc.addFileToVFS("LiberationSans-Bold.ttf", fonts.bold);
    doc.addFont("LiberationSans-Bold.ttf", "LiberationSans", "bold");
    return "LiberationSans";
  }

  function createEstimatePdf({ jsPDF, report, fonts, brandLogo }) {
    if (!jsPDF || !report || !report.inv || !report.cte) {
      throw new Error("Dati PDF incompleti");
    }

    const r = report;
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const fontFamily = registerFonts(doc, fonts);
    const isLight = r.inv.commodity === "luce";
    const negative = Number(r.saving) < 0;
    const supply = isLight ? "Luce" : "Gas";
    const customer = r.customer === "business" ? "Business" : "Domestico";
    const priceType = r.cte.priceType === "fisso" ? "Prezzo fisso" : "Prezzo variabile";
    const unit = isLight ? "EUR/kWh" : "EUR/Smc";
    const consumptionUnit = isLight ? "kWh" : "Smc";
    const currentName = String(r.inv.supplier || "Fornitore attuale").trim();
    const period = String(r.inv.billingPeriod || "Periodo non indicato").trim();
    const number = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 6 });
    const money = (value) =>
      `${Number(value).toLocaleString("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} EUR`;
    const price = (value) => `${number.format(Number(value))} ${unit}`;

    doc.setProperties({
      title: "OrangeCall - Preventivatore Smart",
      subject: "Confronto delle voci di vendita",
      author: "OrangeCall",
      creator: "OrangeCall - Preventivatore Smart",
    });

    setFill(doc, COLORS.white);
    doc.rect(0, 0, 210, 297, "F");
    setFill(doc, COLORS.orange);
    doc.rect(0, 0, 210, 3, "F");

    const hasBrandLogo = addImageContained(doc, brandLogo, 20, 7, 34, 24);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(14.5);
    setText(doc, COLORS.ink);
    doc.text("Preventivatore Smart", hasBrandLogo ? 62 : 20, 16.5);
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(7.8);
    setText(doc, COLORS.muted);
    doc.text("Confronto delle voci di vendita sulla fattura", hasBrandLogo ? 62 : 20, 23.5);

    setFill(doc, COLORS.ink);
    doc.roundedRect(20, 38, 170, 24, 2.5, 2.5, "F");
    setText(doc, COLORS.orange);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(8.2);
    doc.text(`${supply} - ${customer}`, 27, 47.5);
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(6.8);
    setText(doc, [200, 196, 192]);
    doc.text(`Consumo: ${number.format(Number(r.inv.consumption))} ${consumptionUnit}`, 27, 56);
    const periodLabel = `Periodo: ${period}`;
    setText(doc, COLORS.white);
    fitFontSize(doc, periodLabel, 82, 7.2, 5.8);
    doc.text(periodLabel, 183, 51.5, { align: "right" });

    setFill(doc, COLORS.ink);
    doc.roundedRect(20, 70, 82, 23, 2.5, 2.5, "F");
    doc.roundedRect(108, 70, 82, 23, 2.5, 2.5, "F");
    setText(doc, COLORS.orange);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(6.5);
    doc.text("FORNITORE ATTUALE", 26, 78);
    doc.text("TIPO OFFERTA", 114, 78);
    setText(doc, COLORS.white);
    fitFontSize(doc, currentName, 70, 9.5, 7.4);
    doc.text(currentName, 26, 87);
    setText(doc, COLORS.white);
    doc.setFontSize(9.5);
    doc.text(priceType, 114, 87);

    setText(doc, COLORS.orangeDark);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(7.2);
    doc.text("CONFRONTO ECONOMICO", 20, 104);

    const tableX = 20;
    const tableY = 109;
    const tableWidth = 170;
    const labelWidth = 68;
    const currentWidth = 51;
    const offerWidth = 51;
    const headerHeight = 26;
    const rowHeight = 18;
    const tableHeight = headerHeight + rowHeight * 4;

    setFill(doc, COLORS.ink);
    doc.rect(tableX, tableY, labelWidth, headerHeight, "F");
    setText(doc, COLORS.white);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(7.6);
    doc.text("PARAMETRO", tableX + 6, tableY + 15.5);

    setFill(doc, COLORS.ink);
    doc.rect(tableX + labelWidth, tableY, currentWidth, headerHeight, "F");
    setText(doc, COLORS.orange);
    doc.setFontSize(6.1);
    doc.text("FORNITORE ATTUALE", tableX + labelWidth + currentWidth / 2, tableY + 7.5, {
      align: "center",
    });
    setText(doc, COLORS.white);
    doc.setFontSize(7.6);
    const currentLines = splitLimited(doc, currentName, currentWidth - 8, 2);
    doc.text(currentLines, tableX + labelWidth + currentWidth / 2, tableY + 15, {
      align: "center",
      lineHeightFactor: 1.05,
    });

    setFill(doc, COLORS.orange);
    doc.rect(tableX + labelWidth + currentWidth, tableY, offerWidth, headerHeight, "F");
    setText(doc, COLORS.ink);
    doc.setFontSize(8.5);
    doc.text("NOSTRA OFFERTA", tableX + labelWidth + currentWidth + offerWidth / 2, tableY + 15.5, {
      align: "center",
    });

    const rows = [
      ["Prezzo vendita materia", price(r.inv.unitPrice), price(r.offerPrice)],
      ["Costo materia nel periodo", money(r.currentEnergy), money(r.offerEnergy)],
      ["Quota fissa vendita", money(r.inv.fixedFeeTotal), money(r.offerFixed)],
      ["Totale confrontato", money(r.currentTotal), money(r.offerTotal)],
    ];

    let rowY = tableY + headerHeight;
    rows.forEach((row, index) => {
      const isTotal = index === rows.length - 1;
      setFill(doc, isTotal ? [245, 243, 241] : index % 2 === 0 ? COLORS.white : [251, 250, 249]);
      doc.rect(tableX, rowY, labelWidth + currentWidth, rowHeight, "F");
      setFill(doc, isTotal ? [255, 234, 220] : COLORS.orangeSoft);
      doc.rect(tableX + labelWidth + currentWidth, rowY, offerWidth, rowHeight, "F");

      setText(doc, COLORS.ink);
      doc.setFont(fontFamily, isTotal ? "bold" : "normal");
      doc.setFontSize(isTotal ? 8.8 : 8.2);
      doc.text(row[0], tableX + 6, rowY + 11.2);
      doc.setFont(fontFamily, "bold");
      fitFontSize(doc, row[1], currentWidth - 9, isTotal ? 8.8 : 8.1, 6.8);
      doc.text(row[1], tableX + labelWidth + currentWidth - 5, rowY + 11.2, { align: "right" });
      setText(doc, isTotal ? COLORS.orangeDark : COLORS.ink);
      fitFontSize(doc, row[2], offerWidth - 9, isTotal ? 8.8 : 8.1, 6.8);
      doc.text(row[2], tableX + tableWidth - 5, rowY + 11.2, { align: "right" });

      setDraw(doc, COLORS.line);
      doc.setLineWidth(0.2);
      doc.line(tableX, rowY + rowHeight, tableX + tableWidth, rowY + rowHeight);
      rowY += rowHeight;
    });

    setDraw(doc, COLORS.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(tableX, tableY, tableWidth, tableHeight, 2.5, 2.5, "S");
    doc.line(tableX + labelWidth, tableY, tableX + labelWidth, tableY + tableHeight);
    setDraw(doc, COLORS.orange);
    doc.setLineWidth(0.55);
    doc.line(
      tableX + labelWidth + currentWidth,
      tableY,
      tableX + labelWidth + currentWidth,
      tableY + tableHeight,
    );

    const resultY = tableY + tableHeight + 13;
    const resultFill = negative ? COLORS.redSoft : COLORS.greenSoft;
    const resultColor = negative ? COLORS.red : COLORS.green;
    const resultDark = negative ? COLORS.redDark : COLORS.greenDark;
    setFill(doc, resultFill);
    doc.roundedRect(20, resultY, 170, 40, 2.5, 2.5, "F");
    setFill(doc, resultColor);
    doc.rect(20, resultY, 3.5, 40, "F");
    setText(doc, resultDark);
    doc.setFont(fontFamily, "bold");
    doc.setFontSize(7.2);
    doc.text(negative ? "MAGGIORE SPESA" : "RISPARMIO", 30, resultY + 11);
    fitFontSize(doc, money(Math.abs(Number(r.saving))), 82, 20, 15.5);
    doc.text(money(Math.abs(Number(r.saving))), 30, resultY + 29);
    const percentage = `${negative ? "+" : "-"}${number.format(Math.abs(Number(r.pct)))}%`;
    fitFontSize(doc, percentage, 40, 16, 10.5);
    doc.text(percentage, 181, resultY + 25, { align: "right" });

    setDraw(doc, COLORS.line);
    doc.setLineWidth(0.25);
    doc.line(20, 277, 190, 277);
    setText(doc, [137, 132, 128]);
    doc.setFont(fontFamily, "normal");
    doc.setFontSize(7.1);
    doc.text("Rete, oneri, imposte e altre partite sono escluse dal confronto.", 20, 284);
    doc.setFont(fontFamily, "bold");
    doc.text("OrangeCall - Preventivatore Smart", 190, 284, { align: "right" });

    return doc;
  }

  globalScope.OrangeCallPdf = Object.freeze({ createEstimatePdf });
})(typeof window !== "undefined" ? window : globalThis);
