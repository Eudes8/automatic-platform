import * as React from 'react';

interface ProjectEmailProps {
    name: string;
    projectName: string;
    estimate: string;
    dashboardUrl: string;
}

export const ProjectCreatedEmail: React.FC<Readonly<ProjectEmailProps>> = ({
    name,
    projectName,
    estimate,
    dashboardUrl,
}) => (
    <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#020617',
        color: '#ffffff',
        padding: '40px 20px',
        borderRadius: '24px',
        maxWidth: '600px',
        margin: '0 auto',
    }}>
        <h1 style={{ color: '#3b82f6', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>
            AUTOMATIC // PROJET LANCÉ
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '24px', color: '#94a3b8' }}>
            Bonjour {name}, ravi de vous compter parmi nous.
        </p>
        <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '24px',
            borderRadius: '16px',
            margin: '32px 0'
        }}>
            <h2 style={{ fontSize: '14px', color: '#60a5fa', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Estimation Immédiate
            </h2>
            <p style={{ fontSize: '32px', fontWeight: '900', margin: '0', color: '#ffffff' }}>
                {estimate}€
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Project : {projectName}
            </p>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Votre espace de siège virtuel est prêt. Vous pouvez y suivre le développement en temps réel, échanger avec l'équipe et signer vos contrats.
        </p>
        <a href={dashboardUrl} style={{
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '16px 32px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '24px'
        }}>
            Accéder à mon Siège Virtuel
        </a>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '40px', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
            Ceci est une notification automatique. Pas besoin d'y répondre directement.
        </p>
    </div>
);
