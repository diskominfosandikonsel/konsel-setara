<template>
  <q-layout view="hHh lpR fFf" style="background-color: #f6f6f6">
    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon
              name="r_chevron_left"
              size="35px"
              color="black"
              class="cursor-pointer"
              @click="goBack"
            />
          </q-avatar>
          <span class="sapa_title">Data Izin Penelitian</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md mulish">
        <div class="search-bar">
          <q-input
            v-model="cari"
            dense
            outlined
            placeholder="Cari data..."
            debounce="500"
            @update:model-value="onSearch"
          >
            <template v-slot:append>
              <q-icon name="search" size="17px" />
            </template>

            <template v-slot:append v-if="cari">
              <q-icon
                name="close"
                class="cursor-pointer"
                size="17px"
                @click="clearSearch"
              />
            </template>
          </q-input>
        </div>
        <div v-if="skeletonLoading" class="q-mt-sm">
          <q-skeleton v-for="n in 8" :key="n" height="100px" class="q-mb-sm" />
        </div>

        <div v-else-if="izinList.length">
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-12" v-for="item in izinList" :key="item.id">
              <q-card
                class="izin-card cursor-pointer"
                clickable
                v-ripple
                @click="openDetail(item)"
              >
                <q-card-section class="content-wrapper">
                  <!-- CONTENT -->
                  <div class="text-content">
                    <div class="title two_line">
                      {{ item.judul }}
                    </div>

                    <div class="row justify-between items-end q-mt-xs">
                      <!-- LEFT META -->
                      <div>
                        <div class="meta row items-center">
                          <q-icon
                            name="person"
                            size="14px"
                            class="icon-muted"
                          />
                          <span class="q-ml-xs">{{ item.createBy }}</span>
                        </div>

                        <div class="meta row items-center">
                          <q-icon
                            name="schedule"
                            size="14px"
                            class="icon-muted"
                          />
                          <span class="q-ml-xs">
                            {{ formatDates(item.createAt) }}
                          </span>
                        </div>
                      </div>

                      <!-- RIGHT ICON -->
                      <q-fab
                        fab-mini
                        color="amber"
                        text-color="black"
                        icon="more_vert"
                        direction="left"
                        padding="xs"
                      >
                        <q-fab-action
                          color="amber"
                          text-color="black"
                          @click="deleteItem(item)"
                          icon="mail"
                          padding="xs"
                        />
                        <q-fab-action
                          color="amber"
                          text-color="black"
                          @click="editItem(item)"
                          icon="alarm"
                          padding="xs"
                        />
                      </q-fab>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-infinite-scroll
            @load="onLoad"
            :offset="100"
            :disable="allDataLoaded"
          >
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner />
              </div>
            </template>
          </q-infinite-scroll>
        </div>

        <div v-else class="column flex-center text-center" style="height: 75vh">
          <q-icon name="search_off" size="60px" color="grey-4" />
          <div class="text-grey q-mt-sm">Data tidak ditemukan</div>
        </div>

        <q-dialog
          v-model="showPdf"
          maximized
          transition-show="slide-up"
          transition-hide="slide-down"
          @hide="clearPdf"
          persistent
        >
          <q-card class="bg-white column fit">
            <!-- HEADER -->
            <q-toolbar class="bg-white toolbar-bordered">
              <q-icon
                flat
                round
                name="eva-close-circle-outline"
                color="red"
                size="25px"
                class="cursor-pointer"
                @click="showPdf = false"
              />

              <q-toolbar-title class="text-subtitle2 text-weight-medium">
                {{ selectedItem?.judul || "Detail Penelitian" }}
              </q-toolbar-title>

              <q-icon
                flat
                round
                name="eva-arrow-circle-down-outline"
                color="light-blue"
                size="25px"
                class="cursor-pointer"
                @click="downloadPdf"
              />
            </q-toolbar>

            <!-- CONTENT (scrollable) -->
            <div class="col scroll bg-white">
              <div v-if="pdfLoading" class="pdf-loading-overlay">
                <q-spinner size="50px" color="primary" />
                <div class="q-mt-sm text-grey">Memuat dokumen...</div>
              </div>

              <div ref="pdfContainer" class="pdf-container"></div>
            </div>
          </q-card>
        </q-dialog>
        <q-dialog
          v-model="formDialog"
          maximized
          transition-show="slide-up"
          transition-hide="slide-down"
          persistent
        >
          <q-card class="column fit">
            <!-- HEADER -->
            <q-toolbar class="bg-white text-black toolbar-bordered">
              <q-btn flat round icon="arrow_back" v-close-popup />

              <q-toolbar-title class="text-subtitle2">
                {{
                  mode === "add"
                    ? "Tambah Data"
                    : mode === "edit"
                      ? "Edit Data"
                      : "Detail Penelitian"
                }}
              </q-toolbar-title>

              <!-- ACTION -->
              <q-btn
                v-if="mode !== 'detail'"
                flat
                icon="check"
                color="primary"
                @click="submitForm"
              />
            </q-toolbar>

            <!-- CONTENT -->
            <div class="col scroll">
              <div class="form-wrapper">
                <q-stepper
                  v-model="step"
                  vertical
                  animated
                  flat
                  class="regis-stepper"
                >
                  <!-- STEP 1 -->
                  <q-step
                    :name="1"
                    title="Identitas"
                    icon="person"
                    :done="step > 1"
                  >
                    <div class="step-card">
                      <div class="step-title">Data Diri</div>

                      <q-input
                        v-model="form.nama"
                        label="Nama"
                        outlined
                        dense
                        readonly
                      />
                      <q-input
                        v-model="form.alamat"
                        label="Alamat"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="form.hp"
                        label="No HP"
                        outlined
                        dense
                        readonly
                      />
                      <q-input
                        v-model="form.email"
                        label="Email"
                        outlined
                        dense
                        readonly
                      />
                      <q-input v-model="form.nik" label="NIK" outlined dense />

                      <q-file
                        v-model="form.ktp"
                        label="Upload KTP (PDF)"
                        outlined
                        dense
                        accept=".pdf"
                      />

                      <q-stepper-navigation>
                        <q-btn
                          color="primary"
                          label="Lanjut"
                          @click="step = 2"
                          :disable="!isStep1Valid"
                          class="full-width"
                        />
                      </q-stepper-navigation>
                    </div>
                  </q-step>

                  <!-- STEP 2 -->
                  <q-step
                    :name="2"
                    title="Pengantar"
                    icon="description"
                    :done="step > 2"
                  >
                    <div class="step-card">
                      <div class="step-title">Surat Pengantar</div>

                      <q-input
                        v-model="form.nomorP"
                        label="Nomor Surat"
                        outlined
                        dense
                      />

                      <q-input
                        v-model="form.tanggalP"
                        label="Tanggal"
                        outlined
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event">
                            <q-popup-proxy cover>
                              <q-date v-model="form.tanggalP" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <q-input
                        v-model="form.namaP"
                        label="Penandatangan"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="form.jabatanP"
                        label="Jabatan"
                        outlined
                        dense
                      />

                      <q-file
                        v-model="form.suratPeng"
                        label="Upload Surat Pengantar"
                        outlined
                        dense
                        accept=".pdf"
                      />

                      <q-stepper-navigation class="row q-col-gutter-sm">
                        <q-btn
                          color="primary"
                          label="Lanjut"
                          @click="step = 3"
                          :disable="!isStep2Valid"
                          class="col"
                        />
                        <q-btn
                          flat
                          label="Kembali"
                          @click="step = 1"
                          class="col"
                        />
                      </q-stepper-navigation>
                    </div>
                  </q-step>

                  <!-- STEP 3 -->
                  <q-step
                    :name="3"
                    title="Rekomendasi"
                    icon="assignment"
                    :done="step > 3"
                  >
                    <div class="step-card">
                      <div class="step-title">Surat Rekomendasi</div>

                      <q-input
                        v-model="form.nomorR"
                        label="Nomor Surat"
                        outlined
                        dense
                      />

                      <q-input
                        v-model="form.tanggalR"
                        label="Tanggal"
                        outlined
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event">
                            <q-popup-proxy cover>
                              <q-date v-model="form.tanggalR" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <q-input
                        v-model="form.namaR"
                        label="Penandatangan"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="form.jabatanR"
                        label="Jabatan"
                        outlined
                        dense
                      />

                      <q-file
                        v-model="form.suratRek"
                        label="Upload Surat Rekomendasi"
                        outlined
                        dense
                        accept=".pdf"
                      />

                      <q-stepper-navigation class="row q-col-gutter-sm">
                        <q-btn
                          color="primary"
                          label="Lanjut"
                          @click="step = 4"
                          :disable="!isStep3Valid"
                          class="col"
                        />
                        <q-btn
                          flat
                          label="Kembali"
                          @click="step = 2"
                          class="col"
                        />
                      </q-stepper-navigation>
                    </div>
                  </q-step>

                  <!-- STEP 4 -->
                  <q-step :name="4" title="Penelitian" icon="science">
                    <div class="step-card">
                      <div class="step-title">Detail Penelitian</div>

                      <q-select
                        v-model="form.kategori_id"
                        :options="list_kategori"
                        option-label="uraian"
                        option-value="kategori_id"
                        emit-value
                        map-options
                        label="Kategori"
                        outlined
                        dense
                      />

                      <q-input
                        v-model="form.judul"
                        label="Judul"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="form.lokasi"
                        label="Lokasi"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="form.tujuan"
                        label="Tujuan"
                        outlined
                        dense
                      />
                      <q-input
                        v-model="form.lingkup"
                        label="Lingkup"
                        outlined
                        dense
                      />

                      <q-input
                        v-model="form.tgl_mulai"
                        label="Mulai"
                        outlined
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event">
                            <q-popup-proxy cover>
                              <q-date v-model="form.tgl_mulai" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <q-input
                        v-model="form.tgl_selesai"
                        label="Selesai"
                        outlined
                        dense
                      >
                        <template v-slot:prepend>
                          <q-icon name="event">
                            <q-popup-proxy cover>
                              <q-date v-model="form.tgl_selesai" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>

                      <q-file
                        v-model="form.filePro"
                        label="Upload Proposal"
                        outlined
                        dense
                        accept=".pdf"
                      />

                      <q-stepper-navigation class="row q-col-gutter-sm">
                        <q-btn
                          color="primary"
                          label="Simpan"
                          icon="check"
                          @click="submitAll"
                          :disable="!isStep4Valid"
                          class="col"
                        />
                        <q-btn
                          flat
                          label="Kembali"
                          @click="step = 3"
                          class="col"
                        />
                      </q-stepper-navigation>
                    </div>
                  </q-step>
                </q-stepper>
              </div>
            </div>
          </q-card>
        </q-dialog>
        <q-dialog
          v-model="detailDialog"
          maximized
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="column fit bg-grey-1">
            <!-- HEADER -->
            <q-toolbar class="bg-white text-black toolbar-bordered">
              <q-btn flat round icon="arrow_back" v-close-popup />

              <q-toolbar-title class="text-subtitle2">
                Detail Penelitian
              </q-toolbar-title>
            </q-toolbar>

            <!-- CONTENT -->
            <div class="col scroll q-pa-md">
              <!-- IDENTITAS -->
              <div class="detail-card">
                <div class="col text-center q-mb-md q-mt-sm">
                  <div class="text-subtitle1 text-weight-bold">
                    {{ selectedItem.judul }}
                  </div>
                  <div class="text-caption text-grey-6 text-weight-medium">
                    <!-- {{ selectedItem.createBy }} -->
                    Kiken S Batara
                  </div>
                  <q-badge
                    :color="getStatusColor(selectedItem.status)"
                    text-color="white"
                    class="q-px-sm q-py-xs"
                  >
                    {{ selectedItem.status || "unknown" }}
                  </q-badge>
                </div>
                <div class="section-title">
                  <q-icon name="person" size="16px" /> Identitas
                </div>

                <div class="detail-item">
                  <span>Nama</span>
                  <b>{{ selectedItem.nama }}</b>
                </div>

                <div class="detail-item">
                  <span>Email</span>
                  <b>{{ selectedItem.email }}</b>
                </div>

                <div class="detail-item">
                  <span>No HP</span>
                  <b>{{ selectedItem.hp }}</b>
                </div>

                <div class="detail-item">
                  <span>Alamat</span>
                  <b>{{ selectedItem.alamat }}</b>
                </div>
              </div>

              <!-- PENGANTAR -->
              <div class="detail-card">
                <div class="section-title">
                  <q-icon name="description" size="16px" /> Pengantar
                </div>

                <div class="detail-item">
                  <span>Nomor</span>
                  <b>{{ selectedItem.nomorP || "-" }}</b>
                </div>

                <div class="detail-item">
                  <span>Tanggal</span>
                  <b>{{ formatDates(selectedItem.tanggalP) }}</b>
                </div>

                <div class="detail-item">
                  <span>Penandatangan</span>
                  <b>{{ selectedItem.namaP }}</b>
                </div>
              </div>

              <!-- REKOMENDASI -->
              <div class="detail-card">
                <div class="section-title">
                  <q-icon name="assignment" size="16px" /> Rekomendasi
                </div>

                <div class="detail-item">
                  <span>Nomor</span>
                  <b>{{ selectedItem.nomorR || "-" }}</b>
                </div>

                <div class="detail-item">
                  <span>Tanggal</span>
                  <b>{{ formatDates(selectedItem.tanggalR) }}</b>
                </div>

                <div class="detail-item">
                  <span>Penandatangan</span>
                  <b>{{ selectedItem.namaR }}</b>
                </div>
              </div>

              <!-- PENELITIAN -->
              <div class="detail-card">
                <div class="section-title">
                  <q-icon name="science" size="16px" /> Penelitian
                </div>

                <div class="detail-item">
                  <span>Lokasi</span>
                  <b>{{ selectedItem.lokasi }}</b>
                </div>

                <div class="detail-item">
                  <span>Tujuan</span>
                  <b>{{ selectedItem.tujuan }}</b>
                </div>

                <div class="detail-item">
                  <span>Lingkup</span>
                  <b>{{ selectedItem.lingkup }}</b>
                </div>

                <div class="detail-item">
                  <span>Periode</span>
                  <b>
                    {{ formatDates(selectedItem.tgl_mulai) }} -
                    {{ formatDates(selectedItem.tgl_selesai) }}
                  </b>
                </div>
              </div>

              <!-- ACTION -->
              <div class="q-mt-md">
                <q-btn
                  label="Lihat Dokumen PDF"
                  icon="picture_as_pdf"
                  color="primary"
                  unelevated
                  class="full-width q-mb-sm"
                  @click="openPdfFromDetail"
                />

                <q-btn
                  label="Edit Data"
                  icon="edit"
                  color="orange"
                  flat
                  class="full-width"
                  @click="editItem(selectedItem)"
                />
              </div>
            </div>
          </q-card>
        </q-dialog>
        <q-page-sticky position="bottom-right" :offset="[16, 16]">
          <q-btn fab icon="add" color="primary" @click="onAdd" />
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useEridaStore } from "stores/erida";
import { getFileErida, formatDates } from "src/utils/helper";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const pdfCache = new Map();

