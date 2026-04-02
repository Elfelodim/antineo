import { NextResponse } from 'next/server';
import { medicalRecordService } from '@/lib/services/medicalRecordService';

export async function GET(
    request: Request,
    props: { params: Promise<{ patientId: string }> }
) {
    const params = await props.params;
    try {
        const { patientId } = params;

        if (!patientId) {
            return NextResponse.json(
                { message: 'ID de paciente requerido' },
                { status: 400 }
            );
        }

        const history = await medicalRecordService.getPatientFullHistory(patientId);

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error in Clinical History GET API:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
