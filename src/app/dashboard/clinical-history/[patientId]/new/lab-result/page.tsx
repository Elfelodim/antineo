'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const COMMON_TESTS = [
    'Hemograma Completo',
    'Glucosa en Ayunas',
    'Colesterol Total',
    'Triglicéridos',
    'Creatinina Sérica',
    'Uroanálisis',
    'Hemoglobina Glicosilada (HbA1c)',
    'TSH (Hormona Estimulante de Tiroides)',
    'Transaminasas (AST/ALT)',
    'Bilirrubina Total y Fraccionada',
    'Electrolitos (Na, K, Cl)',
    'Ácido Úrico'
];

export default function NewLabResultPage() {
    const params = useParams();
    const patientId = params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        testName: '',
        value: '',
        unit: '',
        referenceRange: '',
        status: 'Normal',
        observations: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let attachmentUrl = '';

            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('Error al subir el archivo');

                const uploadData = await uploadRes.json();
                attachmentUrl = uploadData.url;
            }

            const response = await fetch(`/api/clinical/records/${patientId}/lab-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientId, attachmentUrl }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar el laboratorio');
            }

            router.push(`/dashboard/clinical-history/${patientId}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error desconocido');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lab-result-container">
            <header className="form-header">
                <button onClick={() => router.back()} className="back-btn-header">⬅ Volver</button>
                <h1>Nuevo Resultado de Laboratorio</h1>
                <p>Registro de paraclínicos y resultados diagnósticos</p>
            </header>

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <div className="grid-fields">
                    <div className="field-group">
                        <label>Nombre de la Prueba *</label>
                        <input
                            list="common-tests"
                            name="testName"
                            value={form.testName}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Hemoglobina Glicosilada"
                            autoComplete="off"
                        />
                        <datalist id="common-tests">
                            {COMMON_TESTS.map(test => (
                                <option key={test} value={test} />
                            ))}
                        </datalist>
                    </div>
                    <div className="field-group">
                        <label>Resultado *</label>
                        <input
                            name="value"
                            value={form.value}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 6.5"
                            className="numeric-input"
                        />
                    </div>
                    <div className="field-group">
                        <label>Unidad</label>
                        <input name="unit" value={form.unit} onChange={handleChange} placeholder="Ej: %, mg/dL, g/dL" />
                    </div>
                    <div className="field-group">
                        <label>Rango de Referencia</label>
                        <input name="referenceRange" value={form.referenceRange} onChange={handleChange} placeholder="Ej: 4.0 - 5.6" />
                    </div>
                </div>

                <div className="field-group status-group">
                    <label>Estado del Resultado</label>
                    <div className="select-wrapper">
                        <select name="status" value={form.status} onChange={handleChange} className={`status-${form.status.toLowerCase()}`}>
                            <option value="Normal">🟢 Normal</option>
                            <option value="Abnormal">🟠 Anormal (Fuera de rango)</option>
                            <option value="Critical">🔴 Crítico (Alerta)</option>
                        </select>
                    </div>
                </div>

                <div className="field-group">
                    <label>Observaciones / Interpretación</label>
                    <textarea
                        name="observations"
                        value={form.observations}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Comentarios adicionales sobre el resultado..."
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="field-group full-width">
                    <label>Adjuntar Archivo (Opcional)</label>
                    <div className="file-upload-wrapper">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <span className="file-help">Soporta cualquier extensión (PDF, Imágenes, etc.)</span>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Resultado'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .lab-result-container {
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                    --primary: #00b894; /* Green for labs */
                    --primary-dark: #00a383;
                    --border-color: #dfe6e9;
                    --text-secondary: #636e72;
                }

                .form-header { 
                    margin-bottom: 2rem; 
                    text-align: center;
                    position: relative;
                }

                .back-btn-header {
                    position: absolute;
                    left: 0;
                    top: 0;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .back-btn-header:hover { color: var(--primary); }
                
                .form-header h1 { 
                    color: #2d3436; 
                    font-size: 1.8rem;
                    margin-bottom: 0.5rem;
                }
                
                .form-header p {
                    color: var(--text-secondary);
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 3rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    border: 1px solid rgba(255,255,255,0.8);
                }

                .grid-fields {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .field-group {
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                .status-group {
                    max-width: 50%;
                }

                label { 
                    font-weight: 600; 
                    font-size: 0.95rem; 
                    color: #2d3436; 
                }

                input, select, textarea {
                    padding: 0.875rem 1rem;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                    transition: all 0.2s;
                    width: 100%;
                }

                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 4px rgba(0, 184, 148, 0.1);
                }

                .status-normal { border-color: #00b894; color: #00b894; font-weight: 600; }
                .status-abnormal { border-color: #fdcb6e; color: #d35400; font-weight: 600; }
                .status-critical { border-color: #ff7675; color: #d63031; font-weight: 600; }

                .form-actions {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                    margin-top: 2.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f2f6;
                }

                .save-btn {
                    padding: 1rem 2.5rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .save-btn:hover {
                    transform: translateY(-2px);
                    background: var(--primary-dark);
                }

                .cancel-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                    padding: 1rem;
                }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: center;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
