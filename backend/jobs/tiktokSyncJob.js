const cron = require('node-cron');
const tiktokService = require('../services/tiktokService');

/**
 * Inisialisasi background cron job untuk sinkronisasi TikTok
 * Berjalan otomatis setiap 2 jam (menit ke-0 pada jam genap)
 */
function initTikTokSyncJob() {
  const cronSchedule = '0 */2 * * *'; // Setiap 2 jam

  console.log(`⏰ [TikTokCron] Penjadwal sinkronisasi TikTok aktif (Jadwal: ${cronSchedule})`);

  cron.schedule(cronSchedule, async () => {
    console.log(`⏰ [TikTokCron] [${new Date().toISOString()}] Memulai sinkronisasi otomatis berkala...`);
    try {
      await tiktokService.syncAllAccounts();
      console.log('✅ [TikTokCron] Sinkronisasi otomatis selesai dengan sukses.');
    } catch (err) {
      console.error('❌ [TikTokCron] Sinkronisasi otomatis gagal:', err.message);
    }
  });

  // Opsional: Jalankan sinkronisasi awal 15 detik setelah server menyala
  setTimeout(async () => {
    try {
      console.log('🚀 [TikTokCron] Menjalankan pengecekan sinkronisasi awal server boot...');
      await tiktokService.syncAllAccounts();
    } catch (e) {
      console.warn('⚠️ [TikTokCron] Pengecekan awal server boot gagal (bisa dicoba ulang via cron):', e.message);
    }
  }, 15000);
}

module.exports = { initTikTokSyncJob };
