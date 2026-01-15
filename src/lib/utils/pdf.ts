import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateProjectContract(
    projectName: string,
    clientName: string,
    budget: string,
    signatureDataUrl: string,
    projectId: string = "UNKNOWN",
    description?: string
) {
    const pdfDoc = await PDFDocument.create();

    // Standard fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.05, 0.05, 0.15); // Sophisticated dark blue
    const secondaryColor = rgb(0.2, 0.4, 0.9); // Professional blue
    const grayColor = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.95, 0.95, 0.95);

    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 60;
    let currentY = height - margin;

    // --- Helper Functions ---
    const drawDivider = (y: number) => {
        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 0.5,
            color: grayColor,
            opacity: 0.3
        });
    };

    const drawFooter = () => {
        const footerY = 30;
        page.drawText("AUTOMATIC CI - Convention de Prestation de Services", {
            x: margin,
            y: footerY,
            size: 8,
            font: fontItalic,
            color: grayColor
        });
        const pageNum = `Page ${pdfDoc.getPageCount()}`;
        page.drawText(pageNum, {
            x: width - margin - fontRegular.widthOfTextAtSize(pageNum, 8),
            y: footerY,
            size: 8,
            font: fontRegular,
            color: grayColor
        });
    };

    const checkPageBreakArray = (neededHeight: number) => {
        if (currentY - neededHeight < margin + 40) {
            drawFooter();
            page = pdfDoc.addPage([595.28, 841.89]);
            currentY = height - margin;
            return true;
        }
        return false;
    };

    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, size: number, font: any, color = rgb(0, 0, 0), align: 'left' | 'justify' = 'left') => {
        const paragraphs = text.split('\n');
        let localY = y;

        for (const paragraph of paragraphs) {
            const words = paragraph.split(' ');
            let line = '';

            for (const word of words) {
                const testLine = line + (line ? ' ' : '') + word;
                if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
                    page.drawText(line, { x, y: localY, size, font, color });
                    localY -= size * 1.4;
                    line = word;
                    if (checkPageBreakArray(size * 2)) {
                        localY = currentY;
                    }
                } else {
                    line = testLine;
                }
            }
            if (line) {
                page.drawText(line, { x, y: localY, size, font, color });
                localY -= size * 1.4;
            }
            // Paragraph spacing
            localY -= size * 0.5;
        }
        return localY + (size * 0.5); // Remove last spacing
    };

    // --- Header ---

    // Try to load logo
    const logoBytes = await getLogoPngBytes();

    if (logoBytes) {
        try {
            const logoImage = await pdfDoc.embedPng(logoBytes);
            // Target width for logo in header
            const targetWidth = 100;
            const linkScale = targetWidth / logoImage.width;

            page.drawImage(logoImage, {
                x: margin,
                y: currentY - 60,
                width: logoImage.width * linkScale,
                height: logoImage.height * linkScale,
            });
        } catch (e) {
            console.error("Error embedding logo", e);
            // Fallback
            page.drawText("AUTOMATIC", {
                x: margin,
                y: currentY - 40,
                size: 24,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
        }
    } else {
        // Fallback design
        page.drawRectangle({
            x: margin,
            y: currentY - 50,
            width: 140,
            height: 35,
            color: primaryColor,
        });

        page.drawText("AUTOMATIC", {
            x: margin + 15,
            y: currentY - 38,
            size: 18,
            font: fontBold,
            color: rgb(1, 1, 1),
        });
    }

    const currentDate = new Date().toLocaleDateString("fr-FR");
    const refNumber = `REF: AUT-${new Date().getFullYear()}-${projectId.slice(-6).toUpperCase()}`;

    page.drawText(refNumber, {
        x: width - margin - fontRegular.widthOfTextAtSize(refNumber, 10),
        y: currentY - 35,
        size: 10,
        font: fontBold,
        color: primaryColor
    });

    currentY -= 80;

    // Title
    const title = "CONTRAT DE PRESTATION DE SERVICES";
    page.drawText(title, {
        x: (width - fontBold.widthOfTextAtSize(title, 16)) / 2,
        y: currentY,
        size: 16,
        font: fontBold,
        color: primaryColor
    });
    currentY -= 40;

    // --- Presentation des Parties ---
    page.drawText("ENTRE LES SOUSSIGNÉS :", { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 20;

    // Client (Autorité Contractante)
    page.drawText("D'une part,", { x: margin, y: currentY, size: 9, font: fontItalic });
    currentY -= 15;
    page.drawText(`M./MME/STE ${clientName.toUpperCase()}`, { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 12;
    const clientDesc = "Représenté(e) dûment aux fins des présentes.";
    currentY = drawWrappedText(clientDesc, margin, currentY, width - 2 * margin, 9, fontRegular, grayColor);
    page.drawText("Ci-après dénommé « l'Autorité contractante »", { x: margin, y: currentY, size: 9, font: fontItalic });
    currentY -= 25;

    // Prestataire
    page.drawText("Et d'autre part,", { x: margin, y: currentY, size: 9, font: fontItalic });
    currentY -= 15;
    page.drawText("La société AUTOMATIC CI", { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 12;
    const providerDesc = "Société à Responsabilité Limitée (SARL), Siège social : Abidjan Cocody Riviera, RCCM : CI-ABJ-03-2024-B12-00452, Représentée par sa Direction Générale.";
    currentY = drawWrappedText(providerDesc, margin, currentY, width - 2 * margin, 9, fontRegular, grayColor);
    page.drawText("Ci-après dénommé(e) « le Prestataire ».", { x: margin, y: currentY, size: 9, font: fontItalic });

    currentY -= 25;
    page.drawText("IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :", { x: margin, y: currentY, size: 10, font: fontBold });
    currentY -= 20;

    // --- Articles Content ---
    const articles = [
        {
            title: "ARTICLE 1 : OBJET",
            content: `La présente convention définit les conditions et modalités selon lesquelles l'Autorité contractante confie au Prestataire qui accepte, de réaliser les prestations relatives au développement et à la mise en place de services Web et programmes informatiques pour le projet "${projectName}" dont le détail est joint en annexe.\nDe même, il détermine les missions et précise les droits et obligations des parties.`
        },
        {
            title: "ARTICLE 2 : DURÉE",
            content: `La convention est conclue pour être exécutée sur la période allant du ${currentDate} à la date de livraison finale prévue.\nLe délai de réalisation des prestations est défini dans le planning du projet validé conjointement, à compter de la validation du cahier des charges.\nElle est ensuite renouvelée par tacite reconduction pour la maintenance sur une base annuelle, sauf dénonciation par lettre recommandée avec accusé de réception émanant de l'une des parties, au moins trois (3) mois avant le terme initial de la convention.`
        },
        {
            title: "ARTICLE 3 : OBLIGATIONS DES PARTIES",
            content: `a) Obligations du Prestataire\nLe Prestataire s'engage envers l'Autorité contractante à :\n- Respecter les termes de la présente convention, ainsi que les dispositions du code de la propriété intellectuelle ;\n- Exploiter les services Web et programmes informatiques de façon permanente et suivie, conformément aux règles de l'art ;\n- Assurer à ses frais et risques le développement et la mise en place des services Web ;\n- Assumer seul la responsabilité civile découlant de la vente ou de la concession de licences d'utilisation.\nPar ailleurs, le Prestataire aura également un devoir de conseil.\n\nb) Obligations de l'Autorité contractante\n- Prendre toutes les dispositions permettant au Prestataire de réaliser dans les meilleures conditions ses prestations ;\n- Payer le prix convenu en contrepartie des prestations effectivement réalisées.`
        },
        {
            title: "ARTICLE 4 : RÉMUNÉRATION",
            content: `a) Imputation budgétaire\nLa rémunération des prestations est imputée au budget du Client pour l'année en cours.\n\nb) Conditions de paiement\nÀ titre de rémunération des services réalisés dans le cadre de la présente convention, l'Autorité contractante s'engage à payer au Prestataire la somme globale de ${budget} (TTC).\nLe paiement sera effectué selon l'échéancier suivant : 40% à la commande, 40% à la recette provisoire, et 20% à la livraison finale.\nLe coût global de la présente convention est ferme et non révisable pendant toute sa durée.`
        },
        {
            title: "ARTICLE 5 : DROITS DIVERS",
            content: `Droits de propriété :\nTout document, logiciel ou produit fourni par le Prestataire demeure la propriété de l'Autorité contractante après paiement intégral. Il est traité comme confidentiel.\n\nDroits d'exploitation :\nSous réserve de l'exécution intégrale de la présente convention, l'Autorité contractante autorise le Prestataire à citer ce projet comme référence commerciale.`
        },
        {
            title: "ARTICLE 6 : GARANTIE - RESPONSABILITÉ",
            content: `L'Autorité contractante garantit au Prestataire la jouissance des droits cédés conformément à la présente convention, contre tout trouble, revendication ou éviction quelconque.\nIl déclare que les services Web et programmes informatiques sont en état de fonctionnement normal à la livraison.`
        },
        {
            title: "ARTICLE 7 : RÉSILIATION",
            content: `La présente convention pourra être résiliée selon la volonté des parties.\nToutefois, la convention pourra immédiatement être résiliée par lettre recommandée dans les cas ci-après :\n- Manquement grave à l'une quelconque des obligations mises à la charge de l'autre ;\n- Suspension prolongée due à la survenance d'un évènement constitutif de force majeure.`
        },
        {
            title: "ARTICLE 8 : NON CONCURRENCE - PRÉFÉRENCE",
            content: `L'Autorité contractante s'interdit toute remise à un autre Prestataire de tout ou partie des services Web et programmes informatiques qui, concernant un même sujet à un même niveau, pourrait faire concurrence à celui cédé en exclusivité au Prestataire par la présente convention.`
        },
        {
            title: "ARTICLE 9 : RÈGLEMENT DES DIFFÉRENDS",
            content: `Tout différend découlant de l'interprétation ou de l'exécution de la présente convention qui ne peut être réglé à l'amiable, devra être porté devant les tribunaux compétents de la République de Côte d'Ivoire.\nPour l'exécution des présentes, les parties font élection de domicile, en leurs domiciles et siège social respectifs.`
        },
        {
            title: "ARTICLE 10 : ANNEXES",
            content: `La présente convention inclut les annexes ci-après, qui en font partie intégrante :\n- Annexe n°1 : Le détail technique du projet "${projectName}" (tel que défini dans la plateforme).\n- Annexe n°2 : La proposition financière / Facture pro-forma.`
        }
    ];

    for (const article of articles) {
        checkPageBreakArray(150);
        page.drawText(article.title, { x: margin, y: currentY, size: 10, font: fontBold, color: secondaryColor });
        currentY -= 15;
        currentY = drawWrappedText(article.content, margin, currentY, width - 2 * margin, 9, fontRegular);
        currentY -= 15;
    }

    // --- Signatures ---
    checkPageBreakArray(200);
    currentY -= 20;

    page.drawText(`Fait à Abidjan, le ${currentDate}`, {
        x: margin + 20,
        y: currentY - 30,
        size: 9,
        font: fontRegular
    });

    page.drawText("(Cette convention comporte plusieurs pages paraphées par les parties)", {
        x: margin + 20,
        y: currentY - 42,
        size: 8,
        font: fontItalic,
        color: grayColor
    });

    const sigY = currentY - 80;

    // Client
    page.drawText("POUR L'AUTORITÉ CONTRACTANTE :", { x: margin + 20, y: sigY, size: 9, font: fontBold });
    page.drawText("Mention 'Bon pour accord'", { x: margin + 20, y: sigY - 12, size: 8, font: fontItalic, color: grayColor });

    if (signatureDataUrl) {
        try {
            // Extract base64 from data URL
            const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Buffer.from(base64Data, 'base64');
            const signatureImage = await pdfDoc.embedPng(imageBytes);
            const sigDims = signatureImage.scale(0.3);
            page.drawImage(signatureImage, {
                x: margin + 20,
                y: sigY - 80,
                width: sigDims.width,
                height: sigDims.height,
            });

            // Add typed name under signature
            page.drawText(clientName.toUpperCase(), {
                x: margin + 20,
                y: sigY - 90,
                size: 8,
                font: fontBold,
                color: primaryColor
            });

        } catch (e) {
            console.error("Failed to embed signature", e);
        }
    }

    // Provider
    page.drawText("POUR LE PRESTATAIRE :", { x: width / 2 + 20, y: sigY, size: 9, font: fontBold });
    page.drawText("(AUTOMATIC CI)", { x: width / 2 + 20, y: sigY - 12, size: 8, font: fontItalic });

    page.drawRectangle({
        x: width / 2 + 20,
        y: sigY - 100,
        width: 100,
        height: 60,
        borderWidth: 0.5,
        borderColor: secondaryColor,
        borderOpacity: 0.5,
        color: rgb(1, 1, 1),
        opacity: 0.8
    });
    page.drawText("AUTOMATIC CI", { x: width / 2 + 35, y: sigY - 65, size: 9, font: fontBold, color: secondaryColor });
    page.drawText("Direction Générale", { x: width / 2 + 35, y: sigY - 80, size: 7, font: fontRegular, color: secondaryColor });

    drawFooter();

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

// Convert SVG at path to PNG bytes for PDF embedding
async function getLogoPngBytes(): Promise<Uint8Array | null> {
    if (typeof window === "undefined") return null;

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = "/logo.svg?v=" + new Date().getTime(); // Prevent caching issues

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                // Scale up for better print quality (RETINA like)
                const scaleFactor = 4;
                canvas.width = (img.width || 300) * scaleFactor;
                canvas.height = (img.height || 100) * scaleFactor;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(null);
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL("image/png");
                const base64 = dataUrl.split(",")[1];

                const binaryString = window.atob(base64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                resolve(bytes);
            } catch (e) {
                console.error("Canvas SVG conversion error", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Error loading SVG for PDF", e);
            resolve(null);
        };
    });
}

