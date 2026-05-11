/**
 * Audio Engine — Pengelola Suara & Musik Atmosfer
 * Menggunakan Howler.js (dimuat via CDN di tv.html)
 * Bertugas memainkan ambient drone yang berubah berdasarkan mood scene.
 */

// Daftar sumber suara ambient berdasarkan mood
// Menggunakan suara gratis dari CDN publik sebagai placeholder demo
const AMBIENT_SOURCES = {
    calm: 'assets/audio/bgm/calm.mp3',
    uneasy: 'assets/audio/bgm/uneasy.mp3',
    tense: 'assets/audio/bgm/tense.mp3',
    panic: 'assets/audio/bgm/panic.mp3',
    corrupted: 'assets/audio/bgm/corrupted.mp3'
};

let currentAmbient = null;  // Referensi ke Howl yang sedang aktif
let currentMood = null;     // Mood terakhir yang dimainkan

/**
 * Menginisiasi atau mengganti ambient berdasarkan mood adegan
 * @param {string} mood - Mood scene saat ini (calm/uneasy/tense/panic/corrupted)
 */
export function playAmbient(mood) {
    // Jika mood sama dengan yang sedang diputar, tidak perlu ganti
    if (mood === currentMood && currentAmbient && currentAmbient.playing()) return;

    // Hentikan ambient sebelumnya dengan fade out
    if (currentAmbient) {
        currentAmbient.fade(currentAmbient.volume(), 0, 1500);
        const oldAmbient = currentAmbient;
        setTimeout(() => { oldAmbient.stop(); }, 1600);
    }

    // Tentukan volume berdasarkan intensitas mood
    let volume = 0.15;
    if (mood === 'tense') volume = 0.2;
    if (mood === 'panic') volume = 0.3;
    if (mood === 'corrupted') volume = 0.25;

    const src = AMBIENT_SOURCES[mood] || AMBIENT_SOURCES.calm;

    // Buat instance Howl baru dan mainkan
    try {
        currentAmbient = new Howl({
            src: [src],
            loop: true,
            volume: 0,
            html5: true  // Streaming agar tidak perlu download penuh dulu
        });

        currentAmbient.play();
        currentAmbient.fade(0, volume, 2000); // Fade in selama 2 detik
        currentMood = mood;

        console.log(`[Audio Engine] Ambient berubah ke mood: ${mood}`);
    } catch (e) {
        console.warn("[Audio Engine] Gagal memuat ambient:", e);
    }
}

/**
 * Menghentikan semua audio ambient
 */
export function stopAllAudio() {
    if (currentAmbient) {
        currentAmbient.fade(currentAmbient.volume(), 0, 1000);
        setTimeout(() => { 
            if (currentAmbient) currentAmbient.stop(); 
        }, 1100);
    }
    currentMood = null;
}

const SFX_SOURCES = {
    radio_static: 'assets/audio/sfx/radio.mp3',
    door_creak: 'assets/audio/sfx/door.mp3',
    heartbeat:'assets/audio/sfx/heartbeat.mp3',
    scream: 'assets/audio/sfx/scream.mp3',
};

/**
 * Memainkan efek suara sekali putar (one-shot)
 * @param {string} sfxName - Nama sfx sesuai daftar SFX_SOURCES
 */
export function playSFX(sfxName) {
    if (!sfxName || !SFX_SOURCES[sfxName]) return;
    
    try {
        const sfx = new Howl({
            src: [SFX_SOURCES[sfxName]],
            volume: 0.6,
            html5: false
        });
        sfx.play();
        console.log(`[Audio Engine] SFX dimainkan: ${sfxName}`);
    } catch (e) {
        console.warn("[Audio Engine] Gagal memutar SFX:", e);
    }
}
