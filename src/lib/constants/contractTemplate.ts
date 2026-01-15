
export const getContractArticles = (projectName: string, description: string, budget: string, clientName: string) => [
    {
        title: "ARTICLE 1 - OBJET ET SPÉCIFICATIONS",
        content: `Le présent contrat a pour objet la réalisation par le Prestataire du projet intitulé : "${projectName}". ` +
            (description ? `\n\nSpécifications retenues par le Client :\n${description.replace(/\|/g, '\n-')}` :
                "La prestation inclut la conception et le développement technique de la solution logicielle selon les standards de qualité de l'agence.")
    },
    {
        title: "ARTICLE 2 - OBLIGATIONS DES PARTIES",
        content: "Le Prestataire s'engage à réaliser la prestation avec diligence, conformément aux règles de l'art en vigueur dans le secteur technologique en Côte d'Ivoire. Le Client s'engage à collaborer activement, notamment en fournissant tout document, information ou accès nécessaire à la bonne conduite du projet."
    },
    {
        title: "ARTICLE 3 - PRIX ET MODALITÉS DE RÉGLEMENT",
        content: `Le montant total des prestations est fixé à la somme de ${budget} (Toutes Taxes Comprises). Le règlement s'effectue selon l'échéancier suivant : 40% d'acompte à la signature du présent contrat permettant le lancement des travaux, 40% après validation de l'étape de développement intermédiaire, et le solde de 20% à la livraison finale et réception fonctionnelle.`
    },
    {
        title: "ARTICLE 4 - PROPRIÉTÉ INTELLECTUELLE",
        content: "Sous réserve du paiement intégral de la rémunération convenue, le Prestataire cède au Client l'intégralité des droits de propriété intellectuelle afférents aux développements spécifiques réalisés. Cette cession intervient de plein droit dès le règlement du solde final."
    },
    {
        title: "ARTICLE 5 - CONFIDENTIALITÉ",
        content: "Chacune des parties s'engage à conserver confidentielles toutes les informations et données de toute nature relatives à l'autre partie dont elle pourrait avoir connaissance à l'occasion de l'exécution du contrat. Cet engagement vaut pendant toute la durée du contrat et trois (3) ans après son expiration."
    },
    {
        title: "ARTICLE 6 - RÉCEPTION ET GARANTIE",
        content: "La livraison fait l'objet d'un procès-verbal de recette. Le Client dispose de huit (8) jours pour notifier d'éventuelles réserves. En l'absence de réserves, la recette est réputée acquise. Le Prestataire garantit la correction des anomalies bloquantes (bugs) pendant 90 jours à compter de la livraison finale."
    },
    {
        title: "ARTICLE 7 - LOI APPLICABLE ET LITIGES",
        content: "Le présent contrat est régi par le droit ivoirien. Les parties s'engagent à tenter de résoudre à l'amiable tout différend. À défaut d'accord amiable dans un délai de 30 jours, compétence exclusive est attribuée au Tribunal de Commerce d'Abidjan."
    }
];

export const getContractHeader = (clientName: string) => ({
    parties: `ENTRE LES SOUSSIGNÉS :

D'une part,
M./MME/STE ${clientName.toUpperCase()}
Représenté(e) dûment aux fins des présentes.
Ci-après dénommé « l'Autorité contractante »

Et d'autre part,
La société AUTOMATIC CI
Société à Responsabilité Limitée (SARL), Siège social : Abidjan Cocody Riviera, RCCM : CI-ABJ-03-2024-B12-00452.
Ci-après dénommé(e) « le Prestataire ».`
});
