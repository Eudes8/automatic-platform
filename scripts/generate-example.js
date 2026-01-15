import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";

async function generateExample() {
    const projectName = "ECOMMERCE NEXUS PLATFORM";
    const clientName = "JEAN MARC KOFFI";
    const budget = "4.500.000 FCFA";
    const projectId = "PROJ-8822";
    const description = "Architecture: WEB | Modules: AUTH, PAYMENTS, DASHBOARD | Timeline: 6 WEEKS";

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.05, 0.05, 0.15);
    const secondaryColor = rgb(0.2, 0.4, 0.9);
    const grayColor = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.95, 0.95, 0.95);

    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 60;
    let currentY = height - margin;

    const drawFooter = (p, pNum) => {
        p.drawText("AUTOMATIC CI - Contrat de Prestation de Services Informatiques", {
            x: margin,
            y: 40,
            size: 8,
            font: fontItalic,
            color: grayColor
        });
        p.drawText(`Page ${pNum}`, {
            x: width - margin - 30,
            y: 40,
            size: 8,
            font: fontRegular,
            color: grayColor
        });
    };

    const drawWrappedText = (p, text, x, y, maxWidth, size, font, color = rgb(0, 0, 0)) => {
        const words = text.split(' ');
        let line = '';
        let localY = y;
        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
                p.drawText(line, { x, y: localY, size, font, color });
                localY -= size * 1.4;
                line = word;
            } else {
                line = testLine;
            }
        }
        p.drawText(line, { x, y: localY, size, font, color });
        return localY - size * 1.4;
    };

    // Header
    page.drawRectangle({ x: margin, y: currentY - 60, width: 140, height: 40, color: primaryColor });
    page.drawText("AUTOMATIC", { x: margin + 15, y: currentY - 45, size: 20, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(`REF: AUT-2026-8822`, { x: width - margin - 100, y: currentY - 40, size: 10, font: fontBold, color: primaryColor });

    currentY -= 90;
    page.drawText("CONTRAT DE PRESTATION DE SERVICES", { x: 120, y: currentY, size: 18, font: fontBold, color: primaryColor });
    currentY -= 40;

    page.drawText("ENTRE LES SOUSSIGNÉS :", { x: margin, y: currentY, size: 11, font: fontBold });
    currentY -= 25;
    page.drawText("LA SOCIÉTÉ AUTOMATIC CI", { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 15;
    currentY = drawWrappedText(page, "SARL au capital de 1.000.000 FCFA, immatriculée au RCCM sous le numéro CI-ABJ-03-2024-B12-00452, siège à Abidjan.", margin, currentY, width - 2 * margin, 9, fontRegular, grayColor);
    currentY -= 20;

    page.drawText("M. JEAN MARC KOFFI", { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 15;
    currentY = drawWrappedText(page, "Agissant pour son propre compte.", margin, currentY, width - 2 * margin, 9, fontRegular, grayColor);

    currentY -= 40;
    page.drawText("ARTICLE 1 - OBJET", { x: margin, y: currentY, size: 10, font: fontBold, color: secondaryColor });
    currentY -= 15;
    currentY = drawWrappedText(page, `Réalisation du projet : "${projectName}". Architecture: WEB, Modules: AUTH, PAYMENTS, DASHBOARD.`, margin, currentY, width - 2 * margin, 9, fontRegular);

    currentY -= 30;
    page.drawText("ARTICLE 3 - PRIX", { x: margin, y: currentY, size: 10, font: fontBold, color: secondaryColor });
    currentY -= 15;
    currentY = drawWrappedText(page, `Le montant est fixé à ${budget}. Acompte de 40% à la signature.`, margin, currentY, width - 2 * margin, 9, fontRegular);

    // Signature boxes
    currentY -= 100;
    page.drawRectangle({ x: margin, y: currentY - 100, width: 220, height: 100, color: lightGray });
    page.drawText("LE CLIENT", { x: margin + 10, y: currentY - 20, size: 10, font: fontBold });

    page.drawRectangle({ x: width - margin - 220, y: currentY - 100, width: 220, height: 100, color: lightGray });
    page.drawText("AUTOMATIC CI", { x: width - margin - 210, y: currentY - 20, size: 10, font: fontBold });

    drawFooter(page, 1);

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync("Exemple_Contrat_AUTOMATIC.pdf", pdfBytes);
    console.log("PDF Example generated: Exemple_Contrat_AUTOMATIC.pdf");
}

generateExample();
