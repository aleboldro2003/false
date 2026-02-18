import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://jaaoscjzhphieptxftur.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eEyZaQ9Mxb2jyS8jRnqupA_97ixSCK7';

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
