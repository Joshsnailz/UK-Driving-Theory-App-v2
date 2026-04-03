# Project setup

This app uses native modules (Firebase, AdMob, RevenueCat, Google/Apple
Sign-In) and therefore **cannot run in Expo Go**. Use a Dev Client built
with EAS or `expo run:*`.

The sections below take you from zero — no accounts at all — to a working
dev build on both platforms and a store-ready production build.

---

## 0. Accounts you will need

| Account | Cost | Used for | Sign up |
| --- | --- | --- | --- |
| Google account | Free | Firebase, AdMob, Play Console all hang off this | <https://accounts.google.com/signup> |
| Apple Developer Program | US $99/yr | iOS code signing, Sign in with Apple, App Store Connect IAP | <https://developer.apple.com/programs/enroll/> |
| Google Play Console | US $25 one-off | Android distribution + Play Billing IAP | <https://play.google.com/console/signup> |
| Firebase | Free (Spark) | Auth + Firestore | <https://console.firebase.google.com> |
| Google AdMob | Free | Banner + rewarded ads | <https://apps.admob.com> |
| RevenueCat | Free up to $2.5k MTR | Cross-platform subscription backend | <https://app.revenuecat.com/signup> |
| Expo / EAS | Free tier | Cloud builds + credentials | <https://expo.dev/signup> |

> Apple Developer enrolment can take 24–48 h to activate. Start it first.

---

## 1. Local prerequisites

- Node 20+, npm 10+
- Xcode 16+ with command-line tools (`xcode-select --install`) — iOS
- Android Studio Ladybug+ with an SDK 34 image and one emulator — Android
- `npm i -g eas-cli` then `eas login`

---

## 2. Environment file

```bash
cp .env.example .env
```

Every value is read by `app.config.ts` at build time and surfaced to JS via
`src/config/env.ts`. They ship inside the binary, so treat them as
*configuration*, not secrets.

| Variable | Where to get it |
| --- | --- |
| `GOOGLE_SERVICES_PLIST` / `GOOGLE_SERVICES_JSON` | Firebase console → Project settings → Your apps (§3) |
| `GOOGLE_WEB_CLIENT_ID` | Firebase → Authentication → Sign-in method → Google → *Web client ID* (§3.4) |
| `REVENUECAT_IOS_KEY` / `REVENUECAT_ANDROID_KEY` | RevenueCat → Project → API keys → *Public app-specific keys* (§7) |
| `ADMOB_IOS_APP_ID` / `ADMOB_ANDROID_APP_ID` | AdMob → Apps → App settings (§8) |
| `ADMOB_BANNER_UNIT_ID` / `ADMOB_REWARDED_UNIT_ID` | AdMob → Ad units (§8) |
| `PRIVACY_URL` / `TERMS_URL` | Your hosted policy pages |

---

## 3. Firebase (Auth + Firestore)

### 3.1 Create the project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. Name it (e.g. *UK Theory*). You can disable Google Analytics.

### 3.2 Register the iOS app

1. Project overview → **Add app** → iOS.
2. **Bundle ID**: `com.joshsnailz.uktheory` (must match `app.config.ts`).
3. Download **`GoogleService-Info.plist`** and save it at the repo root.
   Set `GOOGLE_SERVICES_PLIST=./GoogleService-Info.plist` in `.env`.
4. Skip the “Add Firebase SDK” / “initialisation code” steps — the native
   plugin handles that.

### 3.3 Register the Android app

1. **Add app** → Android. **Package name**: `com.joshsnailz.uktheory`.
2. Leave SHA-1 blank for now (added in §3.5).
3. Download **`google-services.json`** to the repo root and set
   `GOOGLE_SERVICES_JSON=./google-services.json`.

### 3.4 Enable sign-in providers

`Build → Authentication → Get started → Sign-in method`:

- **Google** → Enable. Pick a support email. After saving, expand *Web SDK
  configuration* and copy the **Web client ID** into
  `GOOGLE_WEB_CLIENT_ID`.
- **Apple** → Enable. For native iOS no Services ID / key is required;
  leave the OAuth fields blank.
- **Phone** → Enable. Under *Phone numbers for testing* you can add e.g.
  `+447700900123` → `123456` so dev builds skip real SMS.

### 3.5 Android SHA fingerprints (required for Google Sign-In)

```bash
eas credentials -p android
```

