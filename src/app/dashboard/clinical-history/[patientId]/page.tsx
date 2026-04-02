'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { PatientHistory } from '@/lib/services/medicalRecordService';

export default function ClinicalHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.patientId as string;
    const [activeTab, setActiveTab] = useState('consultas');
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<PatientHistory | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/clinical/records/${patientId}`);
                const data = await response.json();
                setHistory(data);
            } catch (error) {
                console.error('Error fetching patient history:', error);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchHistory();
        }
    }, [patientId]);

    const handleNewRecord = (type: string) => {
        router.push(`/dashboard/clinical-history/${patientId}/new/${type}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="clinical-history-container">
            <header className="page-header">
                <div className="header-titles">
                    <button onClick={() => router.push('/clinical')} className="back-link">⬅ Volver</button>
                    <h1>Historia Clínica Integrada</h1>
                    <div className="patient-quick-info">
                        <span>ID Paciente: {patientId}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={() => handleNewRecord('consultation')} className="action-btn">🩺 Nueva Consulta</button>
                    <button onClick={() => handleNewRecord('admission')} className="action-btn">🏥 Ingreso Hosp.</button>
                    <button onClick={() => handleNewRecord('lab-result')} className="action-btn">🧪 Nuevo Lab.</button>
                    <button onClick={() => handleNewRecord('image')} className="action-btn">🖼️ Nueva Imagen</button>
                    <button onClick={() => handleNewRecord('scan')} className="action-btn">📠 Nuevo Escaneo</button>
                    <button onClick={() => router.push(`/billing?patientId=${patientId}`)} className="action-btn secondary">📄 Ver Facturación</button>
                    <button onClick={() => router.push(`/accounting?patientId=${patientId}`)} className="action-btn secondary">💰 Ver Contabilidad</button>
                </div>
            </header>

            <nav className="history-tabs">
                <button className={activeTab === 'consultas' ? 'active' : ''} onClick={() => setActiveTab('consultas')}>🩺 Consultas</button>
                <button className={activeTab === 'hospitalizacion' ? 'active' : ''} onClick={() => setActiveTab('hospitalizacion')}>🏥 Hospitalización</button>
                <button className={activeTab === 'laboratorios' ? 'active' : ''} onClick={() => setActiveTab('laboratorios')}>🧪 Laboratorios</button>
                <button className={activeTab === 'imagenes' ? 'active' : ''} onClick={() => setActiveTab('imagenes')}>🖼️ Imágenes</button>
                <button className={activeTab === 'escaneos' ? 'active' : ''} onClick={() => setActiveTab('escaneos')}>📠 Escaneos</button>
            </nav>

            <main className="tab-content glass-panel">
                {activeTab === 'consultas' && (
                    <div className="consultations-timeline">
                        {(history?.consultations?.length ?? 0) > 0 ? (
                            history!.consultations.map((record) => (
                                <div key={record.id} className="consultation-card">
                                    <div className="card-header">
                                        <span className="date">{new Date(record.createdAt).toLocaleDateString()}</span>
                                        <span className="doctor">Dr. {record.doctorName}</span>
                                    </div>
                                    <div className="card-body">
                                        <h4>Motivo: {record.reasonForVisit}</h4>
                                        <p><strong>Historia:</strong> {record.clinicalHistory}</p>
                                        <div className="vital-signs">
                                            <span>TA: {record.bloodPressure || 'N/A'}</span>
                                            <span>FC: {record.heartRate || 'N/A'}</span>
                                            <span>T: {record.temperature || 'N/A'}°C</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No hay consultas registradas.</p>
                        )}
                    </div>
                )}

                {activeTab === 'hospitalizacion' && (
                    <div className="hospitalization-view">
                        {(history?.hospitalizations?.length ?? 0) > 0 ? (
                            history!.hospitalizations.map((hosp) => (
                                <div key={hosp.id} className={`hosp-card ${hosp.status.toLowerCase()}`}>
                                    <div className="hosp-header">
                                        <div className="hosp-status">
                                            <span className={`badge ${hosp.status.toLowerCase()}`}>{hosp.status}</span>
                                            <strong>Cama: {hosp.bedNumber}</strong>
                                        </div>
                                        <div className="hosp-dates">
                                            <span>Ingreso: {new Date(hosp.admissionDate).toLocaleDateString()}</span>
                                            {hosp.dischargeDate && <span> - Alta: {new Date(hosp.dischargeDate).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                    <div className="hosp-body">
                                        <p><strong>Diagnóstico Ingreso:</strong> {hosp.admissionDiagnosis}</p>
                                        <div className="evolutions-section">
                                            <h5>Evoluciones ({hosp.evolutions?.length || 0})</h5>
                                            {hosp.evolutions?.map((evo) => (
                                                <div key={evo.id} className="evo-mini-card">
                                                    <span className="evo-date">{new Date(evo.date).toLocaleDateString()}</span>
                                                    <p>{evo.note}</p>
                                                </div>
                                            ))}
                                            {hosp.status === 'Active' && (
                                                <button onClick={() => router.push(`/dashboard/clinical-history/${patientId}/new/evolution?hospId=${hosp.id}`)} className="add-evo-btn">+ Agregar Evolución</button>
                                            )}
                                        </div>
                                        {hosp.epicrisis ? (
                                            <div className="epicrisis-summary">
                                                <h5>Epicrisis (Resumen de Alta)</h5>
                                                <p>{hosp.epicrisis.summary}</p>
                                            </div>
                                        ) : (
                                            hosp.status === 'Active' && (
                                                <button onClick={() => router.push(`/dashboard/clinical-history/${patientId}/new/epicrisis?hospId=${hosp.id}`)} className="discharge-btn">Generar Alta (Epicrisis)</button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No hay registros de hospitalización.</p>
                        )}
                    </div>
                )}

                {activeTab === 'laboratorios' && (
                    <div className="labs-grid">
                        <table className="labs-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Prueba</th>
                                    <th>Resultado</th>
                                    <th>Rango</th>
                                    <th>Estado</th>
                                    <th>Archivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(history?.labResults?.length ?? 0) > 0 ? (
                                    history!.labResults.map((lab) => (
                                        <tr key={lab.id} className={`status-${lab.status.toLowerCase()}`}>
                                            <td>{new Date(lab.performedAt).toLocaleDateString()}</td>
                                            <td>{lab.testName}</td>
                                            <td>{lab.value} {lab.unit}</td>
                                            <td>{lab.referenceRange}</td>
                                            <td><span className={`badge ${lab.status.toLowerCase()}`}>{lab.status}</span></td>
                                            <td>
                                                {lab.attachmentUrl ? (
                                                    <a href={lab.attachmentUrl} target="_blank" rel="noopener noreferrer" className="download-link">🔗 Ver</a>
                                                ) : (
                                                    <span className="no-file">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="no-data">No hay laboratorios registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'imagenes' && (
                    <div className="images-gallery">
                        {(history?.diagnosticImages?.length ?? 0) > 0 ? (
                            history!.diagnosticImages.map((img) => (
                                <div key={img.id} className="image-card">
                                    <div className="image-placeholder">
                                        <span>{img.imageType}</span>
                                    </div>
                                    <div className="image-info">
                                        <h4>{img.imageType}</h4>
                                        <p>{new Date(img.performedAt).toLocaleDateString()}</p>
                                        <p className="report-preview">{img.report || 'Sin reporte disponible'}</p>
                                        {img.imageUrl && (
                                            <a href={img.imageUrl} target="_blank" rel="noopener noreferrer" className="view-img-btn">
                                                Ver Archivo / Imagen
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No hay imágenes diagnósticas registradas.</p>
                        )}
                    </div>
                )}

                {activeTab === 'escaneos' && (
                    <div className="scans-list">
                        {(history?.machineScans?.length ?? 0) > 0 ? (
                            history!.machineScans.map((scan) => (
                                <div key={scan.id} className="scan-item">
                                    <div className="scan-header">
                                        <strong>{scan.machineType}</strong>
                                        <span>{new Date(scan.performedAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="interpretation"><strong>Interpretación:</strong> {scan.interpretation || 'Pendiente'}</p>
                                    {scan.rawOutputUrl ? (
                                        <a href={scan.rawOutputUrl} target="_blank" rel="noopener noreferrer" className="view-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                            Ver Archivo de Datos
                                        </a>
                                    ) : (
                                        <button className="view-btn" disabled>Sin Archivo Adjunto</button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No hay escaneos de máquinas registrados.</p>
                        )}
                    </div>
                )}
            </main>

            <style jsx>{`
                .clinical-history-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    --primary: #007acc;
                    --primary-dark: #005f99;
                    --border-color: #dfe6e9;
                    --text-secondary: #636e72;
                    --danger: #d63031;
                    --success: #00b894;
                }

                .page-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .back-link {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                    margin-right: 1rem;
                    font-size: 1rem;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: background 0.2s;
                }
                .back-link:hover { background: #f1f5f9; color: var(--primary); }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                .action-btn {
                    padding: 0.75rem 1.25rem;
                    background: white;
                    border: 2px solid var(--primary);
                    color: var(--primary);
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--primary);
                    color: white;
                }

                .action-btn.secondary {
                    background: white;
                    border-color: #cbd5e1;
                    color: #475569;
                }

                .action-btn.secondary:hover {
                    background: #f1f5f9;
                    border-color: var(--primary);
                    color: var(--primary);
                }

                .patient-quick-info {
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    font-weight: 500;
                    margin-top: 0.5rem;
                }

                .history-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }

                .history-tabs button {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: rgba(255,255,255,0.5);
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    white-space: nowrap;
                }

                .history-tabs button.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 2rem;
                    border: 1px solid rgba(255,255,255,0.5);
                    min-height: 400px;
                }

                .consultation-card {
                    border-left: 4px solid var(--primary);
                    background: white;
                    padding: 1.5rem;
                    border-radius: 0 12px 12px 0;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .hosp-card {
                    border: 1px solid var(--border-color);
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .hosp-card.active { border-left: 6px solid var(--success); }
                .hosp-card.discharged { border-left: 6px solid var(--text-secondary); opacity: 0.8; }

                .hosp-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .evolutions-section {
                    margin: 1rem 0;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .evo-mini-card {
                    padding: 0.5rem 0;
                    border-bottom: 1px dashed #cbd5e1;
                    font-size: 0.9rem;
                }

                .evo-date { font-weight: 600; color: var(--primary); margin-right: 0.5rem; }

                .add-evo-btn, .discharge-btn {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-right: 1rem;
                }

                .add-evo-btn { background: #e0f2fe; color: #0369a1; border: none; }
                .discharge-btn { background: #fee2e2; color: #b91c1c; border: none; }

                .epicrisis-summary {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f1f5f9;
                    border-radius: 8px;
                    font-style: italic;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .vital-signs {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--border-color);
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--primary-dark);
                }

                .labs-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .labs-table th {
                    text-align: left;
                    padding: 1rem;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                }

                .labs-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .badge {
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .badge.active { background: #d1fae5; color: #059669; }
                .badge.discharged { background: #f1f5f9; color: #475569; }
                .badge.critical { background: #fee2e2; color: #dc2626; }
                .badge.abnormal { background: #fef3c7; color: #d97706; }
                .badge.normal { background: #d1fae5; color: #059669; }

                .images-gallery {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .image-card {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .image-placeholder {
                    height: 150px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: #94a3b8;
                }

                .image-info { padding: 1rem; }

                .report-preview {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .view-img-btn {
                    display: inline-block;
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                }
                .view-img-btn:hover { text-decoration: underline; }

                .download-link {
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 600;
                }
                .download-link:hover { text-decoration: underline; }

                .no-file {
                    color: #cbd5e1;
                }

                .scan-item {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    border: 1px solid var(--border-color);
                }

                .scan-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .view-btn {
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .view-btn:hover { background: #e2e8f0; }

                .no-data {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 3rem;
                }

                .loader {
                    width: 48px;
                    height: 48px;
                    border: 5px solid var(--primary);
                    border-bottom-color: transparent;
                    border-radius: 50%;
                    display: inline-block;
                    animation: rotation 1s linear infinite;
                }

                @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
