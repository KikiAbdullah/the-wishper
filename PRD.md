# PRD — THE WHISPERS

## Multiplayer Narrative Horror Experience

Version: 1.0
Status: Production Ready Foundation
Platform: Web + Mobile Browser
Architecture: TV Display + Mobile Controller
Genre: Narrative Adventure / Psychological Horror / Interactive Drama
Target Inspiration: Oxenfree-style dialogue flow + analog horror atmosphere + social multiplayer interaction

---

# 1. Executive Summary

The Whispers adalah game narrative horror multiplayer berbasis browser dengan format dual-screen:

- TV / Monitor / Laptop menjadi layar cinematic utama
- Smartphone pemain menjadi alat interaksi personal

Game berfokus pada:

- real-time dialogue
- interruption choices
- psychological tension
- hidden consequences
- supernatural presence
- branching narrative
- emotional relationship systems

Alih-alih gameplay action tradisional, pengalaman bermain dibangun dari:

- percakapan natural
- tekanan waktu
- rasa tidak nyaman
- misteri supernatural
- konsekuensi psikologis

Core fantasy pemain:

"Berada di situasi supernatural yang terasa hidup, tidak nyaman, dan terus memanipulasi pemain secara emosional."

---

# 2. Product Vision

Menciptakan pengalaman narrative horror modern yang:

- mudah dimainkan di browser
- sangat immersive
- cocok dimainkan sendiri maupun ramai-ramai
- mudah viral di streaming/TikTok
- scalable untuk episodic storytelling
- memiliki replayability tinggi

---

# 3. Core Experience Pillars

## 3.1 Natural Dialogue

Percakapan harus terasa:

- spontan
- tidak kaku
- kadang saling memotong
- kadang awkward
- kadang diam
- penuh tekanan

Player dapat:

- menjawab
- diam
- interrupt
- menghindar
- berbohong
- memprovokasi

Diam adalah pilihan.

---

## 3.2 Psychological Tension

Game tidak mengandalkan jumpscare murahan.

Ketakutan dibangun melalui:

- ambience
- silence
- audio distortion
- perubahan subtle
- UI manipulation
- uncertainty
- paranoia

---

## 3.3 Consequences Matter

Pilihan kecil harus berdampak besar.

Contoh:

- interrupt terlalu sering
- terlalu defensif
- terlalu pasif
- terlalu percaya pada entity

Semua akan mempengaruhi:

- relationship
- route cerita
- survival
- ending
- trust antar karakter

---

## 3.4 Supernatural Presence

Entity supernatural bukan sekadar musuh.

Entity:

- mempelajari pemain
- memanipulasi dialog
- mengubah UI
- menciptakan fake choices
- berbicara lewat radio
- menyebut nama pemain
- memunculkan halusinasi

Tujuannya membuat pemain tidak percaya pada game itu sendiri.

---

# 4. Game Structure

## 4.1 Gameplay Loop

1. Explore scene
2. Dialogue begins
3. Players choose responses
4. Relationships change
5. Tension escalates
6. Presence interferes
7. Story branches
8. Reveal mystery
9. Reach ending
10. Replay for hidden routes

---

# 5. Story Premise

Sekelompok anak muda pergi ke pulau terbengkalai bernama Blackwater Point.

Mereka menerima sinyal radio misterius yang tampaknya berasal dari masa lalu.

Semakin malam berjalan:

- waktu mulai rusak
- percakapan berubah
- realita tidak stabil
- beberapa karakter mulai mendengar bisikan
- entity supernatural mulai mengambil alih komunikasi

Pemain harus menentukan:

- siapa yang dipercaya
- siapa yang dikorbankan
- apakah entity harus dibebaskan
- apakah masa lalu harus diubah

---

# 6. Target Audience

## Primary

- usia 16–35
- fans narrative games
- horror psychological audience
- streamer audience
- mobile-first gamers

## Secondary

- party gamers
- TikTok audience
- Discord communities
- indie horror communities

---

# 7. Platform Architecture

## Pre-Game Flow (Lobby & Host)

