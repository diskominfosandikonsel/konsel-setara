import { apiErida } from "src/api/erida";

const base = "/publish_manis";

export default {
  getRiset() {
    return apiErida.get(base + "/getRiset");
  },

  getDataRiset(payload) {
    return apiErida.post(base + "/riset", payload);
  },

  getKrenova() {
    return apiErida.get(base + "/getKrenova");
  },

  getDataKrenova(payload) {
    return apiErida.post(base + "/krenova", payload);
  },

  getAksi() {
    return apiErida.get(base + "/getAksi");
  },

  getDataAksi(payload) {
    return apiErida.post(base + "/aksi", payload);
  },

  getTeknologi() {
    return apiErida.get(base + "/getTeknologi");
  },

  getDataTeknologi(payload) {
    return apiErida.post(base + "/teknologi", payload);
  },

  getHaki() {
    return apiErida.get(base + "/getHaki");
  },

  getDataHaki(payload) {
    return apiErida.post(base + "/haki", payload);
  },

  getPenelitian() {
    return apiErida.get(base + "/getPenelitian");
  },

  getDataPenelitian(payload) {
    return apiErida.post(base + "/penelitian", payload);
  },

  getIid() {
    return apiErida.get(base + "/iid");
  },

  getIpkd() {
    return apiErida.get(base + "/ipkd");
  },

  getIdsd() {
    return apiErida.get(base + "/idsd");
  },

  getTema(payload) {
    return apiErida.post(base + "/tema", payload);
  },

  addTema(payload) {
    return apiErida.post("web_publish_tema/addData", payload);
  },

  getIzin(payload) {
    return apiErida.post("server_penelitian/view", payload);
  },

  getKategori() {
    return apiErida.get("server_penelitian/getKategori");
  },

  addIzin(data) {
    return apiErida.post("server_penelitian/createIzin", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  addSurvey(data) {
    return apiErida.post("web_publish_ikm/addData", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  updateSurveyStatus(id) {
    return apiErida.post(
      "server_penelitian/addSurvey",
      {
        ididid: id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  uploadLaporan(formData) {
    return apiErida.post("server_penelitian/editLaporan", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  getInovasi(payload) {
    return apiErida.post("server_krenova/view", payload);
  },

  addInovasi(data) {
    return apiErida.post("server_krenova/addData", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  editInovasi(data) {
    return apiErida.post("server_krenova/editData", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteInovasi(data) {
    return apiErida.post("server_krenova/removeData", {
      id: data.id,
      file: data.file,
    });
  },

  getDokumen(payload) {
    return apiErida.post("web_dokumen/view", payload);
  },

  getImage(payload) {
    return apiErida.post("web_publish_kegiatan/foto", payload);
  },

  getTahun() {
    return apiErida.get("server_tahun");
  },

  getBeritaPage(payload) {
    return apiErida.post("web_publish_berita/viewPage", payload);
  },

  getBerita(payload) {
    return apiErida.post("web_publish_berita/view", payload);
  },

  getDetailBerita(payload) {
    return apiErida.post("web_publish_berita/isi_berita", payload);
  },
};
