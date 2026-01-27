import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import { Requirement } from "@prisma/client";

export async function generateApprovedRequirementsPDF(
    projectName: string,
    requirements: Requirement[],
    projectId: string
) {
    const approved = requirements.filter(r => r.status === 'APPROVED');
    const pdfDoc = await PDFDocument.create();

    // Fonts
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const primaryColor = rgb(0.05, 0.05, 0.15);
    const secondaryColor = rgb(0.2, 0.4, 0.9);
    const grayColor = rgb(0.4, 0.4, 0.4);

    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 50;
    let currentY = height - margin;

    // Helper for wrapping text
    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, size: number, font: PDFFont, color = rgb(0, 0, 0)) => {
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
                    if (localY < margin + 40) {
                        page = pdfDoc.addPage([595.28, 841.89]);
                        localY = height - margin;
                    }
                } else {
                    line = testLine;
                }
            }
            if (line) {
                page.drawText(line, { x, y: localY, size, font, color });
                localY -= size * 1.4;
            }
            localY -= size * 0.5; // Paragraph spacing
        }
        return localY;
    };

    // Header
    const drawHeader = () => {
        page.drawText("CAHIER DES CHARGES VALIDÉ", {
            x: margin,
            y: height - 50,
            size: 18,
            font: fontBold,
            color: primaryColor
        });
        page.drawText(`PROJET : ${projectName.toUpperCase()}`, {
            x: margin,
            y: height - 70,
            size: 10,
            font: fontRegular,
            color: secondaryColor
        });

        page.drawLine({
            start: { x: margin, y: height - 80 },
            end: { x: width - margin, y: height - 80 },
            thickness: 1,
            color: grayColor,
            opacity: 0.2
        });
    }

    drawHeader();
    currentY = height - 100;

    if (approved.length === 0) {
        page.drawText("Aucune spécification validée pour le moment.", {
            x: margin,
            y: currentY,
            size: 12,
            font: fontItalic,
            color: grayColor
        });
    } else {
        // Group by category if available, else just list
        // Since we didn't fully implement category grouping in this PDF yet, let's just list them

        let index = 1;
        for (const req of approved) {
            // Check page break
            if (currentY < margin + 100) {
                page = pdfDoc.addPage([595.28, 841.89]);
                currentY = height - margin;
                drawHeader();
                currentY = height - 100;
            }

            // Title
            page.drawText(`${index}. ${req.title}`, {
                x: margin,
                y: currentY,
                size: 12,
                font: fontBold,
                color: primaryColor
            });
            currentY -= 20;

            // Meta (Category, Date)
            // @ts-ignore - category might not be in type yet if generated types aren't updated, but it is in DB
            const meta = `Catégorie: ${req.category || 'N/A'} | Validé le: ${new Date(req.updatedAt).toLocaleDateString()}`;
            page.drawText(meta, {
                x: margin,
                y: currentY,
                size: 8,
                font: fontItalic,
                color: secondaryColor
            });
            currentY -= 15;

            // Description
            currentY = drawWrappedText(req.description, margin, currentY, width - 2 * margin, 10, fontRegular, rgb(0.2, 0.2, 0.2));

            currentY -= 20; // Spacing between items
            index++;
        }
    }

    // Footer
    const footerText = `Document généré automatiquement via AUTOMATIC Platform - ${new Date().toLocaleDateString()}`;
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
        const { width: pWidth } = p.getSize();
        p.drawText(`${footerText} - Page ${idx + 1}/${pages.length}`, {
            x: 50,
            y: 30,
            size: 8,
            font: fontItalic,
            color: grayColor
        });
    });

    return await pdfDoc.save();
}
