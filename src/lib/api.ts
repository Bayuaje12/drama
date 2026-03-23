// ==========================================
// MANDARINFLIX API SERVICE (UPDATED & FIXED)
// ==========================================

const BASE_URL = "https://dramabox.dramabos.my.id/api/v1";

// Daftar Proxy untuk menembus blokir CORS dari browser HP/Vercel
const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?", 
];

// Fungsi pintar untuk mencoba fetch ulang jika server lambat
async function fetchWithRetry(proxyUrl: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(proxyUrl);
      if (res.ok) return res;
    } catch (error) {
      if (i < retries - 1) {
        // Tunggu 1 detik sebelum mencoba lagi
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw new Error(`Gagal mengambil data setelah ${retries} kali percobaan.`);
}

// Fungsi utama penarik data API
export async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  
  // Masukkan parameter tambahan jika ada
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  
  // Wajib bahasa Indonesia
  if (!url.searchParams.has("lang")) {
    url.searchParams.set("lang", "in");
  }

  const encodedUrl = encodeURIComponent(url.toString());
  
  // Coba gunakan proxy satu per satu
  for (const proxy of PROXIES) {
    try {
      const response = await fetchWithRetry(`${proxy}${encodedUrl}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`Proxy ${proxy} gagal, mencoba jalur lain...`);
    }
  }
  throw new Error("Semua jalur proxy terblokir. Cek koneksi internet atau API sedang down.");
}

// ---------------------------------------------------------
// EXTRACTOR FUNCTIONS (Menerjemahkan data JSON yang berantakan)
// ---------------------------------------------------------

// 1. Memperbaiki URL Gambar (Menambahkan https:// jika hilang)
export function extractImageUrl(item: any): string {
  if (!item) return "";
  const url = item.cover || item.bookCover || item.horizontal_cover || item.vertical_cover || item.cover_url || "";
  
  if (!url) return "";
  return url.startsWith("http") ? url : `https:${url}`;
}

// 2. Memperbaiki URL Video (INI YANG MEMBUAT VIDEO BISA DIPUTAR)
export function extractVideoUrl(episode: any, bookId?: string): string {
  if (!episode) return "";

  // Prioritas Utama: Cari link streaming langsung (.m3u8 atau .mp4)
  const directUrl = episode.play_url || episode.m3u8_url || episode.video_url || episode.url;
  if (directUrl) return directUrl;

  // Prioritas Kedua: Jika API menggunakan format routing internal
  if (bookId && episode.episodeId) {
    return `${BASE_URL}/play?bookId=${bookId}&episodeId=${episode.episodeId}&lang=in`;
  }
  
  return "";
}

// 3. Mengambil Sinopsis/Deskripsi
export function extractSynopsis(item: any): string {
  if (!item) return "Sinopsis tidak tersedia.";
  return item.introduction || item.synopsis || item.description || item.intro || "Sinopsis tidak tersedia.";
}

// 4. Membaca Daftar Array (Untuk Episode atau Daftar Drama)
export function extractItems(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // Mencari letak array di dalam tumpukan objek JSON
  const list = data.data?.records || data.records || data.data?.list || data.list || data.data?.episodes || data.episodes || data.data || [];
  
  return Array.isArray(list) ? list : [];
}

// ---------------------------------------------------------
// SPECIFIC ENDPOINT FETCHERS (Digunakan oleh React Query)
// ---------------------------------------------------------

export async function fetchHomepageData() {
  return apiFetch('/homepage', { page: '1' });
}

export async function fetchDramaDetail(bookId: string) {
  return apiFetch('/detail', { bookId });
}

export async function fetchEpisodes(bookId: string) {
  return apiFetch('/allepisode', { bookId });
}
