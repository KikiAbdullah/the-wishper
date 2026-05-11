/**
 * tv.js — Logika Utama Layar TV (Host)
 * Mengelola: Menu Utama, Save/Load, Lobby, QR/PIN,
 * Chapter Loading, Scene Rendering, Voting (Fastest-Win Tiebreak),
 * Vote Tracker Display, Disconnect Handling, Pacing, Ending.
 */

import { db, ref, set, onValue, get, remove } from './core/firebase.js';
import { generatePin } from './core/utils.js';
import { loadChapter, getStartSceneId, getSceneData, getCurrentChapterId } from './engine/story.js';
import { UIEngine } from './engine/ui.js';
import { playAmbient, stopAllAudio } from './engine/audio.js';

// ---- DAFTAR SEMUA ENDING (untuk Galeri) ----
const ALL_ENDINGS = [
    { title: "TERKUBUR DALAM SENYAP", desc: "Kesunyian menelanmu di pantai." },
    { title: "YANG MELARIKAN DIRI", desc: "Lari tak pernah cukup untuk lepas." },
    { title: "YANG MENGABAIKAN", desc: "Radio mati, tapi suara tetap ada." },
    { title: "YANG DITINGGALKAN", desc: "Meninggalkan Luna sendirian." },
    { title: "FREKUENSI TERLARANG", desc: "Entitas menemukanmu di 96.6." },
    { title: "LINGKARAN TANPA AKHIR", desc: "Tersesat dalam loop waktu." },
    { title: "PARANOIA TOTAL", desc: "Ketidakpercayaan menghancurkanmu." },
    { title: "YANG MEMBATU", desc: "Entitas mengklaim tempatmu." },
    { title: "TERSESAT DALAM KABUT", desc: "Mundur dari pintu mercusuar." },
    { title: "TIPUAN SEMPURNA", desc: "Luna bukan manusia." },
    { title: "MEMBATU", desc: "Menjadi bagian dari mercusuar." },
    { title: "TERKUNCI DI DALAM", desc: "Mercusuar menjadi penjaramu." },
    { title: "PEMBEBASAN ENTITAS", desc: "Membebaskan 96.6 ke dunia luar." },
    { title: "TERJEBAK DI ANTARA", desc: "Ragu di pintu bunker." },
    { title: "KUBUR DI BUNKER", desc: "Terjebak di ruang arsip." },
    { title: "PENYERAHAN DIRI", desc: "Berhenti melawan di bunker." },
    { title: "LUNA TIDAK PERNAH ADA", desc: "Mengetahui kebenaran di dalam file." },
    { title: "TERLALU LAMBAT", desc: "Entitas mengambil alih pemancar." },
    { title: "SUARA YANG MENIPU", desc: "Terbujuk tawaran entitas." },
    { title: "CINTA YANG PALSU", desc: "Memilih Luna di atas keselamatan." },
    { title: "LEDAKAN FREKUENSI", desc: "Pemancar meledak musnah." },
    { title: "PENGORBANAN SUNYI", desc: "Sendirian namun selamat." },
    { title: "MENYERAH", desc: "Blackwater menelanmu perlahan." },
    { title: "PENYANGKALAN", desc: "Menolak bukti rekaman Harlan." },
    { title: "LOOP ABADI", desc: "Terjebak dalam simulasi kontrol." },
    { title: "TERLALU BANYAK TAHU", desc: "Dihapus dari sistem." },
    { title: "PENGHANCURAN TOTAL", desc: "Blackwater lenyap dari peta." },
    { title: "ENTITAS DIBEBASKAN", desc: "Bisikan di setiap frekuensi dunia." },
    { title: "PENJAGA BARU", desc: "Menjadi penghuni tetap frekuensi." },
    { title: "MELARIKAN DIRI", desc: "Lolos... tapi bisikan tetap ada." },
    { title: "HILANG DALAM SENYAP", desc: "Identitasmu diambil alih." },
    { title: "KEMATIAN OLEH KETIDAKPEDULIAN", desc: "Kamu tidak memilih, dan keheningan membunuhmu." }
];

