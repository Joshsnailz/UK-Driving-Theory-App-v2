export type LegalDocumentSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  intro?: string;
  sections: LegalDocumentSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  intro:
    'This Privacy Policy explains how UK Theory Test collects, uses, and stores information when you use the app.',
  sections: [
    {
      title: 'Information we collect',
      paragraphs: [
        'We may collect account information such as your email address, phone number, or sign-in identifiers when you create or use an account.',
        'We store progress data, quiz history, premium entitlement status, and app preferences so your experience can be personalised and synced across devices.',
        'Third-party services used by the app, including Firebase, RevenueCat, Google Sign-In, Apple Sign In, and AdMob, may process technical and diagnostic information needed to provide their services.',
      ],
    },
    {
      title: 'How we use information',
      paragraphs: [
        'We use your information to authenticate you, sync your progress, restore purchases, provide premium features, and improve app reliability.',
        'We may use limited device and usage information to support subscriptions, fraud prevention, analytics, crash diagnosis, and ad delivery where applicable.',
      ],
    },
    {
      title: 'Ads and purchases',
      paragraphs: [
        'If you use the free version, the app may display ads. Advertising partners may use device-level identifiers and permissions allowed by your platform to deliver and measure ads.',
        'Subscription purchases and renewals are processed by Apple App Store or Google Play, with RevenueCat used to manage entitlement status across platforms.',
      ],
    },
    {
      title: 'Data sharing',
      paragraphs: [
        'We do not sell your personal information. Information is shared only with service providers needed to operate the app, such as authentication, cloud storage, subscriptions, and advertising platforms.',
        'These providers process information according to their own terms and privacy policies.',
      ],
    },
    {
      title: 'Data retention',
      paragraphs: [
        'We keep account and progress data for as long as your account remains active or as needed to provide the app experience.',
        'If you remove your account or reset progress, some information may be deleted immediately while certain records may be retained for legal, fraud-prevention, billing, or backup purposes.',
      ],
    },
    {
      title: 'Your choices',
      paragraphs: [
        'You can manage app permissions, sign out, reset progress, and manage or cancel subscriptions through your device settings or store account.',
        'You can also choose not to use account-based features, although some functionality such as sync and purchase restoration may then be limited.',
      ],
    },
    {
      title: 'Children',
      paragraphs: [
        'The app is designed as a study aid and is not intentionally directed at children under the age required by your local law for independent consent to digital services.',
      ],
    },
    {
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. Continued use of the app after changes means the updated policy will apply.',
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  title: 'Terms of Use',
  intro:
    'These Terms of Use govern your use of UK Theory Test. By using the app, you agree to these terms.',
  sections: [
    {
      title: 'Use of the app',
      paragraphs: [
        'UK Theory Test is provided as an independent revision and practice tool for learners preparing for UK driving theory-related study.',
        'You agree to use the app only for lawful purposes and not to misuse, interfere with, or attempt to gain unauthorised access to the app or its services.',
      ],
    },
    {
      title: 'No official affiliation',
      paragraphs: [
        'This app is not affiliated with, endorsed by, or sponsored by the DVSA, the Department for Transport, or GOV.UK.',
        'Practice content is intended to support learning and should not be treated as an official examination product or legal advice.',
      ],
    },
    {
      title: 'Accounts',
      paragraphs: [
        'Some features may require sign-in. You are responsible for the accuracy of the information you provide and for maintaining access to your chosen sign-in method.',
      ],
    },
    {
      title: 'Subscriptions and billing',
      paragraphs: [
        'Premium features may be offered through auto-renewing subscriptions billed by Apple App Store or Google Play.',
        'Subscriptions renew automatically unless cancelled before the renewal date. Pricing, billing, refunds, and cancellation are governed by the rules of the store through which you purchased.',
      ],
    },
    {
      title: 'Content and intellectual property',
      paragraphs: [
        'App design, branding, code, and original content remain the property of the app publisher or its licensors.',
        'Certain public sector information included in the app is used under the Open Government Licence v3.0, with Crown copyright acknowledged where required.',
      ],
    },
    {
      title: 'Availability and changes',
      paragraphs: [
        'We may update, modify, suspend, or remove features at any time, including premium features, account features, or supported integrations.',
        'We do not guarantee uninterrupted availability, error-free performance, or that the app will always match the latest official theory-test materials.',
      ],
    },
    {
      title: 'Disclaimer',
      paragraphs: [
        'The app is provided on an as-is and as-available basis. While we aim to provide a helpful study experience, we make no guarantee that use of the app will result in passing any test or that all information will always be complete, current, or error-free.',
      ],
    },
    {
      title: 'Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the app.',
      ],
    },
    {
      title: 'Changes to these terms',
      paragraphs: [
        'We may update these Terms of Use from time to time. Continued use of the app after changes means the updated terms will apply.',
      ],
    },
  ],
};
