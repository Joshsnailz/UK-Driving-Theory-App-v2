# UK Theory App — Implementation Status & Remaining Work

_Last updated: 2 Apr 2026_

The app is an Expo / React Native (TypeScript, Zustand, React Navigation)
UK driving-theory trainer. This document records what has been
implemented, what is still outstanding, and the order in which the
remaining work should be tackled to reach a store-ready 1.0.

---

## 1. Completed

### Phase 0 — Native build foundation ✅

- `app.json` → `app.config.ts` with `ios.bundleIdentifier` /
  `android.package` = `com.joshsnailz.uktheory`, `usesAppleSignIn`,
  `googleServicesFile` paths, and config plugins for
  `expo-dev-client`, `expo-apple-authentication`,
  `expo-tracking-transparency`, `@react-native-firebase/app|auth`,
  `@react-native-google-signin/google-signin`,
  `expo-build-properties` (`ios.useFrameworks: 'static'`),
  `react-native-google-mobile-ads`.
- `eas.json` (development / preview / production profiles).
- `.env.example`, `.gitignore` updated, `src/config/env.ts` typed
  runtime config, `src/config/constants.ts`.
- Native deps installed: `@react-native-firebase/{app,auth,firestore}`,
  `@react-native-google-signin/google-signin`, `expo-apple-authentication`,
  `expo-tracking-transparency`, `expo-build-properties`, `expo-dev-client`,
  `expo-constants`, `react-native-google-mobile-ads`,
  `react-native-purchases`, `react-native-purchases-ui`.
- npm scripts: `start` (dev-client), `ios`, `android`, `prebuild`,
  `typecheck`, `gen:questions`.

### Phase 1 — Code-quality refactor ✅

- `src/types/index.ts` rewritten: `IoniconName`, `AnyQuestion` union,
  `CategoryStats`, Highway-Code / sign types, full nav param lists.
- All `as any` casts removed (`HomeScreen`, `TopicListScreen`,
  `MockTestScreen`, `HazardScreen`, `ProgressBar`).
- Magic numbers replaced by `MOCK_TEST` / `HAZARD_TEST` constants.
- `buildEmptyCategoryStats()` helper; `progressStore` and
  `MockTestScreen` use it.
- `ProgressBar` uses `DimensionValue`; `FlatList` ref typed.
- `QuestionCard` renders real `<Image>` via `resolveImage()`.
- `AppErrorBoundary`, `RuleChips`, `ScreenHeader`, `usePalette` added.

### Phase 2 — Content layer (OGL v3.0) ✅

- `src/content/highway-code/{sections,rules,annexes}.json` — ~160 rules,
  speed-limit table, stopping distances, documents, maintenance, first
  aid.
- `src/content/signs/signs.json` — ~100 signs across 7 groups.
- `src/content/licence/{OGL-v3.md,ATTRIBUTION.md}`.
- `useHighwayCode()` / `useSigns()` hooks.
- `scripts/generate-questions.ts` (+ `scripts/tsconfig.json`,
  `npm run gen:questions`) — deterministic seeded generator.
- **702 questions** emitted to `src/content/questions/<category>.json`
  + `manifest.json`; `src/content/questions/index.ts` loader.
- `useQuizEngine` / `weightedSelect` repointed; legacy
  `src/data/questions.ts` deleted.

### Phase 3 — Learn tab ✅

- `LearnNavigator` + `LearnTab` in the bottom tabs.
- Screens: `LearnHomeScreen`, `HighwayCodeListScreen` (search + rule
  number lookup), `HighwayCodeSectionScreen` (scroll-to-rule, OGL
  footer), `SignLibraryScreen` (group filter), `SignDetailScreen`.
- `HighwayCodeSection` / `SignDetail` also registered on the root stack
  so `RuleChips` deep-link from quiz/review.

### Phase 4 — Firebase auth + Firestore sync ✅

- `src/services/firebase.ts`, `src/services/auth.ts` (Google / Apple /
  phone, sign-out, delete-account).
- `src/services/progressSync.ts` — pull-merge-push with debounced writes
  and conflict-tolerant `mergeProgress()`.
- `src/store/userStore.ts`; `progressStore.replaceProgress`.
- Screens: `SignInScreen` (Apple button on iOS, Google, phone, “Maybe
  later”), `PhoneAuthScreen` (E.164 + OTP), `AccountScreen` (sign-out,
  delete account & data — App Store 5.1.1(v)).

### Phase 5 — RevenueCat subscriptions ✅

- `src/services/purchases.ts` (configure, login/logout, offerings,
  purchase, restore, `hasPremium`).
- `src/store/entitlementStore.ts` (`isPremium`, `offering`,
  `mockTrialCredits` persisted).
- `src/components/PremiumGate.tsx`, `src/screens/PaywallScreen.tsx`
  (RevenueCat-hosted paywall + ToS/Privacy footer).
- `MockTestLandingScreen` is now the Mock Test tab root and gates the
  real `MockTest` stack screen.

### Phase 6 — Ads (AdMob) ✅

- `src/services/ads.ts` — UMP consent → ATT (iOS) → request config →
  `mobileAds().initialize()`; test IDs in dev.
- `src/components/AdBanner.tsx` mounted on Home + Progress (hidden for
  Premium).
- `src/hooks/useRewardedMockTrial.ts` — rewarded ad grants one mock-test
  credit; wired into `PremiumGate`.

