/**
 * Pricing Data for AI Spend Audit Tool
 * Verified as of May 2026
 */

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnualMonthly?: number; // Monthly equivalent when billed annually
  type: 'individual' | 'team' | 'enterprise' | 'usage';
  features: string[];
}

export interface ToolPricing {
  id: string;
  name: string;
  url: string;
  plans: PricingPlan[];
  alternativeToolId?: string; // Cheaper alternative for audit logic
}

export const PRICING_DATA: Record<string, ToolPricing> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://www.cursor.com/pricing',
    plans: [
      { id: 'hobby', name: 'Hobby', priceMonthly: 0, type: 'individual', features: ['Basic access'] },
      { id: 'pro', name: 'Pro', priceMonthly: 20, priceAnnualMonthly: 16, type: 'individual', features: ['Unlimited autocomplete', 'Pro models'] },
      { id: 'pro-plus', name: 'Pro+', priceMonthly: 60, type: 'individual', features: ['3x Pro usage'] },
      { id: 'ultra', name: 'Ultra', priceMonthly: 200, type: 'individual', features: ['20x Pro usage'] },
      { id: 'teams', name: 'Business', priceMonthly: 40, type: 'team', features: ['Admin controls', 'Shared credits'] },
    ]
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot#pricing',
    plans: [
      { id: 'individual', name: 'Individual', priceMonthly: 10, type: 'individual', features: ['Standard AI coding'] },
      { id: 'pro', name: 'Pro', priceMonthly: 39, type: 'individual', features: ['Advanced AI coding'] },
      { id: 'business', name: 'Business', priceMonthly: 19, type: 'team', features: ['Admin controls'] },
      { id: 'enterprise', name: 'Enterprise', priceMonthly: 39, type: 'team', features: ['Custom models', 'Advanced security'] },
    ],
    alternativeToolId: 'cursor'
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/pricing',
    plans: [
      { id: 'free', name: 'Free', priceMonthly: 0, type: 'individual', features: ['Basic access'] },
      { id: 'pro', name: 'Pro', priceMonthly: 20, priceAnnualMonthly: 17, type: 'individual', features: ['High usage', 'Early access'] },
      { id: 'max-100', name: 'Max ($100)', priceMonthly: 100, type: 'individual', features: ['5x Pro usage'] },
      { id: 'max-200', name: 'Max ($200)', priceMonthly: 200, type: 'individual', features: ['20x Pro usage'] },
      { id: 'team', name: 'Team', priceMonthly: 25, type: 'team', features: ['Shared projects', 'Admin tools'] },
    ]
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://openai.com/chatgpt/pricing',
    plans: [
      { id: 'free', name: 'Free', priceMonthly: 0, type: 'individual', features: ['Basic GPT-4o'] },
      { id: 'plus', name: 'Plus', priceMonthly: 20, type: 'individual', features: ['Advanced models', 'Image generation'] },
      { id: 'pro', name: 'Pro', priceMonthly: 200, type: 'individual', features: ['Reasoning models', 'Unlimited compute'] },
      { id: 'team', name: 'Team', priceMonthly: 25, type: 'team', features: ['Shared workspace', 'Admin console'] },
    ]
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    url: 'https://codeium.com/windsurf/pricing',
    plans: [
      { id: 'free', name: 'Free', priceMonthly: 0, type: 'individual', features: ['Limited credits'] },
      { id: 'pro', name: 'Pro', priceMonthly: 15, type: 'individual', features: ['Higher limits'] },
      { id: 'teams', name: 'Teams', priceMonthly: 35, type: 'team', features: ['Admin dashboard'] },
    ]
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    url: 'https://gemini.google.com/pricing',
    plans: [
      { id: 'free', name: 'Free', priceMonthly: 0, type: 'individual', features: ['Basic Gemini'] },
      { id: 'plus', name: 'AI Plus', priceMonthly: 7.99, type: 'individual', features: ['Gemini Advanced'] },
      { id: 'pro', name: 'AI Pro', priceMonthly: 19.99, type: 'individual', features: ['2TB storage', 'Workspace integration'] },
      { id: 'ultra', name: 'AI Ultra', priceMonthly: 249.99, type: 'individual', features: ['Expanded limits', 'Deep Think'] },
    ]
  }
};

export const API_PRICING = {
  anthropic: {
    name: 'Anthropic API',
    url: 'https://www.anthropic.com/pricing',
    models: [
      { id: 'haiku-4.5', name: 'Claude 4.5 Haiku', input: 1.0, output: 5.0 },
      { id: 'sonnet-4.6', name: 'Claude 4.6 Sonnet', input: 3.0, output: 15.0 },
      { id: 'opus-4.6', name: 'Claude 4.6 Opus', input: 5.0, output: 25.0 },
    ]
  },
  openai: {
    name: 'OpenAI API',
    url: 'https://openai.com/api/pricing',
    models: [
      { id: 'gpt-5-nano', name: 'GPT-5 Nano', input: 0.2, output: 0.8 },
      { id: 'gpt-5-pro', name: 'GPT-5 Pro', input: 5.0, output: 15.0 },
    ]
  }
};
