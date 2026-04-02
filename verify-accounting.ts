import { accountingService } from './src/lib/services/accountingService';

async function verify() {
    console.log('Verification started...');

    try {
        console.log('Fetching accounts...');
        const accounts = await accountingService.getAccounts();
        console.log(`Found ${accounts.length} accounts.`);
        accounts.forEach(acc => console.log(`- ${acc.code}: ${acc.name} (${acc.balance})`));

        if (accounts.length === 0) {
            throw new Error('No accounts found! Seed might have failed or database is empty.');
        }

        console.log('\nFetching payrolls...');
        const payrolls = await accountingService.getPayrolls();
        console.log(`Found ${payrolls.length} payroll records.`);

        console.log('\nTesting payroll calculation for 2025-02...');
        const newPayrolls = await accountingService.calculatePayroll('2025-02');
        console.log(`Calculated ${newPayrolls.length} payroll records for 2025-02.`);
        newPayrolls.forEach(p => console.log(`- ${p.employeeName}: Net ${p.netPay}`));

        console.log('\nVerification SUCCESSFUL.');
    } catch (error) {
        console.error('\nVerification FAILED:', error);
        process.exit(1);
    }
}

verify();