1. **Landing Page:** Player memilih peran sebagai "TV Player (Host)" atau "Mobile Controller".
2. **TV Screen:** Jika menjadi TV, layar menampilkan Lobby, QR Code, dan PIN Room.
3. **Mobile Controller:** Player scan QR Code atau memasukkan PIN untuk *join*. Setelah PIN masuk, perangkat otomatis siap.
4. **Browser Constraint (Tap to Start):** Sebelum game termuat penuh, TV dan HP wajib memunculkan tombol "Tap to Start" atau "Press Any Button to Connect". Ini krusial untuk membuka otorisasi *Audio Autoplay API* pada *browser modern* (terutama iOS/Safari) agar efek audio dan musik bisa otomatis berbunyi.

---

## TV Screen (Main Display)

Fungsi:

- cinematic experience
- atmosphere
- background scenes
- subtitles
- character presentation
- visual horror effects

TV bukan tempat interaksi utama.

TV harus terasa seperti film interaktif.

---

## Mobile Controller

Fungsi:

- pilihan dialog
- interrupt actions
- radio scanner
- inventory
- hidden clues
- personal hallucinations

Setiap HP bisa memiliki informasi berbeda.

---

# 8. Visual Direction

# TV VISUAL STYLE

## Tone

- dark
- eerie
- melancholic
- lonely
- analog-horror inspired
- cinematic
- supernatural

---

## Color Palette

Dominan:

- deep blue
- black
- desaturated purple
- dark cyan
- faded gray

Accent:

- red warning glow
- green radio signal
- white glitch flashes

Hindari warna cerah.

---

## Lighting Style

Semua scene harus low-light.

Gunakan:

- moonlight
- flashlight
- CRT flicker
- distant lighthouse
- fog lighting
- silhouette shadows

Karakter sering tidak terlihat penuh.

---

## Atmosphere FX

TV harus selalu “hidup”.

Layer effects:

- film grain
- VHS noise
- static lines
- subtle chromatic aberration
- screen flicker
- fog particles
- moving shadows
- radio interference

Tidak boleh terasa clean.

---

## Camera Style

Gunakan:

- slow cinematic pans
- side-scrolling framing
- distant compositions
- silhouette framing
- negative space

Player harus merasa kecil dan sendirian.

---

## Subtitle Style

Dialogue subtitle:

- besar
- clean
- minimal
- semi-transparent
- fade-in animation
- typewriter delay

Ketika entity berbicara:

- text glitch
- duplicated letters
- distortion
- broken timing

Contoh:

"D0 Y0U H3AR M3?"

---

## TV UI Layout

Top Left:

- location
- current time

Bottom Center:

- cinematic subtitles

Bottom Right:

- radio signal indicator

Full Background:

- animated atmospheric scene

Minimal HUD.

UI harus hampir invisible.

---

# 9. Mobile UI Style

## Tone

Mobile terasa personal.

Mirip:

- chat app
- old messenger
- radio device
- supernatural communicator

---

## Choice Buttons

Bentuk:

- rounded chat bubbles
- translucent dark background
- subtle glow
- animated timer ring (ketika waktu hampir habis: *timer ring* akan berubah merah, layar HP bergetar pelan, dan teks pilihan perlahan *blur*)

Pilihan harus muncul cepat dan terasa urgent.

---

## Haptic Feedback (Getaran)

Berfungsi untuk menaikkan *immersion* bermain alat sentuh. Fitur ini memanfaatkan standar *Browser API* (`navigator.vibrate()`):

- HP bergetar pelan sebagai aba-aba ketika waktu dialog akan habis.
- Getaran tiba-tiba saat layar TV memunculkan *jumpscare*.
- Getaran berdenyut (*pulse*) saat HP menangkap sinyal radio supernatural.

---

## Hidden Choices

Kadang player melihat pilihan berbeda.

Contoh:

Player A:
"Trust Luna"

Player B:
"Luna is lying"

---

## Hallucination UI

Entity bisa:

- membalik text
- menghapus choices
- mengganti nama karakter
- membuat fake notification
- membuat screen glitch

---

# 10. Core Systems

# 10.1 Narrative Graph Engine

Story disusun dalam node graph.

Setiap scene:

- dialogue
- background
- music
- mood
- choices
- effects
- next scene

Example:

```js
{
  id: "pier_intro",
  bg: "pier_night",
  music: "distant_waves",
  speaker: "Luna",
  text: "Did you hear that?",
  choices: [
    {
      text: "Probably the wind.",
      next: "scene_02",
      effects: {
        luna: +1
      }
    }
  ]
}
```

---

# 10.2 Relationship System

