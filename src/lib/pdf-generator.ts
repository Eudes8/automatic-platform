import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Sanitizes text for pdf-lib WinAnsi compatibility
 */
function sanitizeText(text: string | null | undefined): string {
    if (!text) return "";
    // Replace Narrow No-Break Space (U+202F) and other non-ANSI spaces with standard space
    return text.replace(/[\u202F\u00A0]/g, " ");
}

/**
 * Premium Contract PDF Generator (Realistic & Professional)
 */
export async function generateContractPDF(
    projectName: string,
    clientName: string,
    signatureBase64?: string | null,
    date: Date = new Date(),
    projectId: string = "UNKNOWN",
    budget: string = "Selon devis"
): Promise<Uint8Array> {
    const sProjectName = sanitizeText(projectName);
    const sClientName = sanitizeText(clientName);
    const sBudget = sanitizeText(budget);
    const sProjectId = sanitizeText(projectId);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.01, 0.02, 0.09); // Dark navy
    const accentColor = rgb(0.23, 0.51, 0.96); // Blue-500

    // Header Design (Premium Dark)
    page.drawRectangle({
        x: 0,
        y: height - 140,
        width: width,
        height: 140,
        color: primaryColor,
    });

    page.drawText(sanitizeText("AUTOMATIC."), {
        x: 50,
        y: height - 60,
        size: 28,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText(sanitizeText("CONTRAT DE PRESTATION DE SERVICES NUMÉRIQUES"), {
        x: 50,
        y: height - 85,
        size: 10,
        font: fontBold,
        color: accentColor,
    });

    page.drawText(sanitizeText(`Réf : AUT-CONTRACT-${date.getFullYear()}-${sProjectId.slice(-8).toUpperCase()} // DOCUMENT SCELLÉ`), {
        x: 50,
        y: height - 105,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
    });

    const margin = 50;
    let currentY = height - 180;

    // Parties Section
    page.drawText(sanitizeText("I. LES PARTIES"), { x: margin, y: currentY, size: 12, font: fontBold });
    currentY -= 25;

    page.drawText(sanitizeText("LE PRESTATAIRE :"), { x: margin, y: currentY, size: 9, font: fontBold, color: accentColor });
    currentY -= 15;
    page.drawText(sanitizeText("AUTOMATIC CI, SARL au capital de 1.000.000 FCFA,"), { x: margin, y: currentY, size: 9, font: fontRegular });
    currentY -= 12;
    page.drawText(sanitizeText("Siège social : Abidjan, Côte d'Ivoire. Représenté par la Direction Opérationnelle."), { x: margin, y: currentY, size: 9, font: fontRegular });

    currentY -= 25;
    page.drawText(sanitizeText("LE CLIENT :"), { x: margin, y: currentY, size: 9, font: fontBold, color: accentColor });
    currentY -= 15;
    page.drawText(sanitizeText(`${sClientName.toUpperCase()}, agissant en qualité de commanditaire pour le projet :`), { x: margin, y: currentY, size: 9, font: fontRegular });
    currentY -= 12;
    page.drawText(sanitizeText(`"${sProjectName.toUpperCase()}"`), { x: margin, y: currentY, size: 10, font: fontBold });

    currentY -= 40;

    // Articles Section
    const articles = [
        {
            title: "ARTICLE 1 : OBJET DU CONTRAT",
            content: `Le présent contrat a pour objet la conception, le développement et le déploiement de la solution numérique désignée ci-dessus. Le Prestataire s'engage à mobiliser les ressources techniques nécessaires pour atteindre les objectifs fixés pour le projet "${sProjectName}".`
        },
        {
            title: "ARTICLE 2 : PROPRIÉTÉ INTELLECTUELLE",
            content: "Le transfert de propriété du code source, des designs et de l'infrastructure est effectif dès le solde complet de la prestation. Le Client dispose alors d'une licence d'exploitation exclusive et perpétuelle."
        },
        {
            title: "ARTICLE 3 : CONFIDENTIALITÉ (NDA)",
            content: "Les parties s'engagent à traiter comme strictement confidentielles toutes les informations techniques, commerciales et financières échangées durant la durée du projet et pendant 3 ans après sa clôture."
        },
        {
            title: "ARTICLE 4 : ACCEPTATION ET LIVRAISON",
            content: "Chaque phase du projet donne lieu à une recette technique. L'absence de réserve écrite dans les 5 jours ouvrés suivant la livraison d'une phase vaut acceptation tacite de celle-ci."
        },
        {
            title: "ARTICLE 5 : LIMITATION DE RESPONSABILITÉ",
            content: "La responsabilité du Prestataire est limitée au montant total hors taxes effectivement perçu au titre du présent contrat. Aucune indemnité ne pourra être réclamée pour perte d'exploitation ou manque à gagner."
        }
    ];

    articles.forEach(article => {
        if (currentY < 100) {
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            currentY = 780;
        }
        page.drawText(article.title, { x: margin, y: currentY, size: 10, font: fontBold, color: primaryColor });
        currentY -= 18;

        const words = article.content.split(' ');
        let line = '';
        words.forEach(word => {
            if (line.length + word.length > 90) {
                page.drawText(sanitizeText(line), { x: margin, y: currentY, size: 9, font: fontRegular });
                currentY -= 14;
                line = '';
            }
            line += word + ' ';
        });
        page.drawText(sanitizeText(line), { x: margin, y: currentY, size: 9, font: fontRegular });
        currentY -= 25;
    });

    // Signature Area
    currentY -= 40;
    if (currentY < 200) {
        page.drawText("[... SUITE DES SIGNATURES EN PAGE SUIVANTE ...]", { x: margin, y: 50, size: 8, font: fontItalic });
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        currentY = 780;
    }

    page.drawText(sanitizeText("VALIDATION ET SIGNATURES"), { x: margin, y: currentY, size: 12, font: fontBold });
    currentY -= 30;

    // Signature Columns
    const colWidth = width / 2 - margin;

    // Automatic Signature Box
    page.drawRectangle({ x: margin, y: currentY - 100, width: colWidth - 10, height: 100, color: rgb(0.98, 0.98, 0.98), borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1 });
    page.drawText(sanitizeText("POUR AUTOMATIC :"), { x: margin + 10, y: currentY - 20, size: 8, font: fontBold });
    page.drawText(sanitizeText("SCELLÉ NUMÉRIQUEMENT"), { x: margin + 10, y: currentY - 40, size: 7, font: fontBold, color: accentColor });
    page.drawText(sanitizeText(`DATE: ${date.toLocaleDateString('fr-FR')}`), { x: margin + 10, y: currentY - 55, size: 7, font: fontRegular });

    // Client Signature Box
    page.drawRectangle({ x: width / 2 + 5, y: currentY - 100, width: colWidth - 10, height: 100, color: rgb(0.98, 0.98, 1), borderColor: rgb(0.9, 0.9, 1), borderWidth: 1 });
    page.drawText(sanitizeText(`POUR ${sClientName.toUpperCase()} :`), { x: width / 2 + 15, y: currentY - 20, size: 8, font: fontBold });

    if (signatureBase64) {
        try {
            const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const signatureImage = await pdfDoc.embedPng(imageBytes);
            const sigDims = signatureImage.scale(0.20);
            page.drawImage(signatureImage, {
                x: width / 2 + 15,
                y: currentY - 90,
                width: sigDims.width,
                height: sigDims.height,
            });
        } catch (e) {
            console.error("Failed to embed client signature", e);
        }
    }

    // Add typed name under signature
    page.drawText(sClientName.toUpperCase(), {
        x: width / 2 + 15,
        y: currentY - 90,
        size: 8,
        font: fontBold,
        color: primaryColor
    });

    // Footer
    page.drawText("Page 1/1 - Document contractuel régi par les lois de la République de Côte d'Ivoire.", {
        x: width / 2 - 180,
        y: 30,
        size: 7,
        font: fontRegular,
        color: rgb(0.6, 0.6, 0.6)
    });

    return await pdfDoc.save();
}

/**
 * Sober Prestige Invoice PDF Generator
 */
export async function generateInvoicePDF(
    invoiceId: string,
    clientName: string,
    projectTitle: string,
    amount: number,
    date: Date = new Date(),
    description?: string | null
): Promise<Uint8Array> {
    const sInvoiceId = sanitizeText(invoiceId);
    const sClientName = sanitizeText(clientName);
    const sProjectTitle = sanitizeText(projectTitle);
    const sDescription = sanitizeText(description);
    const sFormattedAmount = sanitizeText(new Intl.NumberFormat('fr-FR').format(amount));
    const sDate = sanitizeText(date.toLocaleDateString('fr-FR'));

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.01, 0.02, 0.09);
    const accentColor = rgb(0.23, 0.51, 0.96);
    const grayColor = rgb(0.4, 0.4, 0.4);

    // Decorative Header Block
    page.drawRectangle({ x: 0, y: height - 160, width: width, height: 160, color: primaryColor });

    page.drawText(sanitizeText("AUTOMATIC."), { x: 50, y: height - 60, size: 28, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(sanitizeText("FACTURE_OFFICIELLE"), { x: 50, y: height - 85, size: 10, font: fontBold, color: accentColor });

    // Reference Box
    page.drawRectangle({ x: 50, y: height - 130, width: 220, height: 30, color: rgb(0.1, 0.1, 0.2) });
    page.drawText(`N° ${sInvoiceId.slice(-8).toUpperCase()}`, { x: 60, y: height - 118, size: 12, font: fontBold, color: rgb(1, 1, 1) });

    // Company Identity
    const companyInfo = ["AUTOMATIC CI", "Cocody, Abidjan", "contact@automatic.ci", "RCCM: CI-ABJ-2024-B-XXXX"];
    let y = height - 50;
    companyInfo.forEach(text => {
        page.drawText(text, { x: width - 200, y, size: 8, font: fontRegular, color: rgb(0.8, 0.8, 0.8) });
        y -= 12;
    });

    let currentY = height - 200;

    // Billing Info
    page.drawText(sanitizeText("DESTINATAIRE"), { x: 50, y: currentY, size: 8, font: fontBold, color: accentColor });
    currentY -= 18;
    page.drawText(sanitizeText(sClientName.toUpperCase()), { x: 50, y: currentY, size: 11, font: fontBold });
    currentY -= 12;
    page.drawText(`Date: ${sDate}`, { x: 50, y: currentY, size: 8, font: fontRegular, color: grayColor });

    currentY -= 60;

    // Table Header
    page.drawRectangle({ x: 50, y: currentY - 5, width: width - 100, height: 25, color: rgb(0.97, 0.97, 0.98) });
    page.drawText(sanitizeText("DESIGNATION DES PRESTATIONS"), { x: 60, y: currentY + 5, size: 8, font: fontBold });
    page.drawText(sanitizeText("MONTANT (CFA)"), { x: width - 150, y: currentY + 5, size: 8, font: fontBold });

    currentY -= 40;

    // Item line
    page.drawText(`PROJET : ${sProjectTitle.toUpperCase()}`, { x: 60, y: currentY, size: 10, font: fontBold });
    page.drawText(`${sFormattedAmount} CFA`, { x: width - 150, y: currentY, size: 10, font: fontBold });

    currentY -= 18;
    const descText = sDescription || "Développement et intégration de systèmes numériques sur mesure.";
    const descLines = descText.split('\n');
    descLines.forEach(line => {
        page.drawText(line, { x: 60, y: currentY, size: 8, font: fontItalic, color: grayColor });
        currentY -= 12;
    });

    currentY -= 50;

    // Subtotal & Total
    const totalX = width - 200;
    page.drawRectangle({ x: totalX, y: currentY - 10, width: 150, height: 50, color: primaryColor });
    page.drawText(sanitizeText("TOTAL NET À PAYER"), { x: totalX + 10, y: currentY + 22, size: 7, font: fontBold, color: accentColor });
    page.drawText(sanitizeText(`${sFormattedAmount} CFA`), { x: totalX + 10, y: currentY + 5, size: 14, font: fontBold, color: rgb(1, 1, 1) });

    // Payment info
    currentY -= 80;
    page.drawText("INFORMATIONS DE PAIEMENT :", { x: 50, y: currentY, size: 8, font: fontBold });
    currentY -= 15;
    page.drawText("Virement bancaire / Mobile Money", { x: 50, y: currentY, size: 8, font: fontRegular });
    currentY -= 12;
    page.drawText("RIB: CI00 0000 0000 0000 0000 00", { x: 50, y: currentY, size: 8, font: fontRegular, color: grayColor });

    // Certification (Sober Prestige)
    const footerY = 60;
    page.drawRectangle({ x: 50, y: footerY + 20, width: width - 100, height: 0.5, color: rgb(0.9, 0.9, 0.9) });
    page.drawText(sanitizeText("FACTURE GÉNÉRÉE ÉLECTRONIQUEMENT - AUCUNE SIGNATURE MANUELLE REQUISE"), {
        x: width / 2 - 160,
        y: footerY,
        size: 7,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5)
    });

    return await pdfDoc.save();
}
