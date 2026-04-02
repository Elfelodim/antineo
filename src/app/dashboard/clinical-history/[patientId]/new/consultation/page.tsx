'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function NewConsultationPage() {
    const params = useParams();
    const patientId = params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        doctorId: 'doc-001', // Mock doctor
        doctorName: 'Juan Perez',
        reasonForVisit: '',
        clinicalHistory: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        temperature: '',
        weight: '',
        height: '',
        physicalExamFindings: '',
        treatmentPlan: '',
        observations: '',
        diagnoses: [
            { code: '', description: '', type: 'Principal' }
        ]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDiagnosisChange = (index: number, field: string, value: string) => {
        const newDiagnoses = [...form.diagnoses];
        newDiagnoses[index] = { ...newDiagnoses[index], [field]: value };
        setForm(prev => ({ ...prev, diagnoses: newDiagnoses }));
    };

    const addDiagnosis = () => {
        setForm(prev => ({
            ...prev,
            diagnoses: [...prev.diagnoses, { code: '', description: '', type: 'Relacionado' }]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/clinical/records/${patientId}/consultation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar la consulta');
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
        <div className="new-consultation-container">
            <header className="form-header">
                <button onClick={() => router.back()} className="back-btn-header">⬅ Volver</button>
                <h1>Nueva Consulta Externa</h1>
                <p>Cumplimiento Resolución 1995 de 1999</p>
            </header>

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <section className="form-section">
                    <h3>1. Anamnesis</h3>
                    <div className="field-group">
                        <label>Motivo de Consulta *</label>
                        <textarea
                            name="reasonForVisit"
                            value={form.reasonForVisit}
                            onChange={handleChange}
                            required
                            placeholder="Descripción breve del motivo de la consulta..."
                        />
                    </div>
                    <div className="field-group">
                        <label>Enfermedad Actual *</label>
                        <textarea
                            name="clinicalHistory"
                            value={form.clinicalHistory}
                            onChange={handleChange}
                            required
                            placeholder="Relato cronológico de la sintomatología..."
                            rows={5}
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3>2. Constantes Vitales y Examen Físico</h3>
                    <div className="grid-vitals">
                        <div className="field-group">
                            <label>Tensión Arterial</label>
                            <input name="bloodPressure" value={form.bloodPressure} onChange={handleChange} placeholder="120/80" />
                        </div>
                        <div className="field-group">
                            <label>Frecuencia Cardíaca</label>
                            <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="lp/m" />
                        </div>
                        <div className="field-group">
                            <label>Temp (°C)</label>
                            <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} placeholder="36.5" />
                        </div>
                        <div className="field-group">
                            <label>Peso (kg)</label>
                            <input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} placeholder="70" />
                        </div>
                    </div>
                    <div className="field-group mt-4">
                        <label>Hallazgos Examen Físico *</label>
                        <textarea
                            name="physicalExamFindings"
                            value={form.physicalExamFindings}
                            onChange={handleChange}
                            required
                            placeholder="Descripción por sistemas..."
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3>3. Impresión Diagnóstica (CIE-10)</h3>
                    {form.diagnoses.map((diag, index) => (
                        <div key={index} className="diagnosis-row">
                            <input
                                className="code-input"
                                placeholder="Código"
                                value={diag.code}
                                onChange={(e) => handleDiagnosisChange(index, 'code', e.target.value)}
                                required
                            />
                            <input
                                className="desc-input"
                                placeholder="Descripción del diagnóstico"
                                value={diag.description}
                                onChange={(e) => handleDiagnosisChange(index, 'description', e.target.value)}
                                required
                            />
                            <select
                                value={diag.type}
                                onChange={(e) => handleDiagnosisChange(index, 'type', e.target.value)}
                            >
                                <option value="Principal">Principal</option>
                                <option value="Relacionado">Relacionado</option>
                            </select>
                        </div>
                    ))}
                    <button type="button" onClick={addDiagnosis} className="add-btn">+ Agregar Diagnóstico</button>
                </section>

                <section className="form-section">
                    <h3>4. Plan de Manejo y Conducta</h3>
                    <div className="field-group">
                        <label>Tratamiento y Plan *</label>
                        <textarea
                            name="treatmentPlan"
                            value={form.treatmentPlan}
                            onChange={handleChange}
                            required
                            placeholder="Medicamentos, paraclínicos, recomendaciones..."
                            rows={4}
                        />
                    </div>
                </section>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Historia Clínica'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .new-consultation-container {
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                    --primary: #007acc;
                    --primary-dark: #005f99;
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
                }
                .back-btn-header:hover { color: var(--primary); }

                .form-header h1 { color: var(--primary-dark); margin-bottom: 0.5rem; }
                .form-header p { color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 3rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .form-section {
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .form-section:last-of-type { border-bottom: none; }

                .form-section h3 {
                    color: var(--primary);
                    margin-bottom: 1.5rem;
                    font-size: 1.1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .field-group {
                    margin-bottom: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #444;
                }

                textarea, input, select {
                    padding: 0.75rem 1rem;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                    background: #f8fafc;
                }

                textarea:focus, input:focus, select:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                .grid-vitals {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .diagnosis-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .code-input { width: 120px; }
                .desc-input { flex: 1; }

                .add-btn {
                    background: none;
                    border: 2px dashed var(--primary);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 0.5rem;
                }

                .form-actions {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                    margin-top: 2rem;
                }

                .save-btn {
                    padding: 1rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 122, 204, 0.4);
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
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-weight: 600;
                }

                .mt-4 { margin-top: 1rem; }
            `}</style>
        </div>
    );
}