// ---- REFERENSI ELEMEN DOM ----
const DOM = {
    overlay: document.getElementById('tapToStartOverlay'),
    tvContainer: document.getElementById('tvContainer'),
    menuScreen: document.getElementById('menuScreen'),
    lobbyScreen: document.getElementById('lobbyScreen'),
    qrcode: document.getElementById('qrcode'),
    pinDisplay: document.getElementById('roomPinDisplay'),
    connectedPlayers: document.getElementById('connectedPlayers'),
    startBtn: document.getElementById('startGameBtn'),
    gameScreen: document.getElementById('gameScreen'),
    sceneFade: document.getElementById('sceneFade'),
    newGameBtn: document.getElementById('newGameBtn'),
    continueGameBtn: document.getElementById('continueGameBtn'),
    resetGameBtn: document.getElementById('resetGameBtn'),
    saveInfo: document.getElementById('saveInfo'),
    galleryCounter: document.getElementById('galleryCounter'),
    hudChapter: document.getElementById('hudChapter'),
    hudPin: document.getElementById('hudPin'),
    galleryBtn: document.getElementById('galleryBtn'),
    galleryOverlay: document.getElementById('galleryOverlay'),
    galleryContent: document.getElementById('galleryContent'),
    galleryProgress: document.getElementById('galleryProgress'),
    closeGalleryBtn: document.getElementById('closeGalleryBtn'),
    voteTracker: document.getElementById('voteTrackerPanel'),
    pauseScreen: document.getElementById('pauseScreen'),
    pausePinDisplay: document.getElementById('pausePinDisplay')
};

// ---- VARIABEL STATE ----
let roomPin = "";
let uiEngine;
let roomPlayerCount = 0;
let uiTimerTimeout = null;
let unsubscribeVotes = null;
let unsubscribePlayers = null;  // Listener pemain (untuk deteksi disconnect)
let currentChapter = 1;
let isContinuing = false;
let isGamePaused = false;       // Flag: game paused karena 0 pemain
let pendingSceneId = null;      // Scene yang tertunda saat paused
const SCENE_TRANSITION_DELAY = 3000;
const ENDING_DELAY = 5000;

// ======================================================
// 1. BYPASS AUDIO AUTOPLAY
// ======================================================
DOM.overlay.addEventListener('click', () => {
    DOM.overlay.style.display = 'none';
    DOM.tvContainer.style.display = 'block';
    showMainMenu();
});

// ======================================================
// 2. MENU UTAMA (New Game / Continue / Reset / Gallery)
// ======================================================
function showMainMenu() {
    DOM.menuScreen.style.display = 'block';
    DOM.lobbyScreen.style.display = 'none';
    DOM.gameScreen.style.display = 'none';
    DOM.pauseScreen.style.display = 'none';
    DOM.hudPin.style.display = 'none';

    // Cek save yang tersimpan
    const savedPin = localStorage.getItem('whisper_host_pin');
    const savedChapter = localStorage.getItem('whisper_chapter');
    if (savedPin && savedChapter) {
        DOM.continueGameBtn.style.display = 'block';
        DOM.saveInfo.innerText = `SAVE: PIN ${savedPin} · BAB ${savedChapter}`;
    } else {
        DOM.continueGameBtn.style.display = 'none';
        DOM.saveInfo.innerText = '';
    }

    // Tampilkan progress ending di menu
    const foundEndings = JSON.parse(localStorage.getItem('whisper_found_endings') || "[]");
    DOM.galleryCounter.innerText = `ENDING: ${foundEndings.length} / ${ALL_ENDINGS.length}`;

    // Tombol: Ending Gallery (#2 FIX)
    DOM.galleryBtn.onclick = () => {
        const found = JSON.parse(localStorage.getItem('whisper_found_endings') || "[]");
        DOM.galleryProgress.innerText = `${found.length} / ${ALL_ENDINGS.length} DITEMUKAN`;
        uiEngine = uiEngine || new UIEngine(document.getElementById('subtitleText'));
        uiEngine.renderGallery(DOM.galleryContent, ALL_ENDINGS, found);
        DOM.galleryOverlay.style.display = 'flex';
    };
    DOM.closeGalleryBtn.onclick = () => {
        DOM.galleryOverlay.style.display = 'none';
    };

    // Tombol: Permainan Baru
    DOM.newGameBtn.onclick = () => {
        isContinuing = false;
        currentChapter = 1;
        localStorage.removeItem('whisper_host_pin');
        localStorage.removeItem('whisper_chapter');
        localStorage.removeItem('whisper_scene');
        DOM.menuScreen.style.display = 'none';
        initLobby();
    };

    // Tombol: Lanjutkan Permainan
    DOM.continueGameBtn.onclick = () => {
        isContinuing = true;
        currentChapter = parseInt(localStorage.getItem('whisper_chapter')) || 1;
        roomPin = localStorage.getItem('whisper_host_pin');
        DOM.menuScreen.style.display = 'none';
        initLobby();
    };

    // Tombol: Reset Save
    DOM.resetGameBtn.onclick = () => {
        if (confirm('Yakin ingin menghapus semua save? Progres akan hilang.')) {
            localStorage.removeItem('whisper_host_pin');
            localStorage.removeItem('whisper_chapter');
            localStorage.removeItem('whisper_scene');
            showMainMenu();
        }
    };
}

