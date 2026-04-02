import { Product } from '@/types/inventory';
import { prisma } from '@/lib/prisma';

// Mocks removed

export const inventoryService = {
    getProducts: async (): Promise<Product[]> => {
        const products = await prisma.product.findMany({
            include: { batches: true }
        });
        return products.map(p => ({
            id: p.id,
            code: p.code,
            name: p.name,
            type: p.type as any,
            category: p.category,
            unit: p.unit as any,
            minStock: p.minStock,
            currentStock: p.currentStock,
            price: p.price,
            status: p.status as any,
            batches: p.batches.map(b => ({
                id: b.id,
                batchNumber: b.batchNumber,
                expirationDate: b.expirationDate.toISOString().split('T')[0],
                quantity: b.quantity
            }))
        }));
    },

    getProductById: async (id: string): Promise<Product | undefined> => {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { batches: true }
        });
        if (!product) return undefined;
        return {
            id: product.id,
            code: product.code,
            name: product.name,
            type: product.type as any,
            category: product.category,
            unit: product.unit as any,
            minStock: product.minStock,
            currentStock: product.currentStock,
            price: product.price,
            status: product.status as any,
            batches: product.batches.map(b => ({
                id: b.id,
                batchNumber: b.batchNumber,
                expirationDate: b.expirationDate.toISOString().split('T')[0],
                quantity: b.quantity
            }))
        };
    }
};
