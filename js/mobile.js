/**
 * mobile.js — Logika Utama Layar Mobile (Controller)
 * Mengelola: Join Room, Voting/Pilihan, Timer,
 * Haptic Feedback, Mood Sync, Status Sinkronisasi dengan TV.
 */

import { db, ref, set, onValue, get } from './core/firebase.js';
import { generatePlayerId, triggerHaptic } from './core/utils.js';

// ---- REFERENSI ELEMEN DOM ----
const DOM = {
    overlay: document.getElementById('tapToStartOverlay'),
    joinScreen: document.getElementById('joinScreen'),
    controllerScreen: document.getElementById('controllerScreen'),
    pinInput: document.getElementById('pinInput'),
    joinBtn: document.getElementById('joinRoomBtn'),
    statusText: document.getElementById('statusText'),
    timerBar: document.getElementById('timerBar'),
    choicesContainer: document.getElementById('choicesContainer'),
    moodOverlay: document.getElementById('moodOverlay')  // #7: overlay suasana
};

// ---- VARIABEL STATE ----
let currentPin = "";
let timerInterval = null;
let currentMood = 'calm';  // Suasana aktif saat ini

// Ambil atau buat ID pemain unik (disimpan di browser agar bisa reconnect)
let playerId = localStorage.getItem('whisper_player_id');
if (!playerId) {
    playerId = generatePlayerId();
    localStorage.setItem('whisper_player_id', playerId);
}

// ======================================================
// 1. BYPASS AUDIO & HAPTIC (Klik pertama membuka akses)
// ======================================================
DOM.overlay.addEventListener('click', () => {
    DOM.overlay.style.display = 'none';
    DOM.joinScreen.style.display = 'block';

    // Otomatis join jika PIN dikirim lewat QR Code (parameter URL)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('pin')) {
        const pinFromUrl = urlParams.get('pin');
        DOM.pinInput.value = pinFromUrl;
        joinRoom(pinFromUrl);
    }
});

// ======================================================
// 2. JOIN ROOM (Manual PIN)
// ======================================================
DOM.joinBtn.addEventListener('click', () => {
    const pin = DOM.pinInput.value.trim();
    if (pin.length === 4) {
        joinRoom(pin);
    } else {
        alert("Masukkan 4 digit PIN");
    }
});

/**
 * Bergabung ke room yang ada di Firebase
 * @param {string} pin - 4 digit PIN room
 */