// ======================================================
// 3. INISIALISASI LOBBY
// ======================================================
async function initLobby() {
    const isLoaded = await loadChapter(currentChapter);
    if (!isLoaded) {
        alert(`Gagal memuat Bab ${currentChapter}.`);
        showMainMenu();
        return;
    }

    uiEngine = new UIEngine(document.getElementById('subtitleText'));

    if (!isContinuing) {
        roomPin = generatePin();
    }

    localStorage.setItem('whisper_host_pin', roomPin);
    localStorage.setItem('whisper_chapter', currentChapter.toString());

    await set(ref(db, `rooms/${roomPin}`), {
        status: 'lobby',
        createdAt: Date.now(),
        hostId: 'tv_host',
        chapter: currentChapter
    });

    // Tampilkan lobby
    DOM.lobbyScreen.style.display = 'flex';
    DOM.pinDisplay.innerText = roomPin;  // #1 FIX: teks PIN langsung besar

    // QR Code
    const joinUrl = `${window.location.origin}/mobile.html?pin=${roomPin}`;
    DOM.qrcode.innerHTML = "";
    new QRCode(DOM.qrcode, {
        text: joinUrl, width: 180, height: 180,
        colorDark: "#ffffff", colorLight: "#000000"
    });

    // Pantau pemain masuk
    const playersRef = ref(db, `rooms/${roomPin}/players`);
    onValue(playersRef, (snapshot) => {
        DOM.connectedPlayers.innerHTML = '';
        let count = 0;
        if (snapshot.exists()) {
            snapshot.forEach((pSnap) => {
                count++;
                const player = pSnap.val();
                const div = document.createElement('div');
                div.style.cssText = 'margin-top:8px;color:#33cccc;letter-spacing:4px;font-size:0.9rem;font-family:var(--font-mono);';
                div.innerText = `◉ ${player.nickname || 'PEMAIN'} TERHUBUNG`;
                DOM.connectedPlayers.appendChild(div);
            });
        }
        roomPlayerCount = count;
        DOM.startBtn.style.display = count > 0 ? 'block' : 'none';
    });

    DOM.startBtn.onclick = () => {
        set(ref(db, `rooms/${roomPin}/status`), 'playing');
        const savedScene = isContinuing ? localStorage.getItem('whisper_scene') : null;
        proceedToGame(savedScene);
    };
}

// ======================================================
// 4. MULAI PERMAINAN
// ======================================================
function proceedToGame(resumeSceneId) {
    DOM.lobbyScreen.style.display = 'none';
    DOM.gameScreen.style.display = 'block';
    DOM.pauseScreen.style.display = 'none';
    isGamePaused = false;

    updateChapterHUD();

    // #3: Tampilkan PIN di HUD saat bermain
    DOM.hudPin.style.display = 'block';
    DOM.hudPin.innerText = `PIN: ${roomPin}`;

    // #4: Mulai pantau disconnect saat bermain
    watchPlayerDisconnect();

    const startScene = resumeSceneId || getStartSceneId();
    if (startScene) {
        set(ref(db, `rooms/${roomPin}/state/currentScene`), startScene);
        console.log(`[TV] Permainan dimulai - Room: ${roomPin}, Chapter: ${currentChapter}, Scene: ${startScene}`);
        renderScene(startScene);
    }
}

