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
                          <span class="q-ml-xs">{{ item.nama }}</span>
                        </div>

                        <div class="meta row items-center">
                          <q-icon
                            name="calendar_month"
                            size="14px"
                            class="icon-muted"
                          />
                          <span class="q-ml-xs">
                            {{ formatDates(item.createAt) }}
                          </span>
                        </div>
                      </div>

                      <!-- RIGHT ICON -->
                      <div @click.stop>
                        <!-- 🔥 DITERIMA (single button, no FAB) -->
                        <q-btn
                          v-if="item.status === 'diterima'"
                          round
                          dense
                          icon="checklist"
                          color="green"
                          text-color="white"
                          @click.stop="openSurvey(item)"
                        />

                        <!-- 🔥 SELESAI (static icon, no click) -->
                        <q-icon
                          v-else-if="item.status === 'publish'"
                          name="verified"
                          color="blue"
                          size="35px"
                        />

                        <!-- 🔥 MULTI ACTION FAB -->
                        <q-fab
                          v-else
                          fab-mini
                          :color="getFabConfig(item.status).color"
                          text-color="white"
                          :class="'fab-' + item.status"
                          :icon="getFabConfig(item.status).icon"
                          direction="left"
                          padding="xs"
                        >
                          <q-fab-action
                            v-for="(action, i) in getFabActions(item)"
                            :key="i"
                            :icon="action.icon"
                            :color="action.color"
                            text-color="white"
                            @click.stop="action.handler"
                            padding="xs"
                          />
                        </q-fab>
                      </div>
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
          v-model="surveyDialog"
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
                Survey Kepuasan
              </q-toolbar-title>

              <q-btn
                flat
                icon="send"
                color="primary"
                :loading="btn_add"
                @click="submitSurvey"
              />
            </q-toolbar>

            <!-- CONTENT -->
            <div class="col scroll q-pa-md">
              <!-- BIODATA -->
              <div class="step-card">
                <div class="step-title">Identitas</div>

                <q-input
                  v-model="ikm.nama"
                  label="Nama"
                  outlined
                  dense
                  readonly
                />
                <q-input
                  v-model="ikm.email"
                  label="Email"
                  outlined
                  dense
                  readonly
                />

                <q-input v-model="ikm.umur" label="Umur" outlined dense />
                <q-input
                  v-model="ikm.pendidikan"
                  label="Pendidikan"
                  outlined
                  dense
                />
                <q-input
                  v-model="ikm.pekerjaan"
                  label="Pekerjaan"
                  outlined
                  dense
                />
              </div>

              <!-- PERTANYAAN -->
              <div class="step-card">
                <div class="step-title">Penilaian</div>

                <q-select
                  v-model="ikm.persyaratan"
                  emit-value
                  map-options
                  :options="persyaratan"
                  label="Persyaratan"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.prosedur"
                  emit-value
                  map-options
                  :options="prosedur"
                  label="Prosedur"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.pelayanan"
                  emit-value
                  map-options
                  :options="pelayanan"
                  label="Pelayanan"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.tarif"
                  emit-value
                  map-options
                  :options="tarif"
                  label="Tarif"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.ketentuan"
                  emit-value
                  map-options
                  :options="ketentuan"
                  label="Ketentuan"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.kompetensi"
                  emit-value
                  map-options
                  :options="kompetensi"
                  label="Kompetensi"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.sikap"
                  emit-value
                  map-options
                  :options="sikap"
                  label="Sikap Petugas"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.maklumat"
                  emit-value
                  map-options
                  :options="maklumat"
                  label="Maklumat"
                  outlined
                  dense
                />
                <q-select
                  v-model="ikm.pengaduan"
                  emit-value
                  map-options
                  :options="pengaduan"
                  label="Penanganan Pengaduan"
                  outlined
                  dense
                />
              </div>
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
            <div class="col scroll q-px-md">
              <!-- HEADER -->
              <div class="card-header text-center">
                <div class="text-subtitle1 text-weight-bold">
                  {{ selectedItem.judul }}
                </div>

                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ selectedItem.nama }}
                </div>

                <div
                  class="status-pill q-mt-sm"
                  :class="getStatusClass(selectedItem.status)"
                >
                  Status Permohonan : {{ selectedItem.status || "Unknown" }}
                </div>
              </div>

              <div class="section" v-if="selectedItem.status == 'publish'">
                <div class="row justify-between">
                  <div class="section-title">Laporan Akhir</div>
                  <q-icon
                    name="picture_as_pdf"
                    color="primary"
                    size="25px"
                    clickable
                    v-ripple
                    @click="openPdfFile(selectedItem.laporan)"
                  />
                </div>

                <q-separator />

                <div class="row-item justify-between">
                  <div class="section-title">Surat Rekomendasi</div>
                  <q-icon
                    name="picture_as_pdf"
                    color="primary"
                    size="25px"
                    clickable
                    v-ripple
                    @click="openPdfFile(selectedItem.rekomendasi)"
                  />
                </div>
              </div>

              <q-separator />

              <!-- IDENTITAS -->
              <div class="section">
                <div class="row justify-between">
                  <div class="section-title">Data Diri</div>
                  <q-icon
                    name="picture_as_pdf"
                    color="primary"
                    size="25px"
                    clickable
                    v-ripple
                    @click="openPdfFile(selectedItem.ktp)"
                  />
                </div>

                <!-- <div class="row-item">
                  <span>Nama</span>
                  <b>{{ selectedItem.nama }}</b>
                </div>

                <q-separator /> -->

                <div class="row-item">
                  <span>Email</span>
                  <b>{{ selectedItem.email }}</b>
                </div>

                <q-separator />

                <div class="row-item">
                  <span>No HP</span>
                  <b>{{ selectedItem.hp }}</b>
                </div>

                <q-separator />

                <div class="row-item">
                  <span>Alamat</span>
                  <b>{{ selectedItem.alamat }}</b>
                </div>
              </div>

              <q-separator />

              <!-- PENGANTAR -->
              <div class="section">
                <div class="row justify-between">
                  <div class="section-title">Surat Pengantar</div>
                  <q-icon
                    name="picture_as_pdf"
                    color="primary"
                    size="25px"
                    clickable
                    v-ripple
                    @click="openPdfFile(selectedItem.suratP)"
                  />
                </div>

                <div class="row-item">
                  <span>Nomor</span>
                  <b>{{ selectedItem.nomorP || "-" }}</b>
                </div>

                <q-separator />

                <div class="row-item">
                  <span>Tanggal</span>
                  <b>{{ formatDates(selectedItem.tanggalP) }}</b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Penandatangan</span>
                  <b>{{ selectedItem.namaP }}</b>
                </div>
              </div>

              <q-separator />

              <!-- REKOMENDASI -->
              <div class="section">
                <div class="row justify-between">
                  <div class="section-title">Surat Rekomendasi</div>
                  <q-icon
                    name="picture_as_pdf"
                    color="primary"
                    size="25px"
                    clickable
                    v-ripple
                    @click="openPdfFile(selectedItem.suratR)"
                  />
                </div>

                <div class="row-item">
                  <span>Nomor</span>
                  <b>{{ selectedItem.nomorR || "-" }}</b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Tanggal</span>
                  <b>{{ formatDates(selectedItem.tanggalR) }}</b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Penandatangan</span>
                  <b>{{ selectedItem.namaR }}</b>
                </div>
              </div>

              <q-separator />

              <!-- PENELITIAN -->
              <div class="section">
                <div class="row justify-between">
                  <div class="section-title">Data Penelitian</div>
                  <q-icon
                    name="picture_as_pdf"
                    color="primary"
                    size="25px"
                    clickable
                    v-ripple
                    @click="openPdfFile(selectedItem.proposal)"
                  />
                </div>

                <div class="row-item">
                  <span>Lokasi</span>
                  <b>{{ selectedItem.lokasi }}</b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Tujuan</span>
                  <b>{{ selectedItem.tujuan }}</b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Lingkup</span>
                  <b>{{ selectedItem.lingkup }}</b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Tanggal Mulai</span>
                  <b>
                    {{ formatDates(selectedItem.tgl_mulai) }}
                  </b>
                </div>

                <q-separator inset />

                <div class="row-item">
                  <span>Tanggal Selesai</span>
                  <b>
                    {{ formatDates(selectedItem.tgl_selesai) }}
                  </b>
                </div>
              </div>
            </div>
          </q-card>
        </q-dialog>
        <q-dialog v-model="uploadDialog" persistent>
          <q-card style="width: 100%; max-width: 400px">
            <q-card-section class="row items-center">
              <div class="text-subtitle2 text-weight-medium">
                Unggah Laporan Akhir
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
              <q-file
                v-model="form.laporan"
                outlined
                dense
                accept=".pdf"
                label="Upload PDF"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Batal" v-close-popup />
              <q-btn
                color="primary"
                label="Upload"
                :loading="uploadLoading"
                @click="submitLaporan"
              />
            </q-card-actions>
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
      currentPdfFile: null,
      cari: "",
      skeletonLoading: true,
      formatDates: formatDates,
      showPdf: false,
      selectedItem: null,
      pdfLoading: false,
      pagePlaceholders: [],
      formDialog: false,
      mode: "add", // add | edit | detail
      step: 1,
      surveyDialog: false,
      btn_add: false,
      uploadDialog: false,

      persyaratan: [
        { label: "Tidak Sesuai", value: "Tidak Sesuai", color: "red" },
        { label: "Kurang Sesuai", value: "Kurang Sesuai", color: "yellow" },
        { label: "Sesuai", value: "Sesuai", color: "green" },
        { label: "Sangat Sesuai", value: "Sangat Sesuai" },
      ],
      prosedur: [
        { label: "Tidak Mudah", value: "Tidak Mudah", color: "red" },
        { label: "Kurang Mudah", value: "Kurang Mudah", color: "yellow" },
        { label: "Mudah", value: "Mudah", color: "green" },
        { label: "Sangat Mudah", value: "Sangat Mudah" },
      ],
      pelayanan: [
        { label: "Tidak Cepat", value: "Tidak Cepat", color: "red" },
        { label: "Kurang Cepat", value: "Kurang Cepat", color: "yellow" },
        { label: "Cepat", value: "Cepat", color: "green" },
        { label: "Sangat Cepat", value: "Sangat Cepat" },
      ],
      tarif: [
        { label: "Sangat Mahal", value: "Sangat Mahal", color: "red" },
        { label: "Cukup Mahal", value: "Cukup Mahal", color: "yellow" },
        { label: "Murah", value: "Murah", color: "green" },
        { label: "Gratis", value: "Gratis" },
      ],
      ketentuan: [
        { label: "Tidak Sesuai", value: "Tidak Sesuai", color: "red" },
        { label: "Kurang Sesuai", value: "Kurang Sesuai", color: "yellow" },
        { label: "Sesuai", value: "Sesuai", color: "green" },
        { label: "Sangat Sesuai", value: "Sangat Sesuai" },
      ],
      kompetensi: [
        { label: "Tidak Kompeten", value: "Tidak Kompeten", color: "red" },
        { label: "Kurang Kompeten", value: "Kurang Kompeten", color: "yellow" },
        { label: "Kompeten", value: "Kompeten", color: "green" },
        { label: "Sangat Kompeten", value: "Sangat Kompeten" },
      ],
      sikap: [
        {
          label: "Tidak Sopan dan Ramah",
          value: "Tidak Sopan dan Ramah",
          color: "red",
        },
        {
          label: "Kurang Sopan dan Ramah",
          value: "Kurang Sopan dan Ramah",
          color: "yellow",
        },
        { label: "Sopan dan Ramah", value: "Sopan dan Ramah", color: "green" },
        { label: "Sangat Sopan dan Ramah", value: "Sangat Sopan dan Ramah" },
      ],
      maklumat: [
        { label: "Buruk", value: "Buruk", color: "red" },
        { label: "Cukup", value: "Cukup", color: "yellow" },
        { label: "Baik", value: "Baik", color: "green" },
        { label: "Sangat Baik", value: "Sangat Baik" },
      ],
      pengaduan: [
        { label: "Tidak Ada", value: "Tidak Ada", color: "red" },
        {
          label: "Ada Tapi Tidak Berfungsi",
          value: "Ada Tapi Tidak Berfungsi",
          color: "yellow",
        },
        {
          label: "Berfungsi Kurang Maksimal",
          value: "Berfungsi Kurang Maksimal",
          color: "green",
        },
        { label: "Dikelola Dengan Baik", value: "Dikelola Dengan Baik" },
      ],

      ikm: {
        nama: "",
        email: "",
        umur: "",
        pendidikan: "",
        pekerjaan: "",

        persyaratan: "",
        prosedur: "",
        pelayanan: "",
        tarif: "",
        ketentuan: "",
        kompetensi: "",
        sikap: "",
        maklumat: "",
        pengaduan: "",
      },
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

    async submitSurvey() {
      try {
        this.btn_add = true;

        const requiredFields = [
          "umur",
          "pendidikan",
          "pekerjaan",
          "persyaratan",
          "prosedur",
          "pelayanan",
          "tarif",
          "ketentuan",
          "kompetensi",
          "sikap",
          "maklumat",
          "pengaduan",
        ];

        for (let field of requiredFields) {
          if (!this.ikm[field]) {
            this.$q.notify({
              type: "warning",
              message: "Semua pertanyaan wajib diisi",
            });
            this.btn_add = false;
            return;
          }
        }

        await this.erida.addSurvey(this.ikm);

        await this.erida.updateSurveyStatus(this.ikm.izin_id);

        this.$q.notify({
          type: "positive",
          message: "Survey berhasil dikirim",
        });

        this.surveyDialog = false;

        this.loadData(true);
      } catch (err) {
        console.error(err);

        this.$q.notify({
          type: "negative",
          message: "Gagal mengirim survey",
        });
      } finally {
        this.btn_add = false;
      }
    },

    getFabConfig(status) {
      switch (status) {
        case "proses":
          return { color: "orange", icon: "restart_alt" };
        case "ditolak":
          return { color: "red", icon: "cancel" };
        case "survey":
          return { color: "purple", icon: "pending_actions" };
        case "verifikasi":
          return { color: "teal", icon: "checklist_rtl" };
        default:
          return { color: "grey", icon: "help" };
      }
    },

    getFabActions(item) {
      if (["proses", "ditolak"].includes(item.status)) {
        return [
          {
            icon: "edit",
            color: "orange",
            handler: () => this.editItem(item),
          },
          {
            icon: "delete",
            color: "red",
            handler: () => this.deleteItem(item),
          },
        ];
      }

      // 🔥 survey
      if (["survey", "verifikasi"].includes(item.status)) {
        return [
          {
            icon: "description",
            color: "green",
            handler: () => this.openPdfFile(item.rekomendasi),
          },
          {
            icon: "upload_file",
            color: "blue",
            handler: () => this.openUpload(item),
          },
        ];
      }

      return [];
    },

    openUpload(item) {
      this.selectedItem = item;
      this.form.laporan = null;
      this.uploadDialog = true;
    },

    async submitLaporan() {
      try {
        if (!this.form.laporan) {
          this.$q.notify({
            type: "warning",
            message: "File wajib diupload",
          });
          return;
        }

        this.uploadLoading = true;

        await this.erida.uploadLaporan({
          id: this.selectedItem.id,
          file: this.form.laporan,
        });

        this.$q.notify({
          type: "positive",
          message: "Laporan berhasil diupload",
        });

        this.uploadDialog = false;
        this.loadData(true);
      } catch (err) {
        console.error(err);

        this.$q.notify({
          type: "negative",
          message: "Gagal upload laporan",
        });
      } finally {
        this.uploadLoading = false;
      }
    },

    getStatusClass(status) {
      switch (status) {
        case "proses":
          return "status-orange";
        case "ditolak":
          return "status-red";
        case "diterima":
          return "status-green";
        case "survey":
          return "status-purple";
        case "verifikasi":
          return "status-teal";
        case "publish":
          return "status-blue";
        default:
          return "status-grey";
      }
    },

    async openPdfFile(file) {
      if (!file) return;

      this.currentPdfFile = file; // ✅ simpan file aktif
      this.showPdf = true;

      await this.$nextTick();

      try {
        await this.loadPdf(file);
      } catch (err) {
        console.error("LOAD PDF ERROR:", err);
      }
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

    openDetail(item) {
      console.log("CLICKED:", item);
      this.selectedItem = item;
      this.detailDialog = true;
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
      };
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

    openSurvey(item) {
      this.surveyDialog = true;

      // isi default dari user / item
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      this.ikm = {
        izin_id: item.id, // 🔥 penting (relasi ke izin)
        nama: user.nama || item.nama,
        email: user.email || item.email,
        umur: "",
        pendidikan: "",
        pekerjaan: "",

        persyaratan: "",
        prosedur: "",
        pelayanan: "",
        tarif: "",
        ketentuan: "",
        kompetensi: "",
        sikap: "",
        maklumat: "",
        pengaduan: "",
      };
    },

    async loadPdf(file) {
      try {
        this.pdfLoading = true;

        const container = this.$refs.pdfContainer;

        if (!container) {
          throw new Error("PDF container not ready");
        }

        container.innerHTML = "";

        const url = getFileErida(file);

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          const viewport = page.getViewport({ scale: 1.2 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          container.appendChild(canvas);
        }
      } catch (err) {
        console.error("PDF ERROR:", err);

        this.$q.notify({
          type: "negative",
          message: "Gagal memuat PDF",
        });

        throw err;
      } finally {
        this.pdfLoading = false;
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
      if (!this.currentPdfFile) return;

      const url = getFileErida(this.currentPdfFile);

      const link = document.createElement("a");
      link.href = url;
      link.download = this.selectedItem?.judul || "file.pdf";

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
  padding: 2px 0;
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

.fab-proses {
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.5); /* orange */
}

.fab-ditolak {
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); /* red */
}

.fab-survey {
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.5); /* purple */
}

.fab-diterima {
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); /* green */
}

/* optional */
.fab-publish {
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); /* blue */
}

.fab-verifikasi {
  box-shadow: 0 0 10px rgba(13, 148, 136, 0.5); /* teal */
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

/* HEADER */
.card-header {
  padding: 18px;
}

/* STATUS PILL */
.status-pill {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status-orange {
  background: #fff7ed;
  color: #ea580c;
}

.status-green {
  background: #ecfdf5;
  color: #059669;
}

.status-red {
  background: #fef2f2;
  color: #dc2626;
}

.status-grey {
  background: #f3f4f6;
  color: #6b7280;
}

.status-blue {
  background: #eff6ff;
  color: #2563eb;
}

.status-purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.status-teal {
  background: #ecfeff;
  color: #0891b2;
}

/* SECTION */
.section {
  padding: 14px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #374151;
}

/* ROW ITEM */
.row-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 10px 0;
}

.row-item span {
  color: #6b7280;
}
</style>
