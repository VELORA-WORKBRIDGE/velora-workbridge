// Pre-launch audience planning outlines for the three brands, adapted from the
// Cyberklick "product-audience-insight" playbook. Principle: data before fabrication.
// Nothing here is measured data: percentages, budgets and competitor names are left
// as research tasks, and interest keywords are CANDIDATES that still need TikTok validation.

export type Brand = 'velora' | 'vivia' | 'workbridge'

type BrandProfile = {
  name: string
  portal: string
  business_type: 'Online Shopping' | 'Solution & Online Service' | 'Local Store & Service' | 'App'
  industry_category: null | 'HOUSING' | 'EMPLOYMENT'
  positioning: string
  selling_points: string[]
  use_cases: string[]
  interest_tags: string[]
  objective: { campaign_objective: string; optimization_goal: string; why: string }
  audiences: { name: string; description: string; candidate_keywords: string[] }[]
}

const BRANDS: Record<Brand, BrandProfile> = {
  velora: {
    name: 'VELORA',
    portal: 'https://velorabysj.zite.so/',
    business_type: 'Local Store & Service',
    industry_category: null,
    positioning: 'Health, wellbeing, bodywork, spa services and luxury self-care.',
    selling_points: ['Bodywork and spa treatments', 'Luxury self-care experience', 'Online booking through the VELORA portal'],
    use_cases: ['Stress relief and relaxation', 'Recovery bodywork', 'Gifting or special-occasion self-care'],
    interest_tags: ['Spa', 'Massage', 'Wellness', 'Self-care', 'Skincare', 'Yoga', 'Beauty'],
    objective: {
      campaign_objective: 'LEAD_GENERATION',
      optimization_goal: 'Bookings / form submissions',
      why: 'Local service where the conversion is an appointment request on the portal.',
    },
    audiences: [
      { name: 'Self-care seekers', description: 'Adults who actively look for relaxation and spa experiences.', candidate_keywords: ['spa', 'massage', 'self care', 'relaxation'] },
      { name: 'Wellness enthusiasts', description: 'Health-focused audience interested in holistic wellbeing.', candidate_keywords: ['wellness', 'meditation', 'yoga', 'healthy lifestyle'] },
      { name: 'Beauty & skincare', description: 'Audience engaged with skincare and beauty routines.', candidate_keywords: ['skincare', 'facial', 'beauty routine'] },
      { name: 'Active recovery', description: 'Fitness audience who may want recovery bodywork.', candidate_keywords: ['fitness', 'sports recovery', 'deep tissue massage'] },
      { name: 'Gift buyers', description: 'Shoppers looking for experience gifts.', candidate_keywords: ['gift ideas', 'spa gift', 'experience gifts'] },
    ],
  },
  vivia: {
    name: 'VIVIA',
    portal: 'https://viviarentalhomes.zite.so',
    business_type: 'Local Store & Service',
    industry_category: 'HOUSING',
    positioning: 'Rental services, property exploration and housing applications.',
    selling_points: ['Rental listings exploration', 'Guided housing applications', 'Single portal for rental enquiries'],
    use_cases: ['Relocating to a new city', 'Finding a first rental', 'Upgrading or downsizing a home'],
    interest_tags: ['Home rental', 'Apartments', 'Moving', 'Interior design', 'Home decor'],
    objective: {
      campaign_objective: 'LEAD_GENERATION',
      optimization_goal: 'Rental enquiries / applications',
      why: 'The conversion is an enquiry or application on the VIVIA portal.',
    },
    audiences: [
      { name: 'Active renters', description: 'People currently searching for a rental.', candidate_keywords: ['apartment rental', 'homes for rent'] },
      { name: 'Movers & relocators', description: 'People planning a move.', candidate_keywords: ['moving', 'relocation'] },
      { name: 'Home & interior fans', description: 'Audience engaged with home styling content.', candidate_keywords: ['interior design', 'home decor'] },
      { name: 'First-time renters', description: 'Audience starting independent living.', candidate_keywords: ['first apartment', 'apartment tips'] },
      { name: 'Lifestyle upgraders', description: 'Audience interested in better living spaces.', candidate_keywords: ['home makeover', 'apartment tour'] },
    ],
  },
  workbridge: {
    name: 'WORKBRIDGE',
    portal: 'https://workbridge.zite.so',
    business_type: 'Solution & Online Service',
    industry_category: 'EMPLOYMENT',
    positioning: 'Jobs and career opportunities.',
    selling_points: ['Opportunity discovery', 'Career workflow checklists', 'Single portal for applications'],
    use_cases: ['Finding a new job', 'Career change', 'Remote work search'],
    interest_tags: ['Careers', 'Job search', 'Remote work', 'Professional development', 'Resume tips'],
    objective: {
      campaign_objective: 'LEAD_GENERATION',
      optimization_goal: 'Sign-ups / applications',
      why: 'The conversion is a candidate starting an application on the WORKBRIDGE portal.',
    },
    audiences: [
      { name: 'Active job seekers', description: 'People currently searching for work.', candidate_keywords: ['job search', 'job openings'] },
      { name: 'Career changers', description: 'People exploring a new field.', candidate_keywords: ['career change', 'new career'] },
      { name: 'Remote-work seekers', description: 'Audience looking for remote roles.', candidate_keywords: ['remote work', 'work from home'] },
      { name: 'Skill builders', description: 'Audience engaged with upskilling content.', candidate_keywords: ['professional development', 'online courses'] },
      { name: 'Early-career talent', description: 'Graduates and early-career professionals.', candidate_keywords: ['resume tips', 'interview tips'] },
    ],
  },
}