function updateChapterHUD() {
    if (DOM.hudChapter) {
        DOM.hudChapter.innerText = `BAB ${getCurrentChapterId()}`;
    }
}

// ======================================================
// 4b. PANTAU DISCONNECT (#4)
// ======================================================
function watchPlayerDisconnect() {
    const playersRef = ref(db, `rooms/${roomPin}/players`);
    if (unsubscribePlayers) unsubscribePlayers();

    unsubscribePlayers = onValue(playersRef, (snapshot) => {
        let count = 0;
        if (snapshot.exists()) {
            snapshot.forEach(() => { count++; });
        }
        roomPlayerCount = count;

        // Semua pemain disconnect → PAUSE
        if (count === 0 && DOM.gameScreen.style.display === 'block' && !isGamePaused) {
            pauseGame();
        }

        // Pemain kembali → RESUME
        if (count > 0 && isGamePaused) {
            resumeGame();
        }
    });
}

function pauseGame() {
    isGamePaused = true;
    DOM.gameScreen.style.display = 'none';
    DOM.pauseScreen.style.display = 'flex';
    DOM.pausePinDisplay.innerText = roomPin;
    console.log("[TV] PAUSED — Semua pemain terputus.");
}

function resumeGame() {
    isGamePaused = false;
    DOM.pauseScreen.style.display = 'none';
    DOM.gameScreen.style.display = 'block';
    console.log("[TV] RESUMED — Pemain kembali terhubung.");

    // Lanjutkan dari scene terakhir yang tersimpan
    const lastScene = localStorage.getItem('whisper_scene');
    if (lastScene && pendingSceneId) {
        renderScene(pendingSceneId);
        pendingSceneId = null;
    } else if (lastScene) {
        renderScene(lastScene);
    }
}

// ======================================================
// 5. RENDER SCENE (Inti Gameplay Loop)
// ======================================================
function renderScene(sceneId) {
    const scene = getSceneData(sceneId);
    if (!scene) return;

    // Jika game paused, simpan scene untuk nanti
    if (isGamePaused) {
        pendingSceneId = sceneId;
        return;
    }

    console.log(`[TV] Merender: Chapter ${currentChapter}, Scene: ${sceneId}`);

    // Auto-save progres
    localStorage.setItem('whisper_scene', sceneId);
    localStorage.setItem('whisper_chapter', currentChapter.toString());

    // Bersihkan votes lama & vote tracker
    remove(ref(db, `rooms/${roomPin}/votes`));
    hideVoteTracker();

    // Kirim sinyal ke Mobile (termasuk mood untuk sinkronisasi suasana)
    set(ref(db, `rooms/${roomPin}/state/mobileView`), {
        status: 'typing',
        mood: scene.mood || 'calm'  // #7: kirim mood ke mobile
    });

    // Perbarui HUD lokasi
    uiEngine.updateHUD(scene.location || 'TIDAK DIKETAHUI');

    // Render background sinematik jika ada
    const sceneBg = document.getElementById('sceneBg');
    if (sceneBg && scene.background_url) {
        sceneBg.style.backgroundImage = `url('${scene.background_url}')`;
        sceneBg.style.opacity = '0.15';
    } else if (sceneBg) {
        sceneBg.style.backgroundImage = 'none';
        sceneBg.style.opacity = '0';
    }

    // Mainkan ambient audio
    playAmbient(scene.mood || 'calm');

    // #SFX: Mainkan one-shot SFX jika ada di naskah
    if (scene.sfx) {
        import('./engine/audio.js').then(({ playSFX }) => playSFX(scene.sfx));
    }

    // Efek fade transisi
    if (DOM.sceneFade) {
        DOM.sceneFade.classList.add('active');
        setTimeout(() => { DOM.sceneFade.classList.remove('active'); }, 800);
    }

    // Efek flicker supernatural
    if (scene.entityEffect) {
        document.body.classList.add('flicker-effect');
        setTimeout(() => { document.body.classList.remove('flicker-effect'); }, 500);
    }

    // Jalankan efek typewriter
    uiEngine.typewriterEffect(
        scene.speaker, scene.text, scene.mood || 'calm',
        scene.entityEffect || false,
        () => {
            // Teks selesai!

            if (scene.ending) { handleEnding(scene); return; }
            if (scene.nextChapter) { handleChapterTransition(scene.nextChapter); return; }

            if (scene.autoNext) {
                const readDelay = scene.readTime || 4000;
                set(ref(db, `rooms/${roomPin}/state/mobileView`), {
                    status: 'narration', choices: [], timer: 0,
                    mood: scene.mood || 'calm'
                });
                setTimeout(() => { transitionToScene(scene.autoNext); }, readDelay);
                return;
            }

            if (!scene.choices || scene.choices.length === 0) {
                const readDelay = scene.readTime || 4000;
                set(ref(db, `rooms/${roomPin}/state/mobileView`), {
                    status: 'narration', choices: [], timer: 0,
                    mood: scene.mood || 'calm'
                });
                setTimeout(() => { handleEnding(scene); }, readDelay);
                return;
            }

            // NORMAL: Lempar pilihan ke Mobile
            set(ref(db, `rooms/${roomPin}/state/mobileView`), {
                status: 'choosing',
                choices: scene.choices,
                timer: scene.timer || 8000,
                mood: scene.mood || 'calm'
            });
            listenForVotes(scene);
        }
    );
}

