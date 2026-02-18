import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { tabState } from './tabState';

export default function CreateTab() {
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            // 1. Open the modal
            router.push('/create-post');

            // 2. Switch the underlying tab back to the previous one (e.g. podcasts or index).
            // We use a small timeout to ensure the modal push creates the history entry 
            // before we switch the tab underneath.
            setTimeout(() => {
                const target = tabState.lastActive === 'create' ? 'index' : tabState.lastActive;
                // Safely navigate to the previous tab
                router.navigate(target as any);
            }, 100);
        }, [router])
    );

    return null;
}