export default {
  name: "EridaIzin",
  data() {
    return {
      erida: useEridaStore(),

      izinList: [],
      page: 1,
      lastPage: 1,
      allDataLoaded: false,
      detailDialog: false,
      cari: "",
      skeletonLoading: true,
      formatDates: formatDates,
      showPdf: false,
      selectedItem: null,
      pdfLoading: false,
      pagePlaceholders: [],
      list_kategori: [],
      formDialog: false,
      mode: "add", // add | edit | detail
      step: 1,
      form: {
        id: null,
        nama: "",
        alamat: "",
        hp: "",
        email: "",
        nik: "",
        ktp: null,
        judul: "",
        lokasi: "",
        tujuan: "",
        lingkup: "",
        filePro: null,
        kategori_id: null,
        nomorP: "",
        tanggalP: "",
        namaP: "",
        jabatanP: "",
        suratPeng: null,

        nomorR: "",
        tanggalR: "",
        namaR: "",
        jabatanR: "",
        suratRek: null,

        tgl_mulai: "",
        tgl_selesai: "",
      },
      list_kategori: [],
    };
  },

  computed: {
    isStep1Valid() {
      return (
        this.form.nama && this.form.alamat && this.form.nik && this.form.ktp
      );
    },
    isStep2Valid() {
      return this.form.nomorP && this.form.suratPeng;
    },
    isStep3Valid() {
      return this.form.nomorR && this.form.suratRek;
    },
    isStep4Valid() {
      return this.form.judul && this.form.kategori_id && this.form.filePro;
    },
  },

  methods: {
    goBack() {
      this.$router.back();
    },

    openDetail(item) {
      this.selectedItem = item;
      this.mode = "detail";
      this.detailDialog = true;
    },

    initUserData() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user || !user._id) return;

        this.form.nama = user.nama ?? "";
        this.form.hp = user.hp ?? "";
        this.form.email = user.email ?? "";
      } catch (err) {
        console.error("USER PARSE ERROR:", err);
      }
    },

    onAdd() {
      this.mode = "add";
      this.resetForm();
      this.initUserData();
      this.step = 1;
      this.formDialog = true;
    },

    async loadKategori() {
      await this.erida.getKategori();
      this.list_kategori = this.erida.kategori;
    },

    // async goDetail(item) {
    //   this.selectedItem = item;
    //   this.showPdf = true;

    //   this.$nextTick(() => {
    //     this.loadPdf(item);
    //   });
    // },

    openPdfFromDetail() {
      this.detailDialog = false;
      this.showPdf = true;

      this.$nextTick(() => {
        this.loadPdf(this.selectedItem);
      });
    },

    resetForm() {
      this.form = {
        id: null,
        nama: "",
        alamat: "",
        hp: "",
        email: "",
        nik: "",
        ktp: null,
        judul: "",
        lokasi: "",
        tujuan: "",
        lingkup: "",
        filePro: null,
        kategori_id: null,
      };
    },

    submitForm() {
      if (this.mode === "add") {
        this.addData();
      } else {
        this.editData();
      }
      this.formDialog = false;
    },

    async loadData(reset = false) {
      if (this.erida.loading) return;

      if (reset) {
        this.page = 1;
        this.izinList = [];
        this.allDataLoaded = false;
        this.erida.izin = [];
      }

      const payload = {
        data_ke: this.page,
        cari_value: this.cari,
      };

      await this.erida.fetchIzin(payload, !reset);

      const totalPage = this.erida.dataLastPage || 1;
      this.lastPage = totalPage;

      this.izinList = [...this.erida.izin];

      if (this.page >= this.lastPage || this.erida.lastFetchedCount === 0) {
        this.allDataLoaded = true;
      }

      this.skeletonLoading = false;
    },

    getStatusColor(status) {
      switch (status) {
        case "proses":
          return "orange";
        case "selesai":
          return "green";
        case "ditolak":
          return "red";
        default:
          return "grey";
      }
    },

    async onLoad(index, done) {
      if (this.allDataLoaded) {
        done(true);
        return;
      }

      this.page++;

      await this.loadData();

      this.allDataLoaded ? done(true) : done();
    },

    async onSearch() {
      if (this._lastSearch === this.cari) return;

      this._lastSearch = this.cari;
      this.generateCacheKey();

      this.skeletonLoading = true;
      await this.loadData(true);
    },

    async submitAll() {
      try {
        // 🔥 VALIDASI FINAL (semua step)
        if (
          !this.isStep1Valid ||
          !this.isStep2Valid ||
          !this.isStep3Valid ||
          !this.isStep4Valid
        ) {
          this.$q.notify({
            type: "warning",
            message: "Lengkapi semua data terlebih dahulu",
          });
          return;
        }

        this.$q.loading.show();

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // 🔥 GUNAKAN FORMDATA (karena ada file)
        const formData = new FormData();

        // =====================
        // IDENTITAS
        // =====================
        formData.append("user_id", user._id);
        formData.append("nama", this.form.nama);
        formData.append("email", this.form.email);
        formData.append("hp", this.form.hp);
        formData.append("alamat", this.form.alamat);
        formData.append("nik", this.form.nik);

        if (this.form.ktp) {
          formData.append("ktp", this.form.ktp);
        }

        // =====================
        // PENGANTAR
        // =====================
        formData.append("nomor_pengantar", this.form.nomorP || "");
        formData.append("tanggal_pengantar", this.form.tanggalP || "");
        formData.append("nama_pengantar", this.form.namaP || "");
        formData.append("jabatan_pengantar", this.form.jabatanP || "");

        if (this.form.suratPeng) {
          formData.append("file_pengantar", this.form.suratPeng);
        }

        // =====================
        // REKOMENDASI
        // =====================
        formData.append("nomor_rekomendasi", this.form.nomorR || "");
        formData.append("tanggal_rekomendasi", this.form.tanggalR || "");
        formData.append("nama_rekomendasi", this.form.namaR || "");
        formData.append("jabatan_rekomendasi", this.form.jabatanR || "");

        if (this.form.suratRek) {
          formData.append("file_rekomendasi", this.form.suratRek);
        }

        // =====================
        // PENELITIAN
        // =====================
        formData.append("kategori_id", this.form.kategori_id || "");
        formData.append("judul", this.form.judul || "");
        formData.append("lokasi", this.form.lokasi || "");
        formData.append("tujuan", this.form.tujuan || "");
        formData.append("lingkup", this.form.lingkup || "");
        formData.append("tgl_mulai", this.form.tgl_mulai || "");
        formData.append("tgl_selesai", this.form.tgl_selesai || "");

        if (this.form.filePro) {
          formData.append("proposal", this.form.filePro);
        }

        // =====================
        // HIT API (SESUAIKAN)
        // =====================
        await this.erida.addIzin(formData);

        // =====================
        // SUCCESS
        // =====================
        this.$q.notify({
          type: "positive",
          message: "Data berhasil disimpan",
        });

        this.formDialog = false;
        this.step = 1;
        this.resetForm();
        this.loadData(true);
      } catch (err) {
        console.error("SUBMIT ERROR:", err);

        this.$q.notify({
          type: "negative",
          message: "Gagal menyimpan data",
        });
      } finally {
        this.$q.loading.hide();
      }
    },

    generateCacheKey() {
      return `izin_${this.cari || "all"}`;
    },

    clearSearch() {
      this.cari = "";
      this.onSearch();
    },

    async loadPdf(item) {
      try {
        this.pdfLoading = true; // ✅ start loading

        const container = this.$refs.pdfContainer;
        container.innerHTML = "";

        const url = getFileErida(item.file);

        let pdf;

        if (pdfCache.has(url)) {
          pdf = pdfCache.get(url);
        } else {
          const loadingTask = pdfjsLib.getDocument(url);
          pdf = await loadingTask.promise;
          pdfCache.set(url, pdf);
        }

        this.pagePlaceholders = Array.from({ length: pdf.numPages });

        for (let i = 1; i <= pdf.numPages; i++) {
          const wrapper = document.createElement("div");
          wrapper.className = "pdf-page-wrapper";

          const skeleton = document.createElement("div");
          skeleton.className = "pdf-skeleton";

          wrapper.appendChild(skeleton);
          container.appendChild(wrapper);

          this.renderPage(pdf, i, wrapper, skeleton);
        }
      } catch (err) {
        console.error("PDF ERROR:", err);
      } finally {
        this.pdfLoading = false; // ✅ stop loading
      }
    },

    async renderPage(pdf, pageNumber, wrapper, skeleton) {
      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({ scale: 1.2 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      // ✅ replace skeleton with canvas
      wrapper.innerHTML = "";
      wrapper.appendChild(canvas);
    },

    downloadPdf() {
      if (!this.selectedItem?.file) return;

      const url = getFileErida(this.selectedItem.file);

      const link = document.createElement("a");
      link.href = url;
      link.download = this.selectedItem.judul || "file.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    clearPdf() {
      const container = this.$refs.pdfContainer;
      if (container) container.innerHTML = "";
    },
  },

  mounted() {
    this.loadData(true);
    this.loadKategori();
  },
};
</script>