// ======================================================
// 6. CHAPTER TRANSITION
// ======================================================
async function handleChapterTransition(nextChapterNum) {
    console.log(`[TV] Transisi ke Chapter ${nextChapterNum}...`);
    currentChapter = nextChapterNum;
    localStorage.setItem('whisper_chapter', currentChapter.toString());
    localStorage.removeItem('whisper_scene');

    set(ref(db, `rooms/${roomPin}/state/mobileView`), { status: 'transitioning', mood: 'calm' });

    const isLoaded = await loadChapter(nextChapterNum);
    if (!isLoaded) { alert(`Gagal memuat Bab ${nextChapterNum}.`); return; }

    await set(ref(db, `rooms/${roomPin}/chapter`), nextChapterNum);
    updateChapterHUD();

    setTimeout(() => {
        const startScene = getStartSceneId();
        if (startScene) {
            set(ref(db, `rooms/${roomPin}/state/currentScene`), startScene);
            renderScene(startScene);
        }
    }, SCENE_TRANSITION_DELAY);
}

// ======================================================
// 7. VOTING (#5: Fastest-Win Tiebreak + #6/#8: Vote Tracker)
// ======================================================
function listenForVotes(scene) {
    const votesRef = ref(db, `rooms/${roomPin}/votes`);
    const maxTime = scene.timer || 10000;
    let countdownStarted = false;

    if (uiTimerTimeout) clearTimeout(uiTimerTimeout);

    // Tampilkan hitungan mundur 10 detik di TV (#3)
    let countdownSeconds = Math.ceil(maxTime / 1000);
    const countdownEl = document.createElement('div');
    countdownEl.id = 'tvCountdown';
    countdownEl.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:30;font-family:var(--font-horror);font-size:3rem;letter-spacing:8px;color:#555;transition:color 0.3s;';
    countdownEl.innerText = countdownSeconds;
    document.body.appendChild(countdownEl);

    const countdownInterval = setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            countdownEl.remove();
            return;
        }
        countdownEl.innerText = countdownSeconds;
        // Warning: angka berubah merah saat 3 detik terakhir
        if (countdownSeconds <= 3) {
            countdownEl.style.color = '#ff4444';
            countdownEl.style.textShadow = '0 0 20px rgba(255,50,50,0.5)';
        }
    }, 1000);

    // Timeout: waktu habis → cek apakah ada vote
    uiTimerTimeout = setTimeout(() => {
        clearInterval(countdownInterval);
        const cdEl = document.getElementById('tvCountdown');
        if (cdEl) cdEl.remove();

        if (unsubscribeVotes) { unsubscribeVotes(); unsubscribeVotes = null; }
        get(votesRef).then(snap => {
            const votesData = snap.val();
            console.log("[TV] Voting Timeout. Data:", votesData);

            // #3: Jika TIDAK ADA VOTE (null) atau object kosong → karakter mati
            if (votesData === null || Object.keys(votesData).length === 0) {
                console.log("[TV] Memicu adegan Kematian...");
                handleDeathByTimeout();
            } else {
                resolveVotes(scene, votesData);
            }
        }).catch(err => {
            console.error("[TV] Gagal ambil vote saat timeout:", err);
            handleDeathByTimeout(); // Anggap mati jika gagal ambil data
        });
    }, maxTime + 500);

    if (unsubscribeVotes) unsubscribeVotes();

    // Pantau setiap vote masuk secara realtime
    unsubscribeVotes = onValue(votesRef, (snap) => {
        if (!snap.exists()) return;
        const votesObj = snap.val();
        let totalVotes = 0;
        Object.keys(votesObj).forEach(() => { totalVotes++; });

        // Update vote tracker visual di TV (Tarik data pemain untuk Nama Panggilan)
        get(ref(db, `rooms/${roomPin}/players`)).then(pSnap => {
            updateVoteTracker(scene, votesObj, pSnap.val() || {});
        });

        // Semua pemain sudah vote → langsung resolve (hentikan countdown)
        if (totalVotes > 0 && totalVotes >= roomPlayerCount) {
            clearTimeout(uiTimerTimeout);
            clearInterval(countdownInterval);
            const cdEl = document.getElementById('tvCountdown');
            if (cdEl) cdEl.remove();
            unsubscribeVotes();
            unsubscribeVotes = null;
            resolveVotes(scene, votesObj);
        }
    });
}

