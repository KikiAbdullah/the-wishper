/**
 * Modul Antarmuka (UI Engine)
 * Menangani perenderan teks animasi mesin tik, efek glitch entitas,
 * HUD lokasi, dan layar ending.
 */

export class UIEngine {
    /**
     * @param {HTMLElement} subtitleElement - Elemen DOM tempat subtitle ditampilkan
     */
    constructor(subtitleElement) {
        this.subtitleElement = subtitleElement;
        this.typingTimeout = null;
    }

    /**
     * Efek huruf per huruf (Typewriter) dengan indikator pembicara
     * @param {string} speaker - Nama yang berbicara ("Unknown" akan ditampilkan sebagai "??")
     * @param {string} text - Teks lengkap adegan
     * @param {string} mood - Pengubah suasana (calm/uneasy/tense/panic/corrupted)
     * @param {boolean} entityEffect - Apakah teks perlu efek glitch karakter
     * @param {function} onComplete - Dipanggil ketika animasi selesai
     */
    typewriterEffect(speaker, text, mood, entityEffect, onComplete) {
        // Hentikan animasi sebelumnya jika ada
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.subtitleElement.innerHTML = "";

        // Tentukan kecepatan ketik berdasarkan suasana
        let speed = 55;  // default (calm)
        if (mood === 'uneasy') speed = 65;
        if (mood === 'tense') speed = 75;
        if (mood === 'panic') speed = 35;  // Sangat cepat saat panik
        if (mood === 'corrupted') speed = 45;

        // Hapus kelas lama dan pasang mood baru
        this.subtitleElement.className = '';
        this.subtitleElement.classList.add('subtitle-text', mood);

        // Format nama pembicara
        const speakerLabel = (speaker === "Unknown") ? "??" : speaker;

        // Susun struktur HTML: nama pembicara di atas, teks dialog di bawah
        this.subtitleElement.innerHTML = `<span class="speaker-name">${speakerLabel}</span><span id="speechText"></span>`;
        const speechSpan = document.getElementById('speechText');

        // Olah teks: jika entitas, acak sebagian karakter menjadi glitch
        let displayText;
        if (entityEffect) {
            displayText = `"${this._glitchify(text)}"`;
        } else {
            displayText = `"${text}"`;
        }

        // Jalankan animasi mesin tik
        let i = 0;
        const type = () => {
            if (i < displayText.length) {
                speechSpan.innerHTML += displayText.charAt(i);
                i++;
                this.typingTimeout = setTimeout(type, speed);
            } else {
                // Teks selesai diketik
                if (onComplete) onComplete();
            }
        };
        type();
    }

    /**
     * Memperbarui tampilan HUD lokasi di pojok kiri atas
     * @param {string} location - Nama lokasi saat ini
     */
    updateHUD(location) {
        const hudEl = document.getElementById('hudLocation');
        if (hudEl && location) {
            hudEl.innerText = location.toUpperCase();
        }
    }

    /**
     * Menampilkan layar ending dengan animasi fade-in
     * @param {string} title - Judul ending
     * @param {string} desc - Deskripsi singkat ending
     * @param {function} onRestart - Callback saat tombol kembali ke menu diklik
     */
    showEndScreen(title, desc, foundCount, totalCount, onRestart, onQuickRestart) {
        const container = document.getElementById('endScreenContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="end-screen">
                <h1 style="margin-bottom:10px;">${title}</h1>
                <p>${desc}</p>
                <p style="margin-top:30px;color:#33cccc;font-size:0.75rem;letter-spacing:4px;">ENDING ${foundCount} / ${totalCount} DITEMUKAN</p>
                <div style="display:flex;flex-direction:column;gap:12px;margin-top:35px;width:300px;">
                    <button id="endQuickRestartBtn" class="menu-btn" style="border-color:var(--color-accent-green,#33cc33);color:var(--color-accent-green,#33cc33);">▶ MULAI ULANG</button>
                    <button id="endToMenuBtn" class="menu-btn" style="border-color:#555;color:#666;">KEMBALI KE MENU</button>
                </div>
                <p style="margin-top:30px;letter-spacing:5px;font-size:0.8rem;color:#444;">— THE WHISPERS —</p>
            </div>
        `;

        const menuBtn = document.getElementById('endToMenuBtn');
        if (menuBtn && onRestart) menuBtn.onclick = onRestart;

        const restartBtn = document.getElementById('endQuickRestartBtn');
        if (restartBtn && onQuickRestart) restartBtn.onclick = onQuickRestart;
    }

    /**
     * Merender daftar galeri ending ke dalam elemen kontainer
     * @param {HTMLElement} container - Kontainer galeri
     * @param {Array} allEndings - Daftar semua ending dari story_flow
     * @param {Array} foundEndings - Daftar ending yang sudah pernah ditemukan
     */
    renderGallery(container, allEndings, foundEndings) {
        container.innerHTML = "";
        allEndings.forEach(end => {
            const isFound = foundEndings.includes(end.title);
            const item = document.createElement('div');
            item.className = `gallery-item ${isFound ? 'found' : 'locked'}`;
            item.innerHTML = `
                <div class="gallery-title">${isFound ? end.title : '???'}</div>
                <div class="gallery-desc">${isFound ? end.desc : 'Belum ditemukan'}</div>
            `;
            container.appendChild(item);
        });
    }

    /**
     * Membersihkan layar subtitle
     */
    clear() {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.subtitleElement.innerHTML = "";
        this.subtitleElement.className = '';
    }

    /**
     * Mengacak sebagian karakter teks menjadi glitch (untuk dialog entitas)
     * Misal: "Aku tahu kamu" → "Aku t4hu k4mu"
     * @param {string} text - Teks asli
     * @returns {string} Teks yang sudah dimodifikasi
     */
    _glitchify(text) {
        const glitchChars = '0134578@#$%';
        let result = '';
        for (let i = 0; i < text.length; i++) {
            // 15% kemungkinan karakter berubah menjadi glitch
            if (Math.random() < 0.15 && text[i] !== ' ' && text[i] !== '.') {
                result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                result += text[i];
            }
        }
        return result;
    }
}
