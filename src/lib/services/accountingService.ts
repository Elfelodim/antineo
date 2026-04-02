import { Account, Payroll, Employee } from '@/types/accounting';
import { prisma } from '@/lib/prisma';

// Employees mocked as HR source
const MOCK_EMPLOYEES: Employee[] = [
    { id: 'E1', name: 'Dr. Admin', document: '10001', salary: 8000000, position: 'Médico General', startDate: '2024-01-01' },
    { id: 'E2', name: 'Enf. Jefe', document: '10002', salary: 3500000, position: 'Enfermera', startDate: '2024-02-01' }
];

export const accountingService = {
    getAccounts: async (): Promise<Account[]> => {
        const accounts = await prisma.account.findMany();
        return accounts.map(acc => ({
            code: acc.code,
            name: acc.name,
            type: acc.type as any,
            balance: acc.balance
        }));
    },

    getPayrolls: async (): Promise<Payroll[]> => {
        const payrolls = await prisma.payroll.findMany();
        return payrolls.map(p => ({
            id: p.id,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            period: p.period,
            basicSalary: p.basicSalary,
            healthDeduction: p.healthDeduction,
            pensionDeduction: p.pensionDeduction,
            netPay: p.netPay,
            status: p.status as any
        }));
    },

    calculatePayroll: async (period: string): Promise<Payroll[]> => {
        // Business Rule: 4% health, 4% pension
        const newPayrolls = MOCK_EMPLOYEES.map(emp => {
            const health = emp.salary * 0.04;
            const pension = emp.salary * 0.04;
            return {
                employeeId: emp.id,
                employeeName: emp.name,
                period,
                basicSalary: emp.salary,
                healthDeduction: health,
                pensionDeduction: pension,
                netPay: emp.salary - health - pension,
                status: 'Pending'
            };
        });

        // Save to DB
        await prisma.$transaction(
            newPayrolls.map(p => prisma.payroll.create({ data: p }))
        );

        // Fetch back to get actual data from DB
        const saved = await prisma.payroll.findMany({ where: { period } });
        return saved.map(p => ({
            id: p.id,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            period: p.period,
            basicSalary: p.basicSalary,
            healthDeduction: p.healthDeduction,
            pensionDeduction: p.pensionDeduction,
            netPay: p.netPay,
            status: p.status as any
        }));
    }
};