/**
 * Resolve voting (#5: tiebreak berdasarkan timestamp tercepat)
 */
function resolveVotes(scene, votesObj) {
    if (!votesObj) { handleNextScene(scene, -1, null); return; }

    // Kumpulkan data vote: index + timestamp
    const voteEntries = [];
    Object.entries(votesObj).forEach(([playerId, v]) => {
        if (v.choiceIndex !== undefined && v.choiceIndex !== -1) {
            voteEntries.push({
                playerId,
                choiceIndex: v.choiceIndex,
                timestamp: v.timestamp || 0
            });
        }
    });

    if (voteEntries.length === 0) { handleNextScene(scene, -1, null); return; }

    // Hitung vote per pilihan
    const voteCounts = {};
    voteEntries.forEach(v => {
        if (!voteCounts[v.choiceIndex]) {
            voteCounts[v.choiceIndex] = { count: 0, earliestTimestamp: Infinity, voters: [] };
        }
        voteCounts[v.choiceIndex].count++;
        voteCounts[v.choiceIndex].voters.push(v.playerId);
        // Catat timestamp tercepat per pilihan
        if (v.timestamp < voteCounts[v.choiceIndex].earliestTimestamp) {
            voteCounts[v.choiceIndex].earliestTimestamp = v.timestamp;
        }
    });

    // Tentukan pemenang: terbanyak dulu, kalau seri → yang tercepat
    let winnerIndex = -1;
    let maxCount = 0;
    let earliestTime = Infinity;

    for (const [idx, data] of Object.entries(voteCounts)) {
        const i = parseInt(idx);
        if (data.count > maxCount) {
            maxCount = data.count;
            winnerIndex = i;
            earliestTime = data.earliestTimestamp;
        } else if (data.count === maxCount) {
            // TIEBREAK: pilihan tercepat menang (#5)
            if (data.earliestTimestamp < earliestTime) {
                winnerIndex = i;
                earliestTime = data.earliestTimestamp;
            }
        }
    }

    // Tampilkan hasil akhir di vote tracker (#8)
    showVoteResult(scene, voteCounts, winnerIndex);

    // Tunggu 2 detik agar pemain bisa melihat hasil voting sebelum pindah scene
    setTimeout(() => {
        handleNextScene(scene, winnerIndex, voteCounts);
    }, 2000);
}

/**
 * Tampilkan vote tracker panel di TV (#6/#8)
 */
