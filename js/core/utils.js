/**
 * Core Utilities for The Whispers Game
 */

// Generate random 4-digit PIN for TV room code
export function generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate an anonymous unique ID for Mobile Player tracking
export function generatePlayerId() {
    return 'p_' + Math.random().toString(36).substr(2, 9);
}

// Helper to trigger haptic feedback on Mobile securely
export function triggerHaptic(pattern) {
    // pattern can be duration in ms (100) or array ([100, 50, 100])
    if (navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch(e) {
            console.warn("Haptic unsupported or disabled");
        }
    }
}