Setiap karakter memiliki affinity score.

Variables:

- trust
- fear
- anger
- attraction
- corruption

Nilai mempengaruhi:

- dialogue
- scene unlock
- survival
- ending

---

# 10.3 Mood Engine

Mood global mempengaruhi:

- soundtrack
- visual FX
- dialogue pacing
- subtitle animation
- glitch intensity

Mood States:

- calm
- awkward
- tense
- panic
- corrupted

---

# 10.4 Presence System

Entity supernatural memiliki AI state.

Presence dapat:

- trigger hallucination
- hijack dialogue
- corrupt choices
- manipulate audio
- alter timeline

Presence meter meningkat berdasarkan:

- radio usage
- emotional conflict
- forbidden choices

---

# 10.5 Interrupt System

Dialogue dapat dipotong.

Setiap line memiliki:

- interrupt timing
- silence timing
- emotional state

Jika player diam:

silence becomes response.

---

# 10.6 Radio Scanner System

Mobile memiliki frequency scanner.

Mechanics:

- drag frequency slider
- detect hidden transmissions
- unlock secret routes
- hear whispers
- solve signal puzzles

Frequency Example:

- 87.4 = static
- 91.3 = hidden memory
- 96.6 = entity communication

---

# 11. Multiplayer Systems & Connectivity

## Local Multiplayer & State Management

1 TV + multiple phones. Game state disinkronisasi memanfaatkan **Firebase Realtime Database** untuk performa yang ringan.

### Penanganan Disconnect / Dropout:
- **Client (HP):** Apabila koneksi internet dari HP seorang pemain terputus atau tidak sengaja tertutup, pemain cukup masuk lagi menginput PIN *Room*, dan mereka otomatis masuk melanjutkan sesi *game* *(rejoin)*.
- **Host (TV):** Jika *browser* TV tanpa sengaja ter-*refresh*, permainan akan langsung *resume* atau melanjutkan *state* yang sama, karena sistem menyimpan jejak perangkat (IP/Mac Address/Local Storage). Di *Host* akan tersedia tombol "Reset Game" khusus, jika memang ingin membentuk *room session* yang baru.

---

## Decision Mode (Solo vs Co-op)

- **Solo Play (1 HP):** Menggunakan *Individual Choices*. Pilihan langsung tereksekusi tanpa menunggu, mempertahankan ritme natural dan kecepatan (*fast-paced* / *interrupt timing*).
- **Multiplayer (>1 HP):** Menggunakan *Voting Mode*. Keputusan mayoritas menentukan cerita. Mode *voting* diutamakan pada bagian rute besar (*branching point* cerita) demi tidak membunuh momentum ketegangan (*tension*) pada urutan dialog cepat.

---

## Secret Information System

Beberapa player menerima:

- secret objectives
- hallucinations
- manipulated dialogue

Ini menciptakan paranoia sosial.

---

# 12. Audio Direction

Audio adalah bagian paling penting.

## Audio Types

- ambient drones
- distant whispers
- radio static
- distorted piano
- low bass tension
- reversed audio
- silence

---

## Dynamic Audio

Music berubah berdasarkan:

- mood
- presence level
- player choices
- relationship conflict

---

## Spatial Horror Audio

Gunakan:

- sudden silence
- left/right whispering
- low-frequency rumble
- broken radio sounds

---

# 13. Scene Examples

## Example Scene 1

Location:
Abandoned Pier

Mood:
Calm → Uneasy

Events:

- distant radio transmission
- Luna asks strange question
- player hears hidden whisper
- radio briefly activates itself

---

## Example Scene 2

Location:
Lighthouse Interior

Mood:
Tense

Events:

- entity imitates friend voice
- lights flicker
- fake dialogue choices appear
- hidden timeline discovered

---

## Example Scene 3

Location:
Underground Bunker

Mood:
Panic

Events:

- timeline corruption
- relationship collapse
- entity fully manifests
- multiple endings branch

---

# 14. Endings

Game memiliki multiple endings.

Example:

- everyone survives
- one character sacrificed
- entity escapes island
- player trapped in loop
- reality rewritten
- corrupted ending
- false happy ending

---

# 15. Replayability Features

## Timeline Map

Setelah tamat:

- branch visualization
- missed scenes
- hidden routes
- secret endings

---

## New Game+

Second playthrough:

