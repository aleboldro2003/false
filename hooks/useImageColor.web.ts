/**
 * useImageColor — Web fallback
 * On web, react-native-image-colors is not supported.
 * Returns the static fallback color.
 */
import { useState } from 'react';

const FALLBACK_COLOR = '#1A1A1A';

export function useImageColor(_imageUrl: string | undefined, _key: string | undefined): string {
    const [color] = useState(FALLBACK_COLOR);
    return color;
}
