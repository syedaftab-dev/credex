import { describe, it, expect } from 'vitest';
import { runAudit, ToolEntry } from './audit-engine';

describe('Audit Engine', () => {
  it('identifies basic savings on oversized plans', () => {
    const input: ToolEntry[] = [{
      toolId: 'cursor',
      planId: 'teams', // $40/mo
      seats: 1,
      monthlySpend: 40,
      useCase: 'coding'
    }];
    
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(20); // Switch to Pro ($20)
    expect(result.perTool[0].recommendedPlanId).toBe('pro');
  });

  it('identifies redundancy between Claude and ChatGPT', () => {
    const input: ToolEntry[] = [
      { toolId: 'claude', planId: 'pro', seats: 1, monthlySpend: 20, useCase: 'general' },
      { toolId: 'chatgpt', planId: 'plus', seats: 1, monthlySpend: 20, useCase: 'general' }
    ];
    
    const result = runAudit(input);
    expect(result.perTool.some(t => t.isRedundant)).toBe(true);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  it('triggers Credex CTA for high savings', () => {
    const input: ToolEntry[] = [{
      toolId: 'cursor',
      planId: 'ultra', // $200/mo
      seats: 10,
      monthlySpend: 2000,
      useCase: 'coding'
    }];
    
    // Switch to Pro ($20) would save $180 * 10 = $1800
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.showCredex).toBe(true);
  });

  it('returns healthy status for optimal spend', () => {
    const input: ToolEntry[] = [{
      toolId: 'cursor',
      planId: 'pro',
      seats: 1,
      monthlySpend: 20,
      useCase: 'coding'
    }];
    
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.isHealthy).toBe(true);
  });

  it('calculates annual savings correctly', () => {
    const input: ToolEntry[] = [{
      toolId: 'cursor',
      planId: 'teams',
      seats: 1,
      monthlySpend: 40,
      useCase: 'coding'
    }];
    
    const result = runAudit(input);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });
});
