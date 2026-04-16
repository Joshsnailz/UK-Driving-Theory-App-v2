/**
 * Config plugin: opts the app into Android large-screen / foldable support.
 *
 * From Android 16 (API 36), the OS ignores `android:screenOrientation` and
 * `android:resizeableActivity="false"` on large-screen devices (tablets,
 * foldables). Play Console flags these as compatibility warnings.
 *
 * Setting `android:resizeableActivity="true"` signals that the app handles
 * multi-window / free-form resizing correctly. The `screenOrientation`
 * attribute (set by Expo's `orientation: 'portrait'`) still applies on
 * phones — only large-screen Android 16+ devices override it.
 */
import { ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';
import type { ManifestActivity } from '@expo/config-plugins/build/android/Manifest';

const withAndroidLargeScreenSupport: ConfigPlugin = (config) =>
  withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (!app) return mod;

    const mainActivity: ManifestActivity | undefined = app.activity?.find(
      (a) => a.$['android:name'] === '.MainActivity',
    );

    if (mainActivity) {
      mainActivity.$['android:resizeableActivity'] = 'true';
    }

    return mod;
  });

export default withAndroidLargeScreenSupport;