<style>
.search-bar {
  /* z-index: 5; */
  background: #f6f6f6;
}

.izin-card {
  position: relative;
  border-radius: 16px;
  background: white;
  overflow: hidden;

  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.izin-card:active {
  transform: scale(0.97);
}

/* CONTENT */
.content-wrapper {
  display: flex;
  align-items: flex-start;
  padding-left: 10px;
}

.text-content {
  flex: 1;
  padding-left: 10px;
}

/* TITLE */
.title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

/* META */
.meta {
  font-size: 12px;
  color: #6b7280;
}

/* ICON STYLE */
.icon-muted {
  color: #9ca3af;
}

.two_line {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toolbar-bordered {
  border-bottom: 1px solid #e5e7eb;
  /* soft gray */
}

.pdf-container {
  padding: 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.pdf-page-wrapper {
  margin-bottom: 12px;
  position: relative;
}

.pdf-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.pdf-skeleton {
  width: 100%;
  height: 400px;
  border-radius: 8px;

  background: linear-gradient(90deg, #eeeeee 25%, #f5f5f5 50%, #eeeeee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

canvas {
  width: 100%;
  display: block;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.col.scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.regis-stepper {
  background: transparent;
}

.step-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.q-stepper__tab {
  border-radius: 12px;
}

.q-stepper__dot {
  transform: scale(0.9);
}

.form-wrapper {
  padding: 16px;
  padding-bottom: 40px;
}

.step-card {
  background: white;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.regis-stepper {
  background: transparent;
}

.step-card div {
  font-size: 13px;
  color: #374151;
}

.detail-hero {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
}

.detail-card {
  background: white;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 12px;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;

  display: flex;
  align-items: center;
  gap: 6px;

  margin-bottom: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px dashed #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item span {
  color: #6b7280;
}
</style>