Choose your build profile → *Keystore* → copy the **SHA-1** and **SHA-256**.
In Firebase → Project settings → Your apps → Android → **Add fingerprint**,
paste both. Re-download `google-services.json` afterwards (it now contains
the OAuth client).

### 3.6 Firestore

`Build → Firestore Database → Create database` → *Production mode* →
region `eur3 (europe-west)` (UK users). Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 4. Apple Developer & App Store Connect

### 4.1 Enrol

<https://developer.apple.com/programs/enroll/> — sign in with your Apple ID,
choose *Individual* or *Organisation*, pay the fee, wait for approval.

### 4.2 Create the App ID

`developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → +`

- Type: **App IDs** → **App**.
- Bundle ID: **Explicit** → `com.joshsnailz.uktheory`.
- Capabilities: tick **Sign in with Apple** and **Push Notifications**
  (Firebase phone auth uses silent pushes).

> If you let EAS manage signing it will create this App ID for you on the
> first `eas build -p ios`, but you must still come back here and tick
> *Sign in with Apple* afterwards.

### 4.3 Create the App Store Connect record

<https://appstoreconnect.apple.com> → **Apps → +** → New App.

- Platform iOS, name *UK Theory Test*, primary language *English (UK)*.
- Bundle ID: pick the one created above. SKU: anything unique.

### 4.4 Create the subscription products

`App → Monetisation → Subscriptions`:

1. **Create Subscription Group** → name *Premium*.
2. Inside the group, **Create Subscription** twice:
   - Reference name *Premium Monthly*, **Product ID `premium_monthly`**,
     duration 1 month.
   - Reference name *Premium Annual*, **Product ID `premium_annual`**,
     duration 1 year.
3. For each: set a price, add at least one localisation, and a review
   screenshot/note. Status must reach **Ready to Submit** before sandbox
   purchases work.

### 4.5 Credentials RevenueCat will need

- **App-Specific Shared Secret**: Subscriptions → *App-Specific Shared
  Secret* → Generate → copy.
- **In-App Purchase key (StoreKit 2)**: `Users and Access → Integrations →
  In-App Purchase` → Generate. Download the `.p8`, note the **Key ID** and
  your **Issuer ID**.

### 4.6 Sandbox tester

`Users and Access → Sandbox → Testers → +` — create a throwaway Apple ID
to test purchases on device.

---

## 5. Google Play Console

### 5.1 Create the developer account

<https://play.google.com/console/signup> — pay the $25 fee, complete
identity verification.

### 5.2 Create the app

`All apps → Create app` → name *UK Theory Test*, default language
*English (UK)*, type *App*, *Free*.

### 5.3 Upload a build to unlock IAP

Play will not let you create subscriptions until at least one APK/AAB has
been uploaded.

```bash
eas build -p android --profile preview
```

Download the `.aab` and upload it to **Release → Testing → Internal
testing → Create new release**. You don’t need to roll it out.

### 5.4 Create the subscriptions

`Monetise → Products → Subscriptions → Create subscription`:

- **Product ID `premium_monthly`** → add a *Monthly* base plan, set price.
- **Product ID `premium_annual`** → add a *Yearly* base plan, set price.
- Activate both base plans.

### 5.5 Service account for RevenueCat

1. In **Google Cloud Console** (same project the Play Console is linked
   to): `IAM & Admin → Service accounts → Create` → name
   *revenuecat-play*. No roles needed here.
2. On the new account → **Keys → Add key → JSON** → download.
3. Back in **Play Console → Users and permissions → Invite new user** →
   paste the service-account email. Under *App permissions* add this app;
   under *Account permissions* grant **View financial data** and **Manage
   orders and subscriptions**. Save. (Allow ~24 h for propagation.)

### 5.6 Licence testers

`Play Console → Settings → Licence testing` → add the Google accounts that
should get test purchases instead of real charges.

---

## 6. Sign in with Apple — Firebase side

Already enabled in §3.4. Because the app uses the **native** Apple
credential (via `expo-apple-authentication`) and exchanges it with
Firebase on-device, you do **not** need a Services ID, return URL or
private key in the Firebase Apple provider settings.

---

## 7. RevenueCat

### 7.1 Account & project

1. Sign up at <https://app.revenuecat.com/signup>.
2. **Create project** → name *UK Theory*.

