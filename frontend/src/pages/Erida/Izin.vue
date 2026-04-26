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
                @click="goDetail(item)"
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
                            {{ formatDate(item.createAt) }}
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
            <div class="col scroll q-pa-md">
              <!-- IDENTITAS -->
              <div class="text-subtitle2 q-mb-sm">Identitas</div>

              <q-input
                v-model="form.nama"
                label="Nama"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.alamat"
                label="Alamat"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.hp"
                label="HP"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.email"
                label="Email"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.nik"
                label="NIK"
                outlined
                dense
                :readonly="mode === 'detail'"
              />

              <q-file
                v-if="mode !== 'detail'"
                v-model="form.ktp"
                label="Upload KTP"
                outlined
                dense
              />

              <!-- PENELITIAN -->
              <div class="text-subtitle2 q-mt-md q-mb-sm">Penelitian</div>

              <q-select
                v-model="form.kategori_id"
                :options="list_kategori"
                option-label="uraian"
                label="Kategori"
                outlined
                dense
                :disable="mode === 'detail'"
              />

              <q-input
                v-model="form.judul"
                label="Judul"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.lokasi"
                label="Lokasi"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.tujuan"
                label="Tujuan"
                outlined
                dense
                :readonly="mode === 'detail'"
              />
              <q-input
                v-model="form.lingkup"
                label="Lingkup"
                outlined
                dense
                :readonly="mode === 'detail'"
              />

              <q-file
                v-if="mode !== 'detail'"
                v-model="form.filePro"
                label="Upload Proposal"
                outlined
                dense
              />

              <!-- ACTION BUTTONS (DETAIL MODE) -->
              <div v-if="mode === 'detail'" class="q-mt-lg">
                <q-btn
                  label="Lihat PDF"
                  icon="description"
                  color="primary"
                  class="full-width q-mb-sm"
                  @click="openPdfFromDetail"
                />

                <q-btn
                  label="Edit Data"
                  icon="edit"
                  color="orange"
                  class="full-width"
                  @click="mode = 'edit'"
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
import { getFileErida, formatDate } from "src/utils/helper";

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
      cari: "",
      skeletonLoading: true,
      formatDate: formatDate,
      showPdf: false,
      selectedItem: null,
      pdfLoading: false,
      pagePlaceholders: [],
      formDialog: false,
      mode: "add", // add | edit | detail
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
      },
      list_kategori: [],
    };
  },

  methods: {
    goBack() {
      this.$router.back();
    },

    onAdd() {
      this.mode = "add";
      this.resetForm();
      this.formDialog = true;
    },

    async goDetail(item) {
      this.selectedItem = item;
      this.showPdf = true;

      this.$nextTick(() => {
        this.loadPdf(item);
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

/* 🔥 DOCUMENT ICON BADGE */
.doc-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;

  flex-shrink: 0;
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
</style>
