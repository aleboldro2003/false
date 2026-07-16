import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://fdejuxbijvdzkgaiqucn.supabase.co';

const SUPABASE_ANON_KEY =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_ZIU9vorYhBg8c2YPw-mdtg_OasMMBXg';

// AsyncStorage is only available on native — on web, Supabase falls back to localStorage
const getStorage = () => {
    if (Platform.OS === 'web') {
        return undefined; // Supabase uses localStorage by default on web
    }
    // Lazy require to avoid SSR issues on web
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
