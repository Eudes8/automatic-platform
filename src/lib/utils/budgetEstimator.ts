import { Requirement } from "@prisma/client";

export function estimateBudget(requirements: Requirement[]): number {
    const baseCost = 100000; // XOF - Setup fee
    const approvedCount = requirements.filter(r => r.status === 'APPROVED').length;

    // Cost per requirement (simplified logic)
    // Could be enhanced by checking category
    const averageCostPerRequirement = 75000; // XOF

    let total = baseCost + (approvedCount * averageCostPerRequirement);

    // Add some complexity based on categories if available
    // @ts-ignore
    const complexCount = requirements.filter(r => r.status === 'APPROVED' && (r.category === 'SECURITY' || r.category === 'PERFORMANCE')).length;
    if (complexCount > 0) {
        total += complexCount * 50000; // Extra for complex items
    }

    return total;
}