### Phase 7 — Wiring & polish ✅

- `App.tsx`: `GestureHandlerRootView` → `SafeAreaProvider` →
  `AppErrorBoundary`; bootstraps user / entitlements / ads; keeps
  RevenueCat appUserID in sync with Firebase.
- `AppNavigator`: modal group for `SignIn` / `PhoneAuth` / `Account` /
  `Paywall`; `Legal`, `HighwayCodeSection`, `SignDetail` registered.
- `SettingsScreen`: Account, Upgrade/Manage subscription, Restore
  purchases, Legal & Licences, Privacy, Terms — existing toggles
  unchanged.
- `LegalScreen` with full OGL attribution + disclaimer.
- `docs/SETUP.md` — from-scratch account creation through to store
  builds.

### Verification ✅

- `npx tsc --noEmit` passes under `strict` with zero `any`.

---

## 2. Outstanding work

Ordered by how hard they block a store submission.

### A. External configuration (no code, blocks everything)

- [ ] Create the Firebase project; drop `GoogleService-Info.plist` /
      `google-services.json` at the repo root; enable Google / Apple /
      Phone providers; add Android SHA fingerprints; create Firestore
      with the rules in `docs/SETUP.md` §3.
- [ ] Apple Developer: App ID with **Sign in with Apple** + **Push
      Notifications**; App Store Connect record; subscription group
      *Premium* with `premium_monthly` / `premium_annual`; shared secret
      + In-App Purchase `.p8`.
- [ ] Google Play Console: app record; upload one internal-test AAB;
      subscriptions `premium_monthly` / `premium_annual`; service-account
      JSON for RevenueCat.
- [ ] RevenueCat project: App Store + Play Store apps with the
      credentials above; entitlement `premium`; offering `default`;
      paywall template.
- [ ] AdMob: iOS + Android apps; banner + rewarded units; GDPR/UMP
      message published.
- [ ] Host Privacy Policy and Terms; fill `.env`.

### B. Assets (code is ready, content is missing)

- [ ] **Traffic-sign images.** Add ~100 PNG/SVG assets under
      `assets/signs/` (sourced from gov.uk *Know Your Traffic Signs*,
      OGL) and populate `SIGN_IMAGES` in
      `src/content/signs/imageMap.ts`. Until then the sign library,
      sign-detail screen and sign-based questions show a placeholder
      icon.
- [ ] App icon & splash for both platforms.

### C. Native build smoke test

- [ ] `npm run prebuild && npm run ios` and `npm run android` on real
      hardware. The native plugin chain (Firebase static frameworks,
      AdMob, RevenueCat, Google Sign-In) has only been typechecked, not
      compiled. Fix any CocoaPods / Gradle fallout.

### D. Features deferred from the original plan

- [ ] **Hazard-perception video player.** Current implementation is the
      original text-scenario MCQ stub. A DVSA-style module needs:
      `expo-av`/`expo-video` clips, a tap-to-flag overlay, a 0–5 scoring
      window per clip, and a results screen. Clips themselves must be
      sourced/licensed (DVSA clips are **not** OGL).
- [ ] **Question bank to ~750.** Currently 702. Extend
      `src/content/highway-code/rules.json` and/or add templates to
      `scripts/generate-questions.ts`, then re-run `npm run gen:questions`.
- [ ] **Anonymous → provider account linking.** Add
      `linkWithCredential()` paths in `src/services/auth.ts` so a guest
      who later signs in keeps a single Firebase UID. (Local progress
      already merges via `mergeProgress`, so no data loss today — this
      is about server-side identity continuity.)
- [ ] **Per-platform AdMob unit IDs.** Split
      `ADMOB_BANNER_UNIT_ID` / `ADMOB_REWARDED_UNIT_ID` into iOS/Android
      pairs in `.env.example`, `app.config.ts` and `src/config/env.ts`,
      and `Platform.select` in `src/services/ads.ts`.

### E. Testing

- [ ] Add Jest (`jest-expo` preset) and write the two unit tests called
      out in the plan:
      - `CATEGORY_CONFIG` mock weights sum to `MOCK_TEST.QUESTION_COUNT`.
      - `mergeProgress()` — counters max, bookmarks union, history
        de-duped, local `todayDate` wins.
- [ ] Manual end-to-end pass per `docs/SETUP.md` §11.

### F. Polish / known deviations

- [ ] Defer the ATT prompt until after first user interaction (currently
      fires during `initialiseAds()` straight after UMP consent). Apple
      accepts the current behaviour but conversion is better with a
      pre-prompt.
- [ ] Optional splash gate while `userStore.status === 'loading'` so the
      Settings → Account row doesn’t briefly show “Sign in” for an
      already-authed user on cold start.
- [ ] Spot-check 20 random generated questions against the cited Highway
      Code rule on gov.uk and tighten any weak distractors.

---

## 3. Suggested order of attack

1. **A** (accounts) → **C** (first native build). Nothing else is
   testable until a dev client runs.
2. **B** sign images — unblocks the largest visible gap.
3. **E** Jest — cheap, protects the merge logic before real users sync.
4. **D** per-platform ad units + question top-up.
5. **D** hazard-perception video module (largest remaining feature;
   could ship 1.0 without it and keep the gate pointing at the MCQ stub
   labelled “coming soon”).
6. **F** polish, then store submission.
