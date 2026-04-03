import type { ImageSourcePropType } from 'react-native';

/**
 * Maps sign image keys (used in `signs.json` and `Question.imageUri`) to
 * bundled assets. Metro requires static `require` calls, so this map must be
 * maintained by hand whenever a sign image is added to `assets/signs/`.
 *
 * Until artwork is added the map is empty; callers fall back to a placeholder.
 */
export const SIGN_IMAGES: Record<string, ImageSourcePropType> = {
  // 'sign-give-way': require('../../../assets/signs/give-way.png'),
};

/**
 * Resolve a question/sign image reference to an `Image` source.
 * Accepts bundled keys (looked up in {@link SIGN_IMAGES}) or remote URLs.
 */
export function resolveImage(ref: string | undefined): ImageSourcePropType | undefined {
  if (!ref) return undefined;
  if (ref in SIGN_IMAGES) return SIGN_IMAGES[ref];
  if (/^https?:\/\//.test(ref)) return { uri: ref };
  return undefined;
}