function updateVoteTracker(scene, votesObj, playersObj = {}) {
    if (!scene.choices || !DOM.voteTracker) return;
    DOM.voteTracker.innerHTML = '';
    DOM.voteTracker.classList.add('visible');

    // Kelompokkan votes per pilihan
    const groups = {};

    Object.entries(votesObj).forEach(([pid, v]) => {
        if (v.choiceIndex === undefined || v.choiceIndex === -1) return;
        
        const nickname = playersObj[pid]?.nickname || `P${pid.slice(-3)}`;
        
        if (!groups[v.choiceIndex]) groups[v.choiceIndex] = [];
        groups[v.choiceIndex].push(nickname);
    });

    // Render setiap pilihan
    scene.choices.forEach((choice, idx) => {
        const div = document.createElement('div');
        div.className = 'vote-group';
        const voters = groups[idx] || [];
        div.innerHTML = `
            <span class="choice-label">${String.fromCharCode(65 + idx)}. ${choice.text.substring(0, 25)}${choice.text.length > 25 ? '...' : ''}</span>
            <span class="voters">${voters.length > 0 ? voters.join(', ') : '—'}</span>
        `;
        DOM.voteTracker.appendChild(div);
    });
}

/**
 * Tampilkan hasil voting akhir (pemenang diberi border merah)
 */
function showVoteResult(scene, voteCounts, winnerIndex) {
    if (!scene.choices || !DOM.voteTracker) return;
    DOM.voteTracker.innerHTML = '';
    DOM.voteTracker.classList.add('visible');

    scene.choices.forEach((choice, idx) => {
        const data = voteCounts[idx];
        const div = document.createElement('div');
        div.className = 'vote-group' + (idx === winnerIndex ? ' winner' : '');
        const voterCount = data ? data.count : 0;
        const label = idx === winnerIndex ? '✓ ' : '';
        div.innerHTML = `
            <span class="choice-label">${label}${String.fromCharCode(65 + idx)}. ${choice.text.substring(0, 25)}${choice.text.length > 25 ? '...' : ''}</span>
            <span class="voters">${voterCount} VOTE${idx === winnerIndex ? ' — TERPILIH' : ''}</span>
        `;
        DOM.voteTracker.appendChild(div);
    });
}

function hideVoteTracker() {
    if (DOM.voteTracker) {
        DOM.voteTracker.classList.remove('visible');
        DOM.voteTracker.innerHTML = '';
    }
}

function handleNextScene(scene, choiceIndex) {
    let nextId = null;

    if (choiceIndex !== -1 && scene.choices && scene.choices[choiceIndex]) {
        nextId = scene.choices[choiceIndex].next;
    } else {
        const silentChoice = scene.choices?.find(c => c.text === '[Diam]');
        if (silentChoice) nextId = silentChoice.next;
        else if (scene.choices?.length > 0) nextId = scene.choices[0].next;
    }

    if (nextId) {
        transitionToScene(nextId);
    } else {
        handleEnding(scene);
    }
}

function transitionToScene(nextSceneId) {
    console.log(`[TV] Transisi ke ${nextSceneId} dalam ${SCENE_TRANSITION_DELAY}ms...`);
    set(ref(db, `rooms/${roomPin}/state/mobileView`), { status: 'transitioning', mood: 'calm' });
    hideVoteTracker();

    setTimeout(() => {
        set(ref(db, `rooms/${roomPin}/state/currentScene`), nextSceneId);
        renderScene(nextSceneId);
    }, SCENE_TRANSITION_DELAY);
}

// ======================================================
// 8. ENDING
// ======================================================
function handleEnding(scene) {
    console.log("[TV] Menampilkan ending...");
    stopAllAudio();
    hideVoteTracker();

    // Catat ending ke Gallery
    const foundEndings = JSON.parse(localStorage.getItem('whisper_found_endings') || "[]");
    if (scene.endingTitle && !foundEndings.includes(scene.endingTitle)) {
        foundEndings.push(scene.endingTitle);
        localStorage.setItem('whisper_found_endings', JSON.stringify(foundEndings));
    }

    set(ref(db, `rooms/${roomPin}/state/mobileView`), { status: 'ended', choices: [], timer: 0, mood: 'corrupted' });
    localStorage.removeItem('whisper_scene');

    const waitTime = scene.readTime || ENDING_DELAY;
    setTimeout(() => {
        uiEngine.showEndScreen(
            scene.endingTitle || 'TAMAT',
            scene.endingDesc || 'Cerita telah berakhir.',
            foundEndings.length,
            ALL_ENDINGS.length,
            // Callback: Kembali ke menu utama
            () => { window.location.reload(); },
            // Callback: Quick restart (PIN sama, chapter 1)
            () => { quickRestart(); }
        );
        set(ref(db, `rooms/${roomPin}/status`), 'ended');
    }, waitTime);
}

