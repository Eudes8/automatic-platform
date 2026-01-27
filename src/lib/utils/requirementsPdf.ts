import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateApprovedRequirementsPDF(
    projectName: string,
    clientName: string,
    requirements: Array<{ title: string; description: string; status: string; createdAt: Date }>,
    projectId: string
) {
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.05, 0.05, 0.15);
    const accentColor = rgb(0.2, 0.4, 0.9);
    const greenColor = rgb(0.1, 0.6, 0.3);

    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 50;
    let currentY = height - margin;

    // Helper for page breaks
    const checkPageBreak = (neededHeight: number) => {
        if (currentY - neededHeight < margin + 40) {
            page = pdfDoc.addPage([595.28, 841.89]);
            currentY = height - margin;
            return true;
        }
        return false;
    };

    // Header
    page.drawRectangle({
        x: 0,
        y: height - 120,
        width: width,
        height: 120,
        color: primaryColor,
    });

    page.drawText("CAHIER DES CHARGES VALIDÉ", {
        x: margin,
        y: height - 60,
        size: 22,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    page.drawText(`PROJET: ${projectName.toUpperCase()}`, {
        x: margin,
        y: height - 85,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText(`CLIENT: ${clientName.toUpperCase()}`, {
        x: margin,
        y: height - 100,
        size: 10,
        font: fontItalic,
        color: rgb(0.7, 0.7, 0.7),
    });

    currentY = height - 150;

    // Intro
    const approvedReqs = requirements.filter(r => r.status === 'APPROVED');
    const introText = `Ce document récapitule les ${approvedReqs.length} spécifications techniques validées d'un commun accord entre les parties pour le projet "${projectName}". Chaque point ci-dessous a été discuté, clarifié et approuvé.`;

    page.drawText("RÉSUMÉ EXÉCUTIF", {
        x: margin,
        y: currentY,
        size: 12,
        font: fontBold,
        color: primaryColor
    });
    currentY -= 20;

    // Wrap intro text
    const words = introText.split(' ');
    let line = '';
    const maxWidth = width - (margin * 2);

    for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        if (fontRegular.widthOfTextAtSize(testLine, 10) > maxWidth) {
            page.drawText(line, { x: margin, y: currentY, size: 10, font: fontRegular });
            currentY -= 15;
            line = word;
        } else {
            line = testLine;
        }
    }
    page.drawText(line, { x: margin, y: currentY, size: 10, font: fontRegular });
    currentY -= 40;

    // Requirements
    page.drawText("SPÉCIFICATIONS APPROUVÉES", {
        x: margin,
        y: currentY,
        size: 14,
        font: fontBold,
        color: primaryColor
    });
    currentY -= 30;

    approvedReqs.forEach((req, index) => {
        checkPageBreak(100);

        // Number badge
        page.drawRectangle({
            x: margin,
            y: currentY - 15,
            width: 25,
            height: 25,
            color: greenColor,
        });

        page.drawText(`${index + 1}`, {
            x: margin + (index < 9 ? 10 : 7),
            y: currentY - 8,
            size: 12,
            font: fontBold,
            color: rgb(1, 1, 1),
        });

        // Title
        page.drawText(req.title.toUpperCase(), {
            x: margin + 35,
            y: currentY,
            size: 11,
            font: fontBold,
            color: primaryColor
        });
        currentY -= 20;

        // Description
        const descWords = req.description.split(' ');
        let descLine = '';
        for (const word of descWords) {
            const testLine = descLine + (descLine ? ' ' : '') + word;
            if (fontRegular.widthOfTextAtSize(testLine, 9) > maxWidth - 35) {
                page.drawText(descLine, { x: margin + 35, y: currentY, size: 9, font: fontRegular });
                currentY -= 13;
                descLine = word;
                checkPageBreak(30);
            } else {
                descLine = testLine;
            }
        }
        page.drawText(descLine, { x: margin + 35, y: currentY, size: 9, font: fontRegular });
        currentY -= 8;

        // Date
        page.drawText(`Approuvé le: ${new Date(req.createdAt).toLocaleDateString('fr-FR')}`, {
            x: margin + 35,
            y: currentY,
            size: 8,
            font: fontItalic,
            color: rgb(0.5, 0.5, 0.5),
        });
        currentY -= 35;
    });

    // Footer on all pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, i) => {
        p.drawText(`Document généré par AUTOMATIC CI - ${new Date().toLocaleDateString()} - Page ${i + 1}/${pages.length}`, {
            x: margin,
            y: 30,
            size: 8,
            font: fontItalic,
            color: rgb(0.5, 0.5, 0.5),
        });
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
