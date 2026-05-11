/**
 * Mesin Cerita (Story Engine)
 * Bertugas mengurai naskah berformat JSON per-chapter dan mengatur
 * logika perpindahan adegan serta perpindahan antar chapter.
 */

// Variabel penyimpan chapter yang sedang aktif
let currentChapterData = null;
let currentChapterId = null;

// Total chapter yang tersedia
const TOTAL_CHAPTERS = 7;

/**
 * Memuat (fetch) file JSON naskah chapter tertentu.
 * @param {number} chapterNum - Nomor chapter (1-7)
 * @returns {boolean} true jika berhasil, false jika gagal
 */
export async function loadChapter(chapterNum) {
    try {
        const response = await fetch(`./data/chapter${chapterNum}.json`);
        currentChapterData = await response.json();
        currentChapterId = chapterNum;
        const sceneCount = Object.keys(currentChapterData.scenes).length;
        console.log(`[Story Engine] Chapter ${chapterNum} dimuat: ${sceneCount} adegan.`);
        return true;
    } catch (error) {
        console.error(`[Story Engine] Gagal memuat chapter ${chapterNum}:`, error);
        return false;
    }
}

/**
 * Mendapatkan node data dari adegan tertentu di chapter aktif.
 * @param {string} sceneId - ID unik adegan
 * @returns {object|null} Objek adegan, atau null apabila tidak ditemukan
 */
export function getSceneData(sceneId) {
    if (!currentChapterData || !currentChapterData.scenes) return null;
    return currentChapterData.scenes[sceneId] || null;
}

/**
 * Mendapatkan ID adegan pertama chapter aktif sebagai pembuka.
 */
export function getStartSceneId() {
    if (!currentChapterData) return null;
    return currentChapterData.startScene;
}

/**
 * Mendapatkan nomor chapter yang sedang aktif.
 */
export function getCurrentChapterId() {
    return currentChapterId;
}

/**
 * Mendapatkan total chapter yang tersedia.
 */
export function getTotalChapters() {
    return TOTAL_CHAPTERS;
}

/**
 * Mendapatkan judul chapter yang sedang aktif.
 */
export function getChapterTitle() {
    if (!currentChapterData) return '';
    return currentChapterData.chapterTitle || `Chapter ${currentChapterId}`;
}

// ---- BACKWARD COMPATIBILITY ----
// Fungsi lama tetap tersedia agar tidak merusak kode yang sudah ada
export async function loadStoryJson() {
    return loadChapter(1);
}
