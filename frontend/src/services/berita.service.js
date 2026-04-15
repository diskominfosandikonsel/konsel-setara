import { apiBerita } from '../api/apiBerita'

export const BeritaService = {
  async getBerita(payload = {}) {
    // Karena CORS peladen telah Anda bebaskan, kita rekatkan kembali pengiriman
    // murni JSON agar server ExpressJS bisa membacanya tanpa NaN/Undefined.
    const URL_BERITA = 'https://server-web.konaweselatankab.go.id/api/v1/web_publish_berita/';

    const response = await fetch(URL_BERITA + 'view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const res_data = await response.json();
    return { data: res_data };
  }

}