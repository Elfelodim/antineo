import { Invoice } from '@/types/billing';
import { prisma } from '@/lib/prisma';

// Mocks removed

export const billingService = {
    getInvoices: async (): Promise<Invoice[]> => {
        const invoices = await prisma.invoice.findMany({
            include: {
                items: true,
                patient: true
            },
            orderBy: { date: 'desc' }
        });

        return invoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            patientId: inv.patientId,
            patientName: `${inv.patient.firstName} ${inv.patient.lastName}`,
            payerId: 'EPS-001', // Fallback
            payerName: inv.patient.eps || 'Particular',
            date: inv.date.toISOString().split('T')[0],
            dueDate: inv.dueDate.toISOString().split('T')[0],
            items: inv.items.map(item => ({
                id: item.id,
                code: item.code,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            })),
            subtotal: inv.subtotal,
            tax: inv.tax,
            total: inv.total,
            status: inv.status as any,
            ripsGenerated: inv.ripsGenerated
        }));
    },

    generateRIPS: async (invoiceIds: string[]) => {
        // In a real scenario, this would generate the JSON/XML files based on standard 2275/2023
        // For now, we update the status in DB
        await prisma.invoice.updateMany({
            where: { id: { in: invoiceIds } },
            data: { ripsGenerated: true }
        });

        return { success: true, message: `RIPS generated for ${invoiceIds.length} invoices.` };
    }
};
