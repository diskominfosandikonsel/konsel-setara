// Mengambil koneksi dbPerak dari file konfigurasi database kamu
const dbPerak = require('../db/MySql/perak'); 

const syncToPerak = (data, hashedPw, userId) => {
  const insertPerak = `
    INSERT INTO users 
    (id, username, nama, hp, email, password, menu_klp, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  dbPerak.query(insertPerak, [
    userId,
    data.username,
    data.nama,
    data.hp,
    data.email,
    hashedPw,
    3 // Default menu_klp
  ], (err, result) => {
    if (err) {
      // Kita gunakan console.error agar terlihat jelas di log jika terjadi kegagalan server
      console.error("--- LOG ERROR SYNC PERAK ---");
      console.error("User:", data.username);
      console.error("Pesan:", err.message);
      console.error("-----------------------------");
    } else {
      console.log(`[SYNC SUCCESS] Data user ${data.username} berhasil disalin ke Server Perak.`);
    }
  });
};

// Export fungsi agar bisa digunakan di router/controller
module.exports = {
  syncToPerak
};