export const BRAND_KEYS = Object.keys(BRANDS) as Brand[]

function compliance(p: BrandProfile) {
  if (!p.industry_category) {
    return { special_ad_category: null, notes: ['No special ad category detected; standard TikTok targeting applies.'] }
  }
  return {
    special_ad_category: p.industry_category,
    notes: [
      `${p.industry_category} is a TikTok special ad category: interest category queries must include special_industries.`,
      'Demographic targeting (age, gender, detailed audiences) is restricted; age/gender splits below are not applicable for US/Canada delivery.',
      'Confirm advertisability and allowlist requirements with the compliance team before launch.',
    ],
  }
}

export function buildPlan(brand: Brand) {
  const p = BRANDS[brand]
  const restricted = p.industry_category !== null
  const research = 'RESEARCH_REQUIRED'
  return {
    brand: p.name,
    portal: p.portal,
    status: 'draft_outline',
    disclaimer:
      'Planning outline only. Figures marked RESEARCH_REQUIRED must come from landing-page and market research; keywords are candidates pending TikTok platform validation (status=EFFECTIVE).',
    sections: [
      {
        key: 'product_positioning',
        title: '1. Product positioning',
        brand_positioning: p.positioning,
        business_type: p.business_type,
        price_range: research,
        core_selling_points: p.selling_points,
        use_cases: p.use_cases,
        compliance: compliance(p),
      },
      {
        key: 'target_persona',
        title: '2. Target user persona & objective',
        age_distribution: restricted ? 'NOT_APPLICABLE_SPECIAL_CATEGORY' : research,
        gender_ratio: restricted ? 'NOT_APPLICABLE_SPECIAL_CATEGORY' : research,
        occupation_distribution: research,
        interest_tags: p.interest_tags,
        recommended_objective: p.objective,
      },
      {
        key: 'competitors_budget',
        title: '3. Competitor analysis & budget',
        competitors: research,
        daily_budget: research,
        method: 'Identify 3-5 direct competitors via web research; derive daily budget from industry CPC/CVR benchmarks.',
      },
      {
        key: 'market_regions',
        title: '4. Market & target regions',
        target_regions: research,
        recommended_platform: 'TikTok',
        method: 'Choose regions from where the portal can actually serve customers; do not target regions without service coverage.',
      },
      {
        key: 'audience_profiles',
        title: '5. Audience profiles',
        validation: 'pending_tiktok_validation',
        profiles: p.audiences.map((a, i) => ({
          rank: i + 1,
          name: a.name,
          description: `${a.description} Candidate keywords require TikTok platform verification.`,
          candidate_keywords: a.candidate_keywords,
          age_range: restricted ? 'NOT_APPLICABLE_SPECIAL_CATEGORY' : research,
          gender_ratio: restricted ? 'NOT_APPLICABLE_SPECIAL_CATEGORY' : research,
        })),
      },
    ],
  }
}
