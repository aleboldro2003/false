/**
 * useImageColor — Universal safe implementation
 *
 * react-native-image-colors requires a native module ("ImageColors") that is
 * NOT available in Expo Go — it needs a custom dev build (expo prebuild).
 *
 * This hook returns a dark fallback color so the app runs in Expo Go without
 * crashing. Once you run `npx expo prebuild` + a native build, swap the
 * import below to enable real color extraction.
 *
 * ──────────────────────────────────────────────
 * TO ENABLE REAL COLOR EXTRACTION (dev build only):
 *
 *   1. npx expo prebuild
 *   2. Uncomment the "REAL IMPLEMENTATION" block below
 *   3. Comment out the "FALLBACK IMPLEMENTATION" block
 *   4. Rebuild the native app
 * ──────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';

const FALLBACK_COLOR = '#1A1A1A';

// ────── FALLBACK IMPLEMENTATION (Expo Go safe) ──────
export function useImageColor(imageUrl: string | undefined, _key: string | undefined): string {
    const [color] = useState(FALLBACK_COLOR);
    return color;
}

// ────── REAL IMPLEMENTATION (dev build only — uncomment when ready) ──────
// import { Platform } from 'react-native';
// import ImageColors from 'react-native-image-colors';
//
// export function useImageColor(imageUrl: string | undefined, key: string | undefined): string {
//     const [color, setColor] = useState(FALLBACK_COLOR);
//
//     useEffect(() => {
//         if (!imageUrl) { setColor(FALLBACK_COLOR); return; }
//         let cancelled = false;
//
//         (async () => {
//             try {
//                 const result = await ImageColors.getColors(imageUrl, {
//                     fallback: FALLBACK_COLOR, cache: true, key: key || imageUrl,
//                 });
//                 if (cancelled) return;
//                 if (Platform.OS === 'android') {
//                     setColor(result.vibrant || result.dominant || FALLBACK_COLOR);
//                 } else if (Platform.OS === 'ios') {
//                     setColor(result.background || result.primary || FALLBACK_COLOR);
//                 }
//             } catch { if (!cancelled) setColor(FALLBACK_COLOR); }
//         })();
//
//         return () => { cancelled = true; };
//     }, [imageUrl, key]);
//
//     return color;
// }
