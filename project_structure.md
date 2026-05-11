# Project Structure — The Whispers

Aplikasi ini dibangun menggunakan arsitektur **Vanilla HTML/CSS/JS** agar sepenuhnya *production-ready* untuk *hosting statis* di **GitHub Pages**. Sistem tidak memerlukan kompilasi (*build process*) seperti Node.js, Webpack, atau Vite. Penggunaan *library* eksternal melalui layanan *Content Delivery Network* (CDN).

---

## Gambaran Direktori

```txt
/becoder_whisper
│
├── index.html            // File utama (Landing Page / Pilihan Peran: TV atau Mobile)
├── tv.html               // Antarmuka Host (Layar Utama TV/Laptop/Cinematic)
├── mobile.html           // Antarmuka Client (Controller untuk scan QR & Input Pilihan)
│
├── /css
│   ├── main.css          // Variabel warna global, reset CSS dasar
│   ├── tv.css            // Gaya khusus pengaturan tipografi teks sinematik & atmosfer
│   ├── mobile.css        // Layout untuk mobile: bubbles obrolan, radio slider, animasi ring timer
│   └── effects.css       // Animasi keyframes (glitch teks, heartbeat haptic, fade)
│
├── /js
│   ├── /core
│   │   ├── app.js        // Entry point - mengelola start session & navigasi routing semu
│   │   ├── firebase.js   // Modul khusus inisiasi SDK Firebase, pembuatan/penyatuan Room & Pin
│   │   └── utils.js      // Kumpulan fungsi helper (Haptic vibrate, format timer, QR generator)
│   │
│   ├── /engine
│   │   ├── story.js      // Mesin inti pembaca file JSON The Whispers, pemroses jalur & vote
│   │   ├── audio.js      // Audio manager mengendalikan Howler.js (bgm, sfx, sprite & lazy load)
│   │   └── ui.js         // Pengelola DOM, pemroses efek tipografi secara manipulatif
│   │
│   ├── tv.js             // Logika spesifik pengontrol statis layar Host
│   └── mobile.js         // Logika spesifik pengontrol scanner, voting, dan UI Mobile
│
├── /data
│   └── story.json        // Master data Naskah Node Graph (Scene, Teks, Efek, Rute)
│
├── /assets
│   ├── /audio
│   │   ├── /bgm          // Suara ambient & atmosfir lingkungan (pantai, hujan, sirene jarak jauh)
│   │   ├── /sfx          // Efek suara radio statis, jumpscare, bisikan tersembunyi
│   │   └── sprite.json   // Peta pemetaan audio sprite untuk optimalisasi asetat (opsional)
│   │
│   ├── /images
│   │   ├── /bg           // Material dasar untuk shader CSS latar belakang TV
│   │   └── /icons        // Ikon pemindai, logo mikro, dll.
│   │
│   └── /fonts            // Custom Web Fonts Analog Horror / VCR / Typewriter
│
├── PRD.md                // Dokumen spesifikasi & visi produk (Product Requirement)
└── project_structure.md  // [ANDA DI SINI] Panduan susunan pengembangan folder ini
```

---

## Panduan Peran File

### 1. `data/story.json`
Ini adalah "Otak Narasi". Dengan pemisahan aset ke JSON, penambangan narasi dan pengembangannya secara episodik menjadi mudah (tidak perlu memoles kode Javascript setiap kali). JSON mengatur rute pilihan.

```json
{
  "scenes": {
    "pier_intro": {
      "bg": "pier_night",
      "audio": "waves_distant",
      "mood": "uneasy",
      "speaker": "Luna",
      "text": "Did you hear that?",
      "timer": 5000,
      "choices": [
         { "text": "Probably the wind.", "next": "scene_02" },
         { "text": "[Silence]", "next": "scene_angry" }
      ]
    }
  }
}
```

### 2. `/js/engine/` (Game Core)
Area spesialis untuk komputasi utama saat game berjalan:
- **`story.js`**: Melakukan HTTP `fetch` ke `story.json`, menganalisis status rute, membaca ID adegan berikutnya dari jumlah *vote*, lalu mengubah alur cerita.
- **`audio.js`**: Tempat bersemayam *Howler.js*. Ini bertugas memastikan musik berubah seiring bergantinya suasana (*mood*) dan menyuarakan respons secara sinkron dengan teks.
- **`ui.js`**: Mengeksekusi instruksi dari *Story Engine* dengan berinteraksi langsung pada DOM HTML (Ganti *class* dari *calm* menjadi *glitch*, pemicu timer, dsb).

### 3. `/js/core/firebase.js`
Inilah tulang punggung lalu-lintas jaringan (Multiplayer). Semua *Client* (Mobile) akan "*listen*" (mendengar) parameter "state" tertentu pada direktori Room-nya di dalam direktori akar `Realtime DB`, sementara TV yang mengendalikannya.

### 4. Eksternal Plugin (CDN)
Skrip HTML seperti `index.html`, `tv.html` dan `mobile.html` akan langsung *embed* modul via URL:
- **Firebase:** `https://www.gstatic.com/firebasejs/...`
- **Howler.js:** `https://cdnjs.cloudflare.com/...`
- **QR Reader (e.g., html5-qrcode):** `https://unpkg.com/html5-qrcode`

---

## Manajemen dan Pelacakan (Tracking)
1. **GitHub Flow:** Setiap perbaikan *logical* difokuskan pada folder `/js`. Sementara setiap tambahan cerita hanya perlu menyasar folder `/data` (berupa JSON) tanpa harus me-rekompilasi kodenya.
2. **Skalabilitas:** Jika skala kian melebar, skenario bisa dipisahkan lagi layaknya `/data/episodes/eps01.json`, mempermulus skema monetisasi ekspansinya nantinya.
