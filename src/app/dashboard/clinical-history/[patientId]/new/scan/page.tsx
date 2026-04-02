'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function NewMachineScanPage() {
    const params = useParams();
    const patientId = params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        machineType: '',
        rawOutputUrl: '',
        interpretation: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            let finalOutputUrl = form.rawOutputUrl;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error('Error al subir el archivo');

                const uploadData = await uploadRes.json();
                finalOutputUrl = uploadData.url;
            }

            const response = await fetch(`/api/clinical/records/${patientId}/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, rawOutputUrl: finalOutputUrl, patientId }),
            });

            if (!response.ok) throw new Error('Error al guardar el escaneo');

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
        <div className="form-container">
            <header className="form-header">
                <button onClick={() => router.back()} className="back-btn-header">⬅ Volver</button>
                <h1>Nuevo Escaneo de Máquina</h1>
                <p>Procesamiento de datos biomédicos</p>
            </header>

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <div className="field-group">
                    <label>Tipo de Máquina / Equipo *</label>
                    <input name="machineType" value={form.machineType} onChange={handleChange} required placeholder="Ej: Electrocardiógrafo, Espirómetro..." />
                </div>

                <div className="field-group">
                    <label>Adjuntar Archivo de Datos (Reemplaza URL)</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                </div>

                <div className="field-group">
                    <label>URL de Datos (Opcional si se adjunta)</label>
                    <input name="rawOutputUrl" value={form.rawOutputUrl} onChange={handleChange} placeholder="https://servidor-datos.medico/output.raw" />
                </div>

                <div className="field-group">
                    <label>Interpretación Clínica / Hallazgos *</label>
                    <textarea
                        name="interpretation"
                        value={form.interpretation}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Análisis médico de los datos obtenidos..."
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Escaneo'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .form-container {
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    --primary: #007acc;
                    --primary-dark: #005f99;
                    --border-color: #dfe6e9;
                    --text-secondary: #636e72;
                }

                .form-header { margin-bottom: 2rem; position: relative; }
                .back-btn-header {
                    position: absolute;
                    left: 0;
                    top: -1.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                }
                .back-btn-header:hover { color: var(--primary); }
                .form-header h1 { color: var(--primary-dark); margin-bottom: 0.25rem; }
                .form-header p { color: var(--text-secondary); font-size: 0.9rem; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .field-group {
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label { font-weight: 600; font-size: 0.9rem; color: #444; }

                input, textarea {
                    padding: 0.875rem 1rem;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                .form-actions {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }

                .save-btn {
                    padding: 0.875rem 2.5rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .cancel-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
