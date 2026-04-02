import { NextResponse } from 'next/server';
import { medicalRecordService } from '@/lib/services/medicalRecordService';

export async function POST(
    request: Request,
    props: { params: Promise<{ patientId: string }> }
) {
    const params = await props.params;
    try {
        const data = await request.json();
        const record = await medicalRecordService.saveMachineScan({ ...data, patientId: params.patientId });
        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
