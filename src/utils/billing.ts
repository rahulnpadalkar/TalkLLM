export interface CreditBalance {
  totalGranted: number;
  totalUsed: number;
  totalAvailable: number;
}

/**
 * Fetch remaining credit balance from OpenAI's billing endpoint.
 * This endpoint is not part of the public SDK — we call it directly.
 * Returns null if the endpoint is unavailable (e.g. pay-as-you-go accounts
 * without credit grants, or accounts where this endpoint is restricted).
 */
export async function fetchCreditBalance(apiKey: string): Promise<CreditBalance | null> {
  const res = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    if (res.status === 404 || res.status === 403) return null; // Not available for this account type
    throw new Error(`Balance API returned ${res.status}`);
  }

  const data = await res.json() as {
    total_granted?: number;
    total_used?: number;
    total_available?: number;
  };

  if (data.total_available === undefined) return null;

  return {
    totalGranted: data.total_granted ?? 0,
    totalUsed: data.total_used ?? 0,
    totalAvailable: data.total_available,
  };
}