- extra dialogue
- entity remembers player
- hidden frequencies appear
- alternate timeline unlocked

---

# 16. Technical Architecture

## Frontend

- Vanilla HTML / CSS / JavaScript
- Tanpa *Framework* (Deployment langsung ke GitHub Pages)
- External Libraries via CDN (Howler.js, Firebase JS SDK, modul QR Reader)

---

## Networking

- Firebase Realtime Database

---

## Rendering

- CSS shaders
- WebGL overlays
- particle effects
- CRT effects

---

## Audio Engine

- Howler.js
- Web Audio API

---

## Asset Delivery & Optimization

Gim ini penuh dengan *ambient textures* dan efek suara 3D yang sangat memakan aset. Agar pemain kasual (*mobile*) tidak keluar dari permainan sebelum gim-nya mulai dimuat *(bounce)*:
- **Audio Sprite / Lazy Loading:** Pemuatan latar audio dalam satu paket terkompresi. Tidak mendikte pemuatan `mb` ukuran massal agar *bandwidth* seluler dapat terjaga.

---

# 17. Folder Structure

```txt
/src
  /core
  /engine
  /narrative
  /audio
  /effects
  /multiplayer
  /tv
  /mobile
  /shared
  /assets

/games
  /whispers
    /story
    /scenes
    /audio
    /characters
```

---

# 18. MVP Scope

## Initial Release

1 island area

3 playable characters

20–30 narrative scenes

3 endings

1 entity

1 radio system

1 multiplayer mode

Estimated gameplay:

30–45 minutes

---

# 19. Production Roadmap

## Phase 1

Foundation Engine

- networking
- narrative system
- dialogue flow
- mobile sync

---

## Phase 2

Atmosphere Layer

- FX
- audio
- glitch system
- mood engine

---

## Phase 3

Narrative Expansion

- more scenes
- branching routes
- endings
- hidden content

---

## Phase 4

Replay + Social

- spectator mode
- Twitch integration
- timeline map
- achievements

---

# 20. Monetization Strategy

## Base Game

Free-to-play browser experience.

---

## Premium Expansions

- new episodes
- new characters
- alternate timelines
- cosmetic phone themes
- soundtrack pack

---

# 21. Viral Potential

The Whispers sangat cocok untuk:

- TikTok clips
- streamer reactions
- Discord parties
- horror content creators
- mystery ARG communities

Karena:

- player reactions unpredictable
- dialogue naturally dramatic
- supernatural glitches visually menarik
- social betrayal moments shareable

---

# 22. Success Metrics

## Engagement

- average session time
- replay rate
- completion rate
- hidden ending discovery

---

## Social

- clips shared
- multiplayer sessions
- spectator participation

---

## Narrative

- dialogue selection diversity
- branch usage
- emotional route analysis

---

# 23. Final Creative Direction

The Whispers harus terasa seperti:

- interactive supernatural movie
- emotional psychological horror
- playable mystery series
- social paranoia simulator

Bukan sekadar visual novel.

Tujuan utamanya:

Membuat pemain merasa:

- tidak nyaman
- penasaran
- emosional
- paranoid
- attached pada karakter
- takut pada pilihan mereka sendiri

Dan ketika game selesai:

player masih memikirkan apa yang sebenarnya terjadi.

---

# 24. TEXT-BASED ATMOSPHERIC DIRECTION

Karena production art dan ilustrasi membutuhkan resource besar, maka The Whispers akan menggunakan:

- atmospheric backgrounds
- animated ambience
- cinematic typography
- audio tension
- visual distortion
- environmental storytelling

Game tidak membutuhkan ilustrasi karakter penuh.

Karakter cukup hadir melalui:

- suara
- nama
- subtitle
- silhouette
- ambience
- timing percakapan

Pendekatan ini justru memperkuat psychological horror.

Pemain membayangkan sendiri apa yang terjadi.

---

# 25. TV VISUAL IMPLEMENTATION (NO CHARACTER ART)

TV hanya menampilkan:

- suasana lokasi
- efek atmosfer
- subtitle dialogue
- cinematic transitions
- radio interference
- environmental movement

Contoh scene:

- hutan malam berkabut
- lorong bunker gelap
- mercusuar rusak
- pantai kosong
- jalan hujan malam
- ruang radio tua

Tidak perlu sprite karakter.

---

## 25.1 Example TV Composition

