import InvoiceList from '@/components/billing/InvoiceList';
import { billingService } from '@/lib/services/billingService';

export default async function BillingPage() {
    const invoices = await billingService.getInvoices();
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);

    return (
        <div className="billing-page">
            <div className="page-header">
                <h1 className="page-title">Facturación y RIPS</h1>
                <p className="page-subtitle">Gestión de facturas y generación de archivos RIPS.</p>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">${totalBilled.toLocaleString()}</span>
                    <span className="stat-label">Total Facturado (Mes)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{invoices.filter(i => i.status === 'Paid').length}</span>
                    <span className="stat-label">Facturas Pagadas</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{invoices.filter(i => !i.ripsGenerated).length}</span>
                    <span className="stat-label">Pendientes RIPS</span>
                </div>
            </div>

            <div className="billing-content">
                <div className="toolbar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '10px' }}>
                    <button className="btn btn-outline">Generar Masivo RIPS</button>
                    <button className="btn btn-primary">+ Nueva Factura</button>
                </div>
                <InvoiceList invoices={invoices} />
            </div>
        </div>
    );
}
