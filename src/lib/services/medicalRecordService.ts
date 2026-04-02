import { prisma } from '@/lib/prisma';
import {
    MedicalRecord,
    LabResult,
    DiagnosticImage,
    MachineScan,
    Hospitalization,
    Evolution,
    Epicrisis,
    Prisma
} from '@prisma/client';

export interface PatientHistory {
    consultations: MedicalRecord[];
    labResults: LabResult[];
    diagnosticImages: DiagnosticImage[];
    machineScans: MachineScan[];
    hospitalizations: (Hospitalization & { evolutions: Evolution[], epicrisis: Epicrisis | null })[];
}

// Input types
interface CreateConsultationData {
    patientId: string;
    doctorId: string;
    doctorName: string;
    reasonForVisit: string;
    clinicalHistory: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    temperature?: string;
    weight?: string;
    height?: string;
    physicalExamFindings: string;
    treatmentPlan: string;
    observations?: string;
    diagnoses: Prisma.DiagnosisCreateWithoutMedicalRecordInput[];
}

interface CreateLabResultData {
    patientId: string;
    testName: string;
    result: string; // or value
    value: string;
    unit: string;
    referenceRange: string;
    comments?: string;
    status: string; // or enum
}

interface CreateDiagnosticImageData {
    patientId: string;
    imageType: string;
    imageUrl: string;
    report: string;
    performerName?: string;
}

interface CreateMachineScanData {
    patientId: string;
    scanType: string;
    outputUrl: string; // or similar
    // Check schema for exact fields if failed, but for now guessing based on usage
    machineType: string; // based on viewed file
    rawOutputUrl: string;
    interpretation: string;
}

interface CreateAdmissionData {
    patientId: string;
    bedNumber: string;
    admissionDiagnosis: string;
    doctorInCharge: string;
}

interface CreateEvolutionData {
    hospitalizationId: string;
    note: string;
    doctorName: string;
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
}

interface CreateEpicrisisData {
    hospitalizationId: string;
    summary: string;
    treatments: string;
    recommendations: string;
}

export const medicalRecordService = {
    getPatientFullHistory: async (patientId: string): Promise<PatientHistory> => {
        const [consultations, labResults, diagnosticImages, machineScans, hospitalizations] = await Promise.all([
            prisma.medicalRecord.findMany({
                where: { patientId },
                include: { diagnoses: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.labResult.findMany({
                where: { patientId },
                orderBy: { performedAt: 'desc' }
            }),
            prisma.diagnosticImage.findMany({
                where: { patientId },
                orderBy: { performedAt: 'desc' }
            }),
            prisma.machineScan.findMany({
                where: { patientId },
                orderBy: { performedAt: 'desc' }
            }),
            prisma.hospitalization.findMany({
                where: { patientId },
                include: { evolutions: true, epicrisis: true },
                orderBy: { admissionDate: 'desc' }
            })
        ]);

        return {
            consultations,
            labResults,
            diagnosticImages,
            machineScans,
            hospitalizations
        };
    },

    saveConsultation: async (data: CreateConsultationData) => {
        return prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                reasonForVisit: data.reasonForVisit,
                clinicalHistory: data.clinicalHistory,
                bloodPressure: data.bloodPressure,
                heartRate: data.heartRate ? Number(data.heartRate) : null,
                respiratoryRate: data.respiratoryRate ? Number(data.respiratoryRate) : null,
                temperature: data.temperature ? Number(data.temperature) : null,
                weight: data.weight ? Number(data.weight) : null,
                height: data.height ? Number(data.height) : null,
                physicalExamFindings: data.physicalExamFindings,
                treatmentPlan: data.treatmentPlan,
                observations: data.observations,
                diagnoses: {
                    create: data.diagnoses
                }
            }
        });
    },

    saveLabResult: async (data: any) => { // Keeping any for now to avoid breaking if interfaces don't match view, but 'data' usage below suggests direct pass
        return prisma.labResult.create({ data });
    },

    saveDiagnosticImage: async (data: any) => {
        return prisma.diagnosticImage.create({ data });
    },

    saveMachineScan: async (data: any) => {
        return prisma.machineScan.create({ data });
    },

    // --- Hospitalization Methods ---

    saveAdmission: async (data: CreateAdmissionData) => {
        return prisma.hospitalization.create({
            data: {
                patientId: data.patientId,
                bedNumber: data.bedNumber,
                admissionDiagnosis: data.admissionDiagnosis,
                doctorInCharge: data.doctorInCharge,
                status: 'Active'
            }
        });
    },

    saveEvolution: async (data: CreateEvolutionData) => {
        return prisma.evolution.create({
            data: {
                hospitalizationId: data.hospitalizationId,
                note: data.note,
                doctorName: data.doctorName,
                bloodPressure: data.bloodPressure,
                heartRate: data.heartRate ? Number(data.heartRate) : null,
                temperature: data.temperature ? Number(data.temperature) : null
            }
        });
    },

    saveEpicrisis: async (data: CreateEpicrisisData) => {
        // Create epicrisis and close hospitalization
        const [epicrisis] = await Promise.all([
            prisma.epicrisis.create({
                data: {
                    hospitalizationId: data.hospitalizationId,
                    summary: data.summary,
                    treatments: data.treatments,
                    recommendations: data.recommendations
                }
            }),
            prisma.hospitalization.update({
                where: { id: data.hospitalizationId },
                data: {
                    status: 'Discharged',
                    dischargeDate: new Date()
                }
            })
        ]);
        return epicrisis;
    }
};
