export type PlanType = 'gratis' | 'premium';

export const validPlans: PlanType[] = ['gratis', 'premium'];

export const canAccessPlan = (
  userPlan: PlanType | undefined,
  requiredPlan: PlanType | undefined,
): boolean => {
  const currentPlan = userPlan || 'gratis';
  const minimumPlan = requiredPlan || 'gratis';

  // Premium acessa tudo. Gratis acessa apenas conteudos gratis.
  if (currentPlan === 'premium') {
    return true;
  }

  return minimumPlan === 'gratis';
};

export const getAiLimitByPlan = (plan: PlanType | undefined): number => {
  if (plan === 'premium') {
    return 100;
  }

  return 5;
};
