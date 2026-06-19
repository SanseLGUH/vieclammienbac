export const MOCK = {
  me: {
    username: "sansel",
    rank: { current_rate: 4.2, level: "good", next_tier_limit: 4.5, progress_percentage: 85 },
    stats: { total_shifts: 350, reliability_score: 0.98 },
    profile: { 
      avatar_url: "https://i.pravatar.cc/150?u=sansel", 
      banner_url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400", 
      bio: "Rust Backend Developer", 
      status: "Active" 
  }
},
company: { name: "Biel Crystal", shift: "Sáng", pickup_point: { name: "Bus Stop A" } },
salary: {
    periods: [
      { period_id: 50, type: 'weekly', started_in: "2026-03-23T00:00:00Z", ended_at: "2026-03-29T00:00:00Z", total_salary: 1120000, performance_multiplier: 1.05, period_rating: 4.8, status: 'processing', days: [{day:'monday',amount:180000},{day:'tuesday',amount:190000},{day:'wednesday',amount:200000},{day:'thursday',amount:180000},{day:'friday',amount:190000},{day:'saturday',amount:180000},{day:'sunday',amount:0}] },
      { period_id: 49, type: 'weekly', started_in: "2026-03-16T00:00:00Z", ended_at: "2026-03-22T00:00:00Z", total_salary: 1050000, performance_multiplier: 1.0, period_rating: 4.5, status: 'paid', days: [{day:'monday',amount:170000},{day:'tuesday',amount:170000},{day:'wednesday',amount:170000},{day:'thursday',amount:170000},{day:'friday',amount:170000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 48, type: 'weekly', started_in: "2026-03-09T00:00:00Z", ended_at: "2026-03-15T00:00:00Z", total_salary: 1280000, performance_multiplier: 1.2, period_rating: 5.0, status: 'paid', days: [{day:'monday',amount:210000},{day:'tuesday',amount:210000},{day:'wednesday',amount:210000},{day:'thursday',amount:210000},{day:'friday',amount:210000},{day:'saturday',amount:230000},{day:'sunday',amount:0}] },
      { period_id: 47, type: 'weekly', started_in: "2026-03-02T00:00:00Z", ended_at: "2026-03-08T00:00:00Z", total_salary: 980000, performance_multiplier: 1.0, period_rating: 4.2, status: 'paid', days: [{day:'monday',amount:160000},{day:'tuesday',amount:160000},{day:'wednesday',amount:160000},{day:'thursday',amount:160000},{day:'friday',amount:160000},{day:'saturday',amount:180000},{day:'sunday',amount:0}] },
      { period_id: 46, type: 'weekly', started_in: "2026-02-23T00:00:00Z", ended_at: "2026-03-01T00:00:00Z", total_salary: 1150000, performance_multiplier: 1.1, period_rating: 4.7, status: 'paid', days: [{day:'monday',amount:190000},{day:'tuesday',amount:190000},{day:'wednesday',amount:190000},{day:'thursday',amount:190000},{day:'friday',amount:190000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 45, type: 'weekly', started_in: "2026-02-16T00:00:00Z", ended_at: "2026-02-22T00:00:00Z", total_salary: 1020000, performance_multiplier: 1.0, period_rating: 4.4, status: 'paid', days: [{day:'monday',amount:170000},{day:'tuesday',amount:170000},{day:'wednesday',amount:170000},{day:'thursday',amount:170000},{day:'friday',amount:170000},{day:'saturday',amount:170000},{day:'sunday',amount:0}] },
      { period_id: 44, type: 'weekly', started_in: "2026-02-09T00:00:00Z", ended_at: "2026-02-15T00:00:00Z", total_salary: 1400000, performance_multiplier: 1.3, period_rating: 5.0, status: 'paid', days: [{day:'monday',amount:230000},{day:'tuesday',amount:230000},{day:'wednesday',amount:230000},{day:'thursday',amount:230000},{day:'friday',amount:230000},{day:'saturday',amount:250000},{day:'sunday',amount:0}] },
      { period_id: 43, type: 'weekly', started_in: "2026-02-02T00:00:00Z", ended_at: "2026-02-08T00:00:00Z", total_salary: 890000, performance_multiplier: 0.9, period_rating: 3.8, status: 'paid', days: [{day:'monday',amount:140000},{day:'tuesday',amount:140000},{day:'wednesday',amount:140000},{day:'thursday',amount:140000},{day:'friday',amount:140000},{day:'saturday',amount:190000},{day:'sunday',amount:0}] },
      { period_id: 42, type: 'weekly', started_in: "2026-01-26T00:00:00Z", ended_at: "2026-02-01T00:00:00Z", total_salary: 1100000, performance_multiplier: 1.0, period_rating: 4.5, status: 'paid', days: [{day:'monday',amount:180000},{day:'tuesday',amount:180000},{day:'wednesday',amount:180000},{day:'thursday',amount:180000},{day:'friday',amount:180000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 41, type: 'weekly', started_in: "2026-01-19T00:00:00Z", ended_at: "2026-01-25T00:00:00Z", total_salary: 1080000, performance_multiplier: 1.0, period_rating: 4.5, status: 'paid', days: [{day:'monday',amount:180000},{day:'tuesday',amount:180000},{day:'wednesday',amount:180000},{day:'thursday',amount:180000},{day:'friday',amount:180000},{day:'saturday',amount:180000},{day:'sunday',amount:0}] },
      // ... Repeating the pattern for IDs 40 down to 1 ...
      { period_id: 40, type: 'weekly', started_in: "2026-01-12T00:00:00Z", ended_at: "2026-01-18T00:00:00Z", total_salary: 950000, performance_multiplier: 1.0, period_rating: 4.0, status: 'paid', days: [{day:'monday',amount:150000},{day:'tuesday',amount:150000},{day:'wednesday',amount:150000},{day:'thursday',amount:150000},{day:'friday',amount:150000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 39, type: 'weekly', started_in: "2026-01-05T00:00:00Z", ended_at: "2026-01-11T00:00:00Z", total_salary: 1200000, performance_multiplier: 1.1, period_rating: 4.9, status: 'paid', days: [{day:'monday',amount:200000},{day:'tuesday',amount:200000},{day:'wednesday',amount:200000},{day:'thursday',amount:200000},{day:'friday',amount:200000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 38, type: 'weekly', started_in: "2025-12-29T00:00:00Z", ended_at: "2026-01-04T00:00:00Z", total_salary: 800000, performance_multiplier: 1.0, period_rating: 3.5, status: 'paid', days: [{day:'monday',amount:130000},{day:'tuesday',amount:130000},{day:'wednesday',amount:130000},{day:'thursday',amount:130000},{day:'friday',amount:130000},{day:'saturday',amount:150000},{day:'sunday',amount:0}] },
      { period_id: 37, type: 'weekly', started_in: "2025-12-22T00:00:00Z", ended_at: "2025-12-28T00:00:00Z", total_salary: 1350000, performance_multiplier: 1.25, period_rating: 5.0, status: 'paid', days: [{day:'monday',amount:220000},{day:'tuesday',amount:220000},{day:'wednesday',amount:220000},{day:'thursday',amount:220000},{day:'friday',amount:220000},{day:'saturday',amount:250000},{day:'sunday',amount:0}] },
      { period_id: 36, type: 'weekly', started_in: "2025-12-15T00:00:00Z", ended_at: "2025-12-21T00:00:00Z", total_salary: 1100000, performance_multiplier: 1.0, period_rating: 4.5, status: 'paid', days: [{day:'monday',amount:180000},{day:'tuesday',amount:180000},{day:'wednesday',amount:180000},{day:'thursday',amount:180000},{day:'friday',amount:180000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 35, type: 'weekly', started_in: "2025-12-08T00:00:00Z", ended_at: "2025-12-14T00:00:00Z", total_salary: 1050000, performance_multiplier: 1.0, period_rating: 4.3, status: 'paid', days: [{day:'monday',amount:170000},{day:'tuesday',amount:170000},{day:'wednesday',amount:170000},{day:'thursday',amount:170000},{day:'friday',amount:170000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 34, type: 'weekly', started_in: "2025-12-01T00:00:00Z", ended_at: "2025-12-07T00:00:00Z", total_salary: 1180000, performance_multiplier: 1.1, period_rating: 4.8, status: 'paid', days: [{day:'monday',amount:190000},{day:'tuesday',amount:190000},{day:'wednesday',amount:190000},{day:'thursday',amount:190000},{day:'friday',amount:190000},{day:'saturday',amount:230000},{day:'sunday',amount:0}] },
      { period_id: 33, type: 'weekly', started_in: "2025-11-24T00:00:00Z", ended_at: "2025-11-30T00:00:00Z", total_salary: 920000, performance_multiplier: 1.0, period_rating: 3.9, status: 'paid', days: [{day:'monday',amount:150000},{day:'tuesday',amount:150000},{day:'wednesday',amount:150000},{day:'thursday',amount:150000},{day:'friday',amount:150000},{day:'saturday',amount:170000},{day:'sunday',amount:0}] },
      { period_id: 32, type: 'weekly', started_in: "2025-11-17T00:00:00Z", ended_at: "2025-11-23T00:00:00Z", total_salary: 1100000, performance_multiplier: 1.0, period_rating: 4.5, status: 'paid', days: [{day:'monday',amount:180000},{day:'tuesday',amount:180000},{day:'wednesday',amount:180000},{day:'thursday',amount:180000},{day:'friday',amount:180000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      { period_id: 31, type: 'weekly', started_in: "2025-11-10T00:00:00Z", ended_at: "2025-11-16T00:00:00Z", total_salary: 1250000, performance_multiplier: 1.2, period_rating: 4.9, status: 'paid', days: [{day:'monday',amount:200000},{day:'tuesday',amount:200000},{day:'wednesday',amount:200000},{day:'thursday',amount:200000},{day:'friday',amount:200000},{day:'saturday',amount:250000},{day:'sunday',amount:0}] },
      { period_id: 30, type: 'weekly', started_in: "2025-11-03T00:00:00Z", ended_at: "2025-11-09T00:00:00Z", total_salary: 1000000, performance_multiplier: 1.0, period_rating: 4.2, status: 'paid', days: [{day:'monday',amount:160000},{day:'tuesday',amount:160000},{day:'wednesday',amount:160000},{day:'thursday',amount:160000},{day:'friday',amount:160000},{day:'saturday',amount:200000},{day:'sunday',amount:0}] },
      // ... For testing purposes, you can copy/paste more blocks following this pattern ...
      // I've provided 21 unique historical blocks here.
  ].concat(Array.from({length: 29}, (_, i) => ({
      period_id: 29 - i,
      type: 'weekly',
      started_in: `2025-10-${String(Math.max(1, 25 - i)).padStart(2, '0')}T00:00:00Z`,
      ended_at: `2025-10-${String(Math.min(31, 31 - i)).padStart(2, '0')}T00:00:00Z`,
      total_salary: 900000 + (i * 1000),
      performance_multiplier: 1.0,
      period_rating: 4.5,
      status: 'paid',
      days: [{day:'monday',amount:150000},{day:'tuesday',amount:150000},{day:'wednesday',amount:150000},{day:'thursday',amount:150000},{day:'friday',amount:150000},{day:'saturday',amount:150000},{day:'sunday',amount:0}]
  })))
}
};

export async function apiFetch(endpoint) {
  const key = endpoint.includes('company') ? 'company' : endpoint.includes('salary') ? 'salary' : 'me';
  return MOCK[key];
}