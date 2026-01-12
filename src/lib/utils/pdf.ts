import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateProjectContract(
    projectName: string,
    clientName: string,
    budget: string,
    signatureDataUrl: string,
    projectId: string = "UNKNOWN"
) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.01, 0.02, 0.09); // Dark navy
    const accentColor = rgb(0.23, 0.51, 0.96); // Blue-500

    // Header - Modern Design
    page.drawRectangle({
        x: 0,
        y: height - 100,
        width: width,
        height: 100,
        color: primaryColor,
    });

    page.drawText("AUTOMATIC // CONTRAT DE PRESTATION", {
        x: 50,
        y: height - 50,
        size: 24,
        font: fontBold,
        color: rgb(1, 1, 1),
    });

    const safeRef = projectId.length > 8 ? projectId.slice(-8).toUpperCase() : "REF-GEN";
    page.drawText(`Réf : AUT-${new Date().getFullYear()}-${safeRef}`, {
        x: 50,
        y: height - 75,
        size: 10,
        font: fontRegular,
        color: rgb(0.7, 0.7, 0.7),
    });

    const margin = 50;
    let currentY = height - 140;

    // Parties
    page.drawText("ENTRE LES SOUSSIGNÉS :", { x: margin, y: currentY, size: 12, font: fontBold });
    currentY -= 25;
    page.drawText("1. L'AGENCE AUTOMATIC, Société par Actions Simplifiée, au capital de 10 000€.", { x: margin, y: currentY, size: 10, font: fontRegular });
    currentY -= 15;
    page.drawText("Ci-après dénommée 'Le Prestataire'.", { x: margin, y: currentY, size: 10, font: fontItalic });
    currentY -= 25;
    page.drawText(`2. ${clientName.toUpperCase()}, agissant pour son propre compte ou celui de son entreprise.`, { x: margin, y: currentY, size: 10, font: fontRegular });
    currentY -= 15;
    page.drawText("Ci-après dénommé 'Le Client'.", { x: margin, y: currentY, size: 10, font: fontItalic });

    currentY -= 40;

    // Articles
    const articles = [
        { title: "ARTICLE 1 : OBJET DU CONTRAT", content: `Le présent contrat a pour objet la réalisation du projet informatique intitulé "${projectName}". Le Prestataire s'engage à mettre en œuvre son expertise pour la conception et le développement de ladite solution.` },
        { title: "ARTICLE 2 : MONTANT ET MODALITÉS", content: `Le budget total estimé pour ce projet est fixé à ${budget}. Un acompte de 30% est exigible dès la signature, le solde étant réparti selon les jalons de livraison définis dans le dashboard de pilotage.` },
        { title: "ARTICLE 3 : PROPRIÉTÉ INTELLECTUELLE", content: "Dès le paiement intégral du prix, le Prestataire cède au Client l'intégralité des droits de propriété intellectuelle sur les développements spécifiques réalisés dans le cadre du projet." },
        { title: "ARTICLE 4 : CONFIDENTIALITÉ", content: "Chacune des parties s'engage à garder strictement confidentielles les informations techniques, commerciales ou stratégiques échangées durant la collaboration." },
        { title: "ARTICLE 5 : DÉLAIS ET FORCE MAJEURE", content: "Les délais de livraison sont donnés à titre indicatif. Le Prestataire ne pourra être tenu responsable des retards causés par des tiers ou des cas de force majeure." },
    ];

    articles.forEach(article => {
        if (currentY < 150) {
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            currentY = 800;
        }
        page.drawText(article.title, { x: margin, y: currentY, size: 11, font: fontBold, color: accentColor });
        currentY -= 18;

        const words = article.content.split(' ');
        let line = '';
        words.forEach(word => {
            if (line.length + word.length > 95) {
                page.drawText(line, { x: margin, y: currentY, size: 10, font: fontRegular });
                currentY -= 14;
                line = '';
            }
            line += word + ' ';
        });
        page.drawText(line, { x: margin, y: currentY, size: 10, font: fontRegular });
        currentY -= 30;
    });

    // Signature Area
    currentY -= 20;
    page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: width - margin, y: currentY },
        thickness: 1,
        color: rgb(0.9, 0.9, 0.9),
    });
    currentY -= 40;

    page.drawText("SIGNATURES DES PARTIES", { x: margin, y: currentY, size: 12, font: fontBold });
    currentY -= 30;

    // Client Signature
    page.drawText(`Fait à Paris, le ${new Date().toLocaleDateString("fr-FR")}`, { x: margin, y: currentY, size: 10, font: fontRegular });
    currentY -= 20;
    page.drawText("Bon pour accord (Signature Client) :", { x: margin, y: currentY, size: 10, font: fontBold });

    if (signatureDataUrl) {
        try {
            const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
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

    // Automatic Stamp
    page.drawText("POUR AUTOMATIC :", { x: width - 200, y: currentY, size: 10, font: fontBold });
    page.drawText("[SIGNATURE ÉLECTRONIQUE EFFECTIVE]", { x: width - 200, y: currentY - 20, size: 8, font: fontItalic, color: accentColor });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

export function downloadBlob(blob: Blob, name: string) {
    if (typeof window === "undefined") return;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}
