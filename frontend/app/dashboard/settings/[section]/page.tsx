export default function GenericSettingsPage({ params }: { params: { section: string } }) {
  const sectionName = params.section.charAt(0).toUpperCase() + params.section.slice(1);
  
  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
        {sectionName}
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        This configuration option is handled natively via local host variables.
      </p>
      <div style={{
        marginTop: '24px', padding: '32px', borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)', border: '1px dashed var(--border-primary)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>⚙️</div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-tertiary)' }}>System Managed Settings</p>
      </div>
    </div>
  );
}
