
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Premium Contract PDF Generator (Shared/Server-side)
 */
export async function generateContractPDF(
    projectName: string,
    clientName: string,
    signatureDataUrl: string,
    date: Date = new Date(),
    projectId: string = "UNKNOWN",
    budget: string = "Selon devis"
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.01, 0.02, 0.09); // Dark navy
    const accentColor = rgb(0.23, 0.51, 0.96); // Blue-500

    // Header Design
    page.drawRectangle({
        x: 0,
        y: height - 120,
        width: width,
        height: 120,
        color: primaryColor,
    });

    page.drawText("AUTOMATIC // CONTRAT DE PRESTATION", {
        x: 50,
        y: height - 60,
        size: 20,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    const safeRef = projectId.length > 8 ? projectId.slice(-8).toUpperCase() : "REF-GEN";
    page.drawText(`DOCUMENT CERTIFIÉ - Réf : AUT-${date.getFullYear()}-${safeRef}`, {
        x: 50,
        y: height - 85,
        size: 9,
        font: fontRegular,
        color: rgb(0.5, 0.6, 1),
    });

    const margin = 50;
    let currentY = height - 160;

    // Parties
    page.drawText("ENTRE LES SOUSSIGNÉS :", { x: margin, y: currentY, size: 11, font: fontBold });
    currentY -= 25;
    page.drawText("1. L'AGENCE AUTOMATIC (Prestataire)", { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 15;
    page.drawText("Ci-après dénommée 'Le Prestataire'.", { x: margin, y: currentY, size: 9, font: fontItalic });
    currentY -= 25;
    page.drawText(`2. ${clientName.toUpperCase()} (Le Client)`, { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 15;
    page.drawText("Ci-après dénommé 'Le Client'.", { x: margin, y: currentY, size: 9, font: fontItalic });

    currentY -= 40;

    // Articles
    const articles = [
        { title: "ARTICLE 1 : OBJET", content: `Le présent contrat définit les conditions dans lesquelles AUTOMATIC réalise le projet "${projectName}" pour le compte du Client.` },
        { title: "ARTICLE 2 : LIVRABLES ET CALENDRIER", content: "Les livrables techniques sont détaillés dans le dashboard de pilotage. Le Prestataire s'engage à une exécution agile avec des démonstrations régulières." },
        { title: "ARTICLE 3 : PROPRIÉTÉ INTELLECTUELLE", content: "L'intégralité du code source et des actifs numériques devient la propriété exclusive du Client après paiement complet des prestations." },
        { title: "ARTICLE 4 : CONFIDENTIALITÉ", content: "Les parties s'engagent à ne divulguer aucune information sensible concernant les technologies ou les stratégies commerciales de l'autre partie." },
    ];

    articles.forEach(article => {
        page.drawText(article.title, { x: margin, y: currentY, size: 10, font: fontBold, color: accentColor });
        currentY -= 18;

        const words = article.content.split(' ');
        let line = '';
        words.forEach(word => {
            if (line.length + word.length > 90) {
                page.drawText(line, { x: margin, y: currentY, size: 9, font: fontRegular });
                currentY -= 14;
                line = '';
            }
            line += word + ' ';
        });
        page.drawText(line, { x: margin, y: currentY, size: 9, font: fontRegular });
        currentY -= 30;
    });

    // Signatures
    currentY -= 40;
    page.drawText("SIGNATURES DES PARTIES", { x: margin, y: currentY, size: 12, font: fontBold });
    currentY -= 25;
    page.drawText(`Fait le ${date.toLocaleDateString("fr-FR")}`, { x: margin, y: currentY, size: 9, font: fontRegular });

    currentY -= 40;
    page.drawText("SIGNATURE CLIENT (ÉLECTRONIQUE) :", { x: margin, y: currentY, size: 9, font: fontBold });

    if (signatureDataUrl) {
        try {
            const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Buffer.from(base64Data, 'base64');
            const signatureImage = await pdfDoc.embedPng(imageBytes);
            const sigDims = signatureImage.scale(0.25);
            page.drawImage(signatureImage, {
                x: margin,
                y: currentY - 80,
                width: sigDims.width,
                height: sigDims.height,
            });
        } catch (e) {
            console.error("Failed to embed signature", e);
        }
    }

    page.drawText("VISA AUTOMATIC :", { x: width - 200, y: currentY, size: 9, font: fontBold });
    page.drawText("[DOCUMENT SCELLÉ NUMÉRIQUEMENT]", { x: width - 200, y: currentY - 20, size: 8, font: fontItalic, color: accentColor });

    return await pdfDoc.save();
}

/**
 * Invoice Generator (Sober & Premium)
 */
export async function generateInvoicePDF(
    invoiceId: string,
    clientName: string,
    projectTitle: string,
    amount: number,
    date: Date = new Date()
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.01, 0.02, 0.09); // Dark navy
    const accentColor = rgb(0.23, 0.51, 0.96); // Blue-500
    const lightGray = rgb(0.95, 0.95, 0.95);

    // Header Color Block
    page.drawRectangle({
        x: 0,
        y: height - 150,
        width: width,
        height: 150,
        color: primaryColor,
    });

    // Logo / Text
    page.drawText("AUTOMATIC //", {
        x: 50,
        y: height - 60,
        size: 24,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText("FACTURE_OFFICIELLE", {
        x: 50,
        y: height - 85,
        size: 10,
        font: fontBold,
        color: accentColor,
    });

    // Company Info
    const companyInfo = [
        "AUTOMATIC CI",
        "Abidjan, Cocody Riviera",
        "contact@automatic.ci",
        "+225 00 00 00 00"
    ];
    let infoY = height - 50;
    companyInfo.forEach(line => {
        page.drawText(line, {
            x: width - 200,
            y: infoY,
            size: 8,
            font: fontRegular,
            color: rgb(0.8, 0.8, 0.8),
        });
        infoY -= 12;
    });

    // Invoice Ref & Date
    let currentY = height - 190;
    page.drawText(`RÉFÉRENCE : AUT-INV-${invoiceId.slice(-6).toUpperCase()}`, { x: 50, y: currentY, size: 10, font: fontBold });
    page.drawText(`DATE D'ÉMISSION : ${date.toLocaleDateString("fr-FR")}`, { x: width - 200, y: currentY, size: 8, font: fontRegular });

    currentY -= 40;

    // Billing To
    page.drawText("FACTURÉ À :", { x: 50, y: currentY, size: 9, font: fontBold, color: accentColor });
    currentY -= 18;
    page.drawText(clientName.toUpperCase(), { x: 50, y: currentY, size: 11, font: fontBold });
    currentY -= 14;
    page.drawText("Client Node ID: " + clientName.slice(0, 4).toUpperCase() + "-NODE", { x: 50, y: currentY, size: 8, font: fontRegular });

    currentY -= 50;

    // Table Header
    page.drawRectangle({ x: 50, y: currentY - 5, width: width - 100, height: 25, color: lightGray });
    page.drawText("DESCRIPTION DES PRESTATIONS", { x: 60, y: currentY + 5, size: 8, font: fontBold, color: primaryColor });
    page.drawText("TOTAL (CFA)", { x: width - 130, y: currentY + 5, size: 8, font: fontBold, color: primaryColor });

    currentY -= 40;

    // Table Row
    page.drawText(`PROJET : ${projectTitle.toUpperCase()}`, { x: 60, y: currentY, size: 10, font: fontBold });
    page.drawText(`${new Intl.NumberFormat('fr-FR').format(amount)} CFA`, { x: width - 130, y: currentY, size: 10, font: fontBold });
    currentY -= 15;
    page.drawText("Développement et déploiement d'infrastructure numérique.", { x: 60, y: currentY, size: 8, font: fontItalic, color: rgb(0.4, 0.4, 0.4) });

    currentY -= 60;

    // Totals
    const totalBoxWidth = 150;
    page.drawRectangle({ x: width - 50 - totalBoxWidth, y: currentY - 10, width: totalBoxWidth, height: 40, color: primaryColor });
    page.drawText("TOTAL À PAYER", { x: width - 40 - totalBoxWidth, y: currentY + 12, size: 7, font: fontBold, color: accentColor });
    page.drawText(`${new Intl.NumberFormat('fr-FR').format(amount)} CFA`, { x: width - 40 - totalBoxWidth, y: currentY - 4, size: 12, font: fontBold, color: rgb(1, 1, 1) });

    // Footer Certification
    const footerY = 50;
    page.drawText("DOCUMENT GÉNÉRÉ PAR LE SYSTÈME AUTOMATIC // CERTIFICATION ALPHA-ZERO", {
        x: width / 2 - 150,
        y: footerY,
        size: 7,
        font: fontItalic,
        color: rgb(0.7, 0.7, 0.7)
    });

    page.drawRectangle({ x: 50, y: footerY + 15, width: width - 100, height: 0.5, color: rgb(0.9, 0.9, 0.9) });

    return await pdfDoc.save();
}
