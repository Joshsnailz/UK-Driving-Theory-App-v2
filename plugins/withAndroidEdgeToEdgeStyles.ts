/**
 * Config plugin: removes Android style attributes that are deprecated in
 * Android 15 (API 35) when edge-to-edge is enforced.
 *
 * `android:statusBarColor` and `android:navigationBarColor` are ignored
 * (and flagged as deprecated) by the Play Console when targeting API 35+
 * with edge-to-edge enabled. Status/nav bar colours should be controlled
 * at runtime via WindowInsetsController instead.
 *
 * `android:enforceNavigationBarContrast` is also deprecated; setting it to
 * false avoids the semi-transparent scrim Android used to draw over the
 * nav bar in older versions.
 */
import { ConfigPlugin, withAndroidStyles } from '@expo/config-plugins';

type StyleItem = {
  $: { name: string; [key: string]: string };
  _?: string;
};

type StyleEntry = {
  $: { name: string; parent?: string };
  item?: StyleItem[];
};

const DEPRECATED_ATTRS = new Set([
  'android:statusBarColor',
  'android:navigationBarColor',
]);

const withAndroidEdgeToEdgeStyles: ConfigPlugin = (config) =>
  withAndroidStyles(config, (mod) => {
    const styles: StyleEntry[] = mod.modResults.resources.style ?? [];

    for (const style of styles) {
      if (!style.item) continue;

      // Remove deprecated window colour attributes
      style.item = style.item.filter(
        (item) => !DEPRECATED_ATTRS.has(item.$.name),
      );

      // Turn off nav-bar contrast enforcement (deprecated in API 35)
      const contrastItem = style.item.find(
        (item) => item.$.name === 'android:enforceNavigationBarContrast',
      );
      if (contrastItem) {
        contrastItem._ = 'false';
      }
    }

    return mod;
  });

export default withAndroidEdgeToEdgeStyles;