async function joinRoom(pin) {
    DOM.joinBtn.innerText = "MENGHUBUNGKAN...";

    const roomRef = ref(db, `rooms/${pin}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
        currentPin = pin;

        // Daftarkan pemain ini ke Firebase
        const playerRef = ref(db, `rooms/${pin}/players/${playerId}`);
        await set(playerRef, {
            joinedAt: Date.now(),
            status: 'ready'
        });

        triggerHaptic(200); // Getaran konfirmasi koneksi berhasil!

        // Pindah ke layar controller
        DOM.joinScreen.style.display = 'none';
        DOM.controllerScreen.style.display = 'flex';

        // Mulai mendengarkan status permainan dari TV
        listenGameStatus(pin);

    } else {
        alert("Room tidak ditemukan atau PIN salah!");
        DOM.joinBtn.innerText = "GABUNG";
    }
}

// ======================================================
// 3. PANTAU STATUS PERMAINAN DARI TV
// ======================================================
function listenGameStatus(pin) {
    const statusRef = ref(db, `rooms/${pin}/status`);
    onValue(statusRef, (snap) => {
        if (!snap.exists()) return;
        const status = snap.val();

        if (status === 'playing') {
            DOM.statusText.innerText = "TERHUBUNG — PERHATIKAN TV";
            DOM.statusText.style.color = "#555";
            triggerHaptic([100, 100, 200]); // Getaran heartbeat!

            // Mulai menangkap perintah UI dari TV
            listenMobilePayload(pin);
        }

        if (status === 'ended') {
            showEndState();
        }
    });
}

// ======================================================
// 4. TERIMA PAYLOAD UI DARI TV
// ======================================================
function listenMobilePayload(pin) {
    const viewRef = ref(db, `rooms/${pin}/state/mobileView`);
    onValue(viewRef, (snap) => {
        if (!snap.exists()) return;
        const payload = snap.val();

        // Bersihkan timer sebelumnya
        clearInterval(timerInterval);

        // #7: Sinkronisasi suasana (mood) dari TV ke Mobile
        if (payload.mood && payload.mood !== currentMood) {
            changeMood(payload.mood);
        }

        // Tentukan aksi berdasarkan status yang dikirim TV
        switch (payload.status) {
            case 'typing':
                showWaitingState("PERHATIKAN TV...");
                break;
            case 'choosing':
                renderChoices(payload);
                break;
            case 'narration':
                showWaitingState("MENDENGARKAN...");
                break;
            case 'transitioning':
                showWaitingState("...");
                break;
            case 'ended':
                showEndState();
                break;
            default:
                break;
        }
    });
}

// ======================================================
// 5. RENDER PILIHAN RESPON (Choice Bubbles)
// ======================================================
function renderChoices(payload) {
    DOM.statusText.innerText = "PILIH RESPONMU:";
    DOM.statusText.style.color = "#ccc";
    DOM.choicesContainer.innerHTML = '';

    if (!payload.choices || payload.choices.length === 0) {
        showWaitingState("MENDENGARKAN...");
        return;
    }

    // Buat tombol pilihan untuk setiap opsi
    payload.choices.forEach((choice, idx) => {
        const btn = document.createElement('div');
        btn.className = 'choice-bubble';

        // Terapkan mood ke bubble
        if (currentMood === 'panic') btn.classList.add('mood-panic');
        if (currentMood === 'corrupted') btn.classList.add('mood-corrupted');

        btn.innerText = choice.text;

        btn.onclick = () => {
            triggerHaptic(50); // Getaran ringan saat pilih

            // #5: Kirim vote dengan timestamp agar bisa tiebreak
            set(ref(db, `rooms/${currentPin}/votes/${playerId}`), {
                choiceIndex: idx,
                nextScene: choice.next || null,
                timestamp: Date.now()  // Timestamp untuk tiebreak
            });

            // Tampilkan status menunggu
            DOM.choicesContainer.innerHTML = '';
            showWaitingState("MENUNGGU PEMAIN LAIN...");

            // Hentikan timer
            clearInterval(timerInterval);
            DOM.timerBar.className = 'timer-ring';
            DOM.timerBar.style.width = '0%';
        };

        DOM.choicesContainer.appendChild(btn);
    });

    // Jalankan timer visual
    if (payload.timer && payload.timer > 0) {
        startTimer(payload.timer);
    }
}

// ======================================================
// 6. TIMER VISUAL (Garis Batas Waktu)
// ======================================================
function startTimer(duration) {
    DOM.timerBar.style.width = '100%';
    DOM.timerBar.className = 'timer-ring running';

    let timeLeft = duration;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft -= 100;
        const percentage = (timeLeft / duration) * 100;
        DOM.timerBar.style.width = percentage + '%';

        // Peringatan: sisa waktu 25% — garis merah dan getaran
        if (percentage <= 25 && !DOM.timerBar.classList.contains('red')) {
            DOM.timerBar.classList.add('red');
            triggerHaptic(100);
        }

        // Waktu habis!
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            DOM.choicesContainer.innerHTML = '';
            showWaitingState("WAKTU HABIS");
            DOM.statusText.style.color = "#ff3333";
            DOM.timerBar.style.width = '0%';

            triggerHaptic([200, 100, 200]); // Getaran peringatan kuat

            // Kirim vote "diam" (-1) ke TV, tetap dengan timestamp
            set(ref(db, `rooms/${currentPin}/votes/${playerId}`), {
                choiceIndex: -1,
                nextScene: null,
                timestamp: Date.now()
            });
        }
    }, 100);
}

// ======================================================
// 7. MOOD SYNC (#7: Ubah suasana HP sesuai TV)
// ======================================================
function changeMood(mood) {
    currentMood = mood;

    // Hapus semua kelas mood lama dari body
    document.body.classList.remove('mood-calm', 'mood-uneasy', 'mood-tense', 'mood-panic', 'mood-corrupted');
    document.body.classList.add(`mood-${mood}`);

    // Overlay efek per mood
    if (DOM.moodOverlay) {
        DOM.moodOverlay.className = 'mood-bg-overlay';
        DOM.moodOverlay.classList.add(`mood-bg-${mood}`);
    }

    // Getaran sesuai intensitas mood
    switch (mood) {
        case 'uneasy':
            triggerHaptic(30);
            break;
        case 'tense':
            triggerHaptic([50, 50, 50]);
            break;
        case 'panic':
            triggerHaptic([100, 50, 100, 50, 200]);
            break;
        case 'corrupted':
            triggerHaptic([200, 100, 300]);
            break;
        default:
            break;
    }
}

// ======================================================
// 8. STATUS DISPLAY HELPERS
// ======================================================

/**
 * Tampilkan teks menunggu berkedip
 */
function showWaitingState(message) {
    DOM.statusText.innerText = message;
    DOM.statusText.style.color = "#555";
    DOM.choicesContainer.innerHTML = '';
    DOM.timerBar.className = 'timer-ring';
    DOM.timerBar.style.width = '0%';
}

/**
 * Tampilkan status game berakhir
 */
function showEndState() {
    clearInterval(timerInterval);
    changeMood('corrupted');
    DOM.statusText.innerText = "PERMAINAN BERAKHIR";
    DOM.statusText.style.color = "#ff3333";
    DOM.choicesContainer.innerHTML = `
        <p style="color:#444;font-size:0.85rem;letter-spacing:3px;margin-top:20px;text-align:center;">
            — THE WHISPERS —
        </p>
        <div style="margin-top:30px;display:flex;flex-direction:column;gap:12px;width:100%;">
            <button id="mobileNewPinBtn" style="background:transparent;border:1px solid #ff4444;color:#ff4444;padding:14px;font-family:var(--font-horror);font-size:1rem;letter-spacing:3px;cursor:pointer;">MASUKKAN PIN BARU</button>
            <button id="mobileReloadBtn" style="background:transparent;border:1px solid #555;color:#888;padding:14px;font-family:var(--font-horror);font-size:1rem;letter-spacing:3px;cursor:pointer;">MULAI ULANG</button>
        </div>
    `;
    DOM.timerBar.style.width = '0%';
    triggerHaptic([300, 200, 300]);

    // Tombol: Masukkan PIN baru → kembali ke layar join
    document.getElementById('mobileNewPinBtn')?.addEventListener('click', () => {
        DOM.controllerScreen.style.display = 'none';
        DOM.joinScreen.style.display = 'block';
        DOM.pinInput.value = '';
        document.body.classList.remove('mood-calm', 'mood-uneasy', 'mood-tense', 'mood-panic', 'mood-corrupted');
    });

    // Tombol: Reload halaman sepenuhnya
    document.getElementById('mobileReloadBtn')?.addEventListener('click', () => {
        window.location.reload();
    });
}