/**
 * Quick Restart: Mulai ulang dari Chapter 1 dengan PIN yang sama
 * Agar pemain tidak perlu input PIN baru (#2)
 */
async function quickRestart() {
    console.log('[TV] Quick restart — PIN sama, Chapter 1');
    currentChapter = 1;
    isContinuing = false;
    localStorage.setItem('whisper_chapter', '1');
    localStorage.removeItem('whisper_scene');

    // Reset room di Firebase (Keep members!)
    await set(ref(db, `rooms/${roomPin}/status`), 'lobby');
    await set(ref(db, `rooms/${roomPin}/votes`), null);
    await set(ref(db, `rooms/${roomPin}/state`), { currentScene: null, mobileView: { status: 'transitioning' }});
    await set(ref(db, `rooms/${roomPin}/chapter`), 1);

    // Muat ulang chapter 1
    const isLoaded = await loadChapter(1);
    if (!isLoaded) { window.location.reload(); return; }

    uiEngine = new UIEngine(document.getElementById('subtitleText'));

    // Bersihkan layar ending
    document.getElementById('endScreenContainer').innerHTML = '';
    hideVoteTracker();

    // Langsung ke lobby
    DOM.gameScreen.style.display = 'none';
    DOM.lobbyScreen.style.display = 'flex';
    DOM.pinDisplay.innerText = roomPin;

    // Refresh list Nama Pemain
    const playersRef = ref(db, `rooms/${roomPin}/players`);
    onValue(playersRef, (snapshot) => {
        DOM.connectedPlayers.innerHTML = '';
        let count = 0;
        if (snapshot.exists()) {
            snapshot.forEach((pSnap) => {
                count++;
                const player = pSnap.val();
                const div = document.createElement('div');
                div.style.cssText = 'margin-top:8px;color:#33cccc;letter-spacing:4px;font-size:0.9rem;font-family:var(--font-mono);';
                div.innerText = `◉ ${player.nickname || 'PEMAIN'} TERHUBUNG`;
                DOM.connectedPlayers.appendChild(div);
            });
        }
        roomPlayerCount = count;
        DOM.startBtn.style.display = count > 0 ? 'block' : 'none';
    });

    DOM.startBtn.onclick = () => {
        set(ref(db, `rooms/${roomPin}/status`), 'playing');
        proceedToGame(null);
    };
}

/**
 * Kematian karena timeout (#3): Tidak ada pemain yang memilih
 */
function handleDeathByTimeout() {
    console.log('[TV] KEMATIAN — Tidak ada pemain yang memilih.');
    stopAllAudio();
    hideVoteTracker();

    // Simpan ending khusus "kematian timeout"
    const foundEndings = JSON.parse(localStorage.getItem('whisper_found_endings') || '[]');
    if (!foundEndings.includes('KEMATIAN OLEH KETIDAKPEDULIAN')) {
        foundEndings.push('KEMATIAN OLEH KETIDAKPEDULIAN');
        localStorage.setItem('whisper_found_endings', JSON.stringify(foundEndings));
    }

    set(ref(db, `rooms/${roomPin}/state/mobileView`), { status: 'ended', choices: [], timer: 0, mood: 'panic' });
    localStorage.removeItem('whisper_scene');

    // Tampilkan layar kematian
    uiEngine.showEndScreen(
        'KEMATIAN',
        'Tidak ada yang memilih. Keheningan membunuhmu.',
        foundEndings.length,
        ALL_ENDINGS.length,
        () => { window.location.reload(); },
        () => { quickRestart(); }
    );
    set(ref(db, `rooms/${roomPin}/status`), 'ended');
}
