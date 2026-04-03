/**
 * Domain constants for the DVSA car theory test.
 * Source: gov.uk — "Theory test: cars" (OGL v3.0).
 */
export const MOCK_TEST = {
  QUESTION_COUNT: 50,
  PASS_MARK: 43,
  DURATION_SECONDS: 57 * 60,
} as const;

export const HAZARD_TEST = {
  QUESTION_COUNT: 10,
} as const;

/** RevenueCat entitlement identifier that unlocks all premium features. */
export const PREMIUM_ENTITLEMENT_ID = 'premium';

export const LEGAL = {
  OGL_URL:
    'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
  HIGHWAY_CODE_URL: 'https://www.gov.uk/guidance/the-highway-code',
  TRAFFIC_SIGNS_URL: 'https://www.gov.uk/guidance/the-highway-code/traffic-signs',
} as const;
