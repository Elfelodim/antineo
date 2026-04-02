'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function NewEvolutionPage() {
    const params = useParams();
    const patientId = params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        hospitalizationId: '', // Should be fetched or passed
        note: '',
        doctorName: 'Dr. Alejandro Gomez', // Mock
        bloodPressure: '',
        heartRate: '',
        temperature: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Note: In a real app, we'd need the specific hospitalizationId
            // Here we'll simulate or find the active one in the API
            const response = await fetch(`/api/clinical/records/${patientId}/hospitalization/evolution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientId }),
            });

            if (!response.ok) throw new Error('Error al registrar la evolución');

            router.push(`/dashboard/clinical-history/${patientId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <header className="form-header">
                <h1>Evolución Diaria</h1>
                <p>Seguimiento clínico del paciente hospitalizado</p>
            </header>

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <div className="field-group">
                    <label>ID de Hospitalización *</label>
                    <input name="hospitalizationId" value={form.hospitalizationId} onChange={handleChange} required placeholder="UUID de la estancia activa" />
                </div>

                <div className="grid-vitals">
                    <div className="field-group">
                        <label>Tensión Arterial</label>
                        <input name="bloodPressure" value={form.bloodPressure} onChange={handleChange} placeholder="120/80" />
                    </div>
                    <div className="field-group">
                        <label>FC (lpm)</label>
                        <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="72" />
                    </div>
                    <div className="field-group">
                        <label>Temp (°C)</label>
                        <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} placeholder="36.5" />
                    </div>
                </div>

                <div className="field-group">
                    <label>Nota de Evolución *</label>
                    <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Descripción detallada de la evolución clínica en las últimas 24 horas..."
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Evolución'}
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

                .form-header { margin-bottom: 2rem; }
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

                .grid-vitals {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 1rem;
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