### 7.2 Add the App Store app

`Project → Apps → + → App Store`:

- Bundle ID `com.joshsnailz.uktheory`.
- **App-Specific Shared Secret**: paste from §4.5.
- **In-App Purchase key**: upload the `.p8`, enter Key ID + Issuer ID.
- Save. Copy the **Public SDK key** shown for this app into
  `REVENUECAT_IOS_KEY`.

### 7.3 Add the Play Store app

`Apps → + → Play Store`:

- Package `com.joshsnailz.uktheory`.
- **Service Account Credentials JSON**: upload the file from §5.5.
- Save. Copy the **Public SDK key** into `REVENUECAT_ANDROID_KEY`.

### 7.4 Products, entitlement, offering

1. `Products → + New` → import `premium_monthly` and `premium_annual` for
   each store (RevenueCat will auto-detect them once the store credentials
   are valid).
2. `Entitlements → + New` → identifier **`premium`** (must match
   `PREMIUM_ENTITLEMENT_ID` in `src/config/constants.ts`). Attach both
   products.
3. `Offerings → + New` → identifier `default`. Add two packages:
   *Monthly* → `premium_monthly`, *Annual* → `premium_annual`. Mark it
   **Current**.
4. `Paywalls → + New` → attach to the `default` offering, pick a template,
   fill in copy/colours. The app renders this via
   `react-native-purchases-ui` so no client release is needed to iterate.

---

## 8. Google AdMob

### 8.1 Account

1. Go to <https://apps.admob.com> and sign in with the same Google account
   used for Play Console.
2. Complete the AdSense onboarding (country, time zone, payment address).
   Ad serving is limited until identity/address verification completes,
   but **test ads work immediately**.

### 8.2 Register the apps

`Apps → Add app` → do this twice:

- **iOS** → *No, the app isn’t listed yet* → name *UK Theory iOS*.
- **Android** → likewise.

Each app gets an **App ID** of the form `ca-app-pub-XXXXXXXXXXXXXXXX~NNNNNNNNNN`.
Put these in `ADMOB_IOS_APP_ID` / `ADMOB_ANDROID_APP_ID`.

### 8.3 Create ad units

For **each** app, `Ad units → Add ad unit`:

- **Banner** → name *Home banner* → copy the unit ID into
  `ADMOB_BANNER_UNIT_ID` (use the ID for the platform you’re building; in
  dev the code falls back to Google’s test units automatically).
- **Rewarded** → name *Mock test trial* → copy into
  `ADMOB_REWARDED_UNIT_ID`.

### 8.4 Consent (UMP)

`Privacy & messaging → European regulations → Create message` → choose
*GDPR* → target both apps → publish. The app calls
`AdsConsent.requestInfoUpdate()` on launch and will surface this form to
EEA/UK users automatically.

### 8.5 (Optional) link to Firebase

`AdMob → Apps → [app] → App settings → Link to Firebase` improves
reporting; not required for ads to serve.

---

## 9. Expo / EAS

```bash
eas login
eas init                 # links the local project to your Expo account
eas secret:push --env-file .env
```

Signing credentials are managed by EAS on first build; accept the prompts.

---

## 10. Build & run

```bash
npm install
npm run gen:questions      # regenerate the question bank if content changed
npm run prebuild           # one-time native project generation
npm run ios                # build & launch in the iOS Simulator
npm run android            # build & install on an Android emulator/device
```

`npm run ios` and `npm run android` are independent — run whichever
platform you’re testing. Both require `npm run prebuild` to have been run
once after any change to native config (`app.config.ts`, new native
dependency, new `.env` value consumed by a config plugin).

For store / CI builds:

```bash
eas build -p ios --profile production
eas build -p android --profile production
```

---

## 11. Verifying a build

- **Guest mode**: practice quiz works; banner ad shows on Home/Progress.
- **Mock test tab** shows the Premium gate; watching a rewarded ad grants
  one free attempt.
- **Sign in** with each provider; confirm a `users/{uid}` document appears
  in Firestore and updates after a quiz.
- **Sandbox-purchase Premium** (sandbox tester on iOS / licence tester on
  Android): ads disappear, mock test and hazard unlock, RevenueCat
  dashboard shows the transaction.
- **Settings → Restore purchases** works after reinstall.
- **Settings → Account → Delete account** removes the Firestore doc and
  the Firebase user.