```txt
┌─────────────────────────────────┐
│                                 │
│         DARK FOREST             │
│      moving fog particles       │
│                                 │
│       subtle flashlight         │
│                                 │
│                                 │
│                                 │
│                                 │
│    "Did you hear that...?"     │
│                                 │
└─────────────────────────────────┘
```

Fokus utama:

- ambience
- timing
- silence
- typography

---

# 26. CINEMATIC TYPOGRAPHY SYSTEM

Text adalah gameplay utama.

Karena itu typography harus hidup.

---

## 26.1 Calm Dialogue

Style:

- fade in pelan
- warna putih redup
- spacing normal
- muncul smooth

Example:

"The signal is getting weaker..."

---

## 26.2 Tense Dialogue

Style:

- text shake subtle
- delay antar kata
- opacity berubah
- typing speed lambat

Example:

"I don't think... we're alone here."

---

## 26.3 Panic Dialogue

Style:

- text flicker
- rapid appearance
- red distortion
- duplicated letters

Example:

"RUN."

atau

"DON'T LOOK AT IT"

---

## 26.4 Entity Dialogue

Style:

- broken typography
- corrupted letters
- glitch animation
- reversed fade
- random character replacement

Example:

"Y0U SH0ULD N0T H4VE C0ME HERE"

atau

"i can hear you"

---

# 27. ENVIRONMENTAL STORYTELLING

Karena game text-based, maka dunia harus bercerita sendiri.

Gunakan:

- distant sirens
- radio static
- footsteps
- thunder
- flickering lights
- ocean waves
- breathing sounds
- metal creaks
- whisper layers

Environment menjadi karakter utama.

---

# 28. TV BACKGROUND SYSTEM

Background bukan gambar statis biasa.

Setiap background memiliki:

- moving fog
- animated grain
- slow zoom
- light flicker
- particle movement
- subtle animation loop

Tujuan:

Membuat layar tetap hidup walaupun hanya text.

---

# 29. MOOD-BASED VISUAL STATES

## Calm

- dark blue
- slow fog
- soft ambient sound
- stable subtitles

---

## Uneasy

- desaturated color
- subtle flicker
- wind becomes louder
- text timing awkward

---

## Tense

- increased grain
- stronger shadows
- low bass rumble
- subtitle flickering
- radio interference

---

## Panic

- red emergency flashes
- distorted audio
- rapid glitches
- unstable camera
- aggressive text animation

---

## Corrupted

- CRT distortion
- black screen interruptions
- fake subtitles
- timeline jumps
- UI manipulation

---

# 30. TEXT PACING SYSTEM

Pacing sangat penting.

Jangan tampilkan semua text langsung.

Gunakan:

- pauses
- silence
- delayed responses
- interrupted sentences
- sudden cutoff

Contoh:

"Wait..."

[2 second silence]

"Did you see that behind the trees?"

Silence menciptakan tension.

---

# 31. DYNAMIC ATMOSPHERE ENGINE

Atmosphere berubah berdasarkan:

- player choices
- fear level
- relationship conflict
- entity presence
- hidden story variables

Contoh:

Jika player terlalu sering menggunakan radio:

- static becomes louder
- subtitle corruption increases
- background darker
- whispers appear

---

# 32. LOW-COST HIGH-IMMERSION STRATEGY

The Whispers sengaja menggunakan:

- minimal art
- strong audio
- cinematic text
- atmosphere layering
- procedural tension

Keuntungan:

- development lebih cepat
- lebih murah diproduksi
- scalable narrative lebih mudah
- psychological horror lebih efektif
- cocok untuk solo developer

---

# 33. VISUAL REFERENCES

Inspirasi visual:

- Oxenfree
- analog horror VHS
- liminal spaces
- found footage horror
- retro CRT aesthetics
- dark cinematic typography

TV harus terasa seperti:

"saluran TV tua yang menangkap sesuatu yang seharusnya tidak terlihat."

---

# 34. FINAL EXPERIENCE GOAL

Ketika pemain bermain The Whispers:

- ruangan terasa sunyi
- pemain fokus membaca
- ambience membuat tidak nyaman
- text terasa hidup
- pilihan terasa berat
- dunia terasa misterius
- pemain mulai paranoid

Walaupun gameplay hanya text-based.

Karena ketakutan terbesar berasal dari imajinasi pemain sendiri.
