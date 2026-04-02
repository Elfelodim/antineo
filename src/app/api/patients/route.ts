import { NextResponse } from 'next/server';
import { patientService } from '@/lib/services/patientService';

export async function GET() {
    try {
        const patients = await patientService.getPatients();
        return NextResponse.json(patients);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newPatient = await patientService.createPatient(data);
        return NextResponse.json(newPatient);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
