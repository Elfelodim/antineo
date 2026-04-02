import { Product } from '@/types/inventory';
import { prisma } from '@/lib/prisma';

// Mocks removed

export const inventoryService = {
    getProducts: async (): Promise<Product[]> => {
        const products = await prisma.product.findMany();
        return products.map(p => ({
            id: p.id,
            code: p.code,
            name: p.name,
            type: p.type as any,
            category: p.category,
            unit: p.unit as any,
            minStock: p.minStock,
            currentStock: p.stock,
            price: p.price,
            status: p.status as any,
            batches: p.expirationDate ? [{
                id: p.id,
                batchNumber: 'DEFAULT',
                expirationDate: p.expirationDate.toISOString().split('T')[0],
                quantity: p.stock
            }] : []
        }));
    },

    getProductById: async (id: string): Promise<Product | undefined> => {
        const product = await prisma.product.findUnique({
            where: { id }
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
            currentStock: product.stock,
            price: product.price,
            status: product.status as any,
            batches: product.expirationDate ? [{
                id: product.id,
                batchNumber: 'DEFAULT',
                expirationDate: product.expirationDate.toISOString().split('T')[0],
                quantity: product.stock
            }] : []
        };
    }
};
