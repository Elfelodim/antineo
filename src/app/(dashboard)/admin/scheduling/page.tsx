import AppointmentList from '@/components/scheduling/AppointmentList';
import { schedulingService } from '@/lib/services/schedulingService';

export default async function AdminSchedulingPage() {
    const appointments = await schedulingService.getAppointments();

    return (
        <div className="scheduling-page">
            <div className="page-header">
                <h1 className="page-title">Programación de Citas</h1>
                <p className="page-subtitle">Gestión de agenda médica y recursos.</p>
            </div>

            <div className="agenda-section">
                <h3 className="section-title">Agenda del Día</h3>
                <AppointmentList appointments={appointments} />
            </div>
        </div>
    );
}
