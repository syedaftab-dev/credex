import { PRICING_DATA, ToolPricing, PricingPlan } from './pricing';

export interface ToolEntry {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number; // What they think they spend
  useCase: 'coding' | 'writing' | 'research' | 'customer-support' | 'general';
}

export interface ToolAuditResult {
  toolId: string;
  toolName: string;
  currentPlanName: string;
  currentMonthlyCost: number;
  recommendedPlanId: string;
  recommendedPlanName: string;
  recommendedMonthlyCost: number;
  monthlySavings: number;
  reason: string;
  isRedundant: boolean;
}

export interface AuditResult {
  perTool: ToolAuditResult[];
  totalCurrentMonthly: number;
  totalRecommendedMonthly: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  showCredex: boolean; // Savings > $500/mo
  isHealthy: boolean; // Savings < $100/mo
}

export function runAudit(entries: ToolEntry[]): AuditResult {
  const perTool: ToolAuditResult[] = [];
  let totalCurrentMonthly = 0;

  // Track use cases to identify potential tool redundancies
  const useCaseMap: Record<string, string[]> = {};

  entries.forEach((entry) => {
    const tool = PRICING_DATA[entry.toolId];
    if (!tool) return;

    totalCurrentMonthly += entry.monthlySpend;

    if (!useCaseMap[entry.useCase]) {
      useCaseMap[entry.useCase] = [];
    }
    useCaseMap[entry.useCase].push(entry.toolId);
  });

  entries.forEach((entry) => {
    const tool = PRICING_DATA[entry.toolId];
    if (!tool) return;

    const currentPlan = tool.plans.find((p) => p.id === entry.planId);
    
    // Track use cases to identify potential tool redundancies
    const peers = useCaseMap[entry.useCase] || [];
    let isRedundant = false;
    if (peers.length > 1) {
      const otherTools = peers.filter(id => id !== entry.toolId);
      if (otherTools.length > 0) {
        isRedundant = true;
      }
    }

    // Find the absolute cheapest plan that fits the seats
    // (Simple heuristic: individual plans for small teams, team plans for large ones)
    let recommendedPlan = currentPlan;
    let recommendedMonthlyCost = isRedundant ? 0 : (currentPlan ? currentPlan.priceMonthly * entry.seats : entry.monthlySpend);
    let reason = isRedundant 
      ? `Redundant with ${peers.filter(id => id !== entry.toolId).join(', ')} for ${entry.useCase}.`
      : 'Optimal plan for your team size.';

    if (!isRedundant) {
      tool.plans.forEach(plan => {
        // Don't suggest free plan if they are on a paid plan
        if (plan.priceMonthly === 0 && (currentPlan?.priceMonthly || 0) > 0) return;
        
        const cost = plan.priceMonthly * entry.seats;
        if (cost < recommendedMonthlyCost) {
          recommendedPlan = plan;
          recommendedMonthlyCost = cost;
          reason = `Switch to ${plan.name} to save $${(entry.monthlySpend - cost)}/mo.`;
        }
      });
    }

    perTool.push({
      toolId: entry.toolId,
      toolName: tool.name,
      currentPlanName: currentPlan?.name || 'Custom',
      currentMonthlyCost: entry.monthlySpend,
      recommendedPlanId: recommendedPlan?.id || entry.planId,
      recommendedPlanName: recommendedPlan?.name || 'Custom',
      recommendedMonthlyCost,
      monthlySavings: entry.monthlySpend - recommendedMonthlyCost,
      reason,
      isRedundant,
    });
  });

  const totalRecommendedMonthly = perTool.reduce((sum, t) => sum + t.recommendedMonthlyCost, 0);
  const totalMonthlySavings = totalCurrentMonthly - totalRecommendedMonthly;

  return {
    perTool,
    totalCurrentMonthly,
    totalRecommendedMonthly,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    showCredex: totalMonthlySavings >= 500,
    isHealthy: totalMonthlySavings < 100,
  };
}
