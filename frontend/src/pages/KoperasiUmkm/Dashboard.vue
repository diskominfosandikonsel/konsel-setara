<template>
  <q-page class="koperasi-page q-pb-xl">
    <q-pull-to-refresh @refresh="refreshAll">
      <!-- HEADER UTAMA -->
      <header class="koperasi-header text-white">
        <div class="header-pattern" aria-hidden="true"></div>
        <div class="content-container header-content">
          <div class="topbar row items-center justify-between no-wrap">
            <q-btn flat round icon="arrow_back" color="white" class="back-button" aria-label="Kembali"
              @click="goBack" />
            <div class="official-badge row items-center no-wrap">
              <!-- <q-icon name="verified" size="15px" /> -->
              <span>Dinas Koperasi dan UMKM</span>
            </div>
            <q-btn flat round icon="language" color="white" class="website-icon-button" aria-label="Buka website resmi"
              href="https://dinkop.konaweselatankab.go.id/" target="_blank" rel="noopener noreferrer" />
          </div>

          <div class="hero-copy row items-center q-col-gutter-lg">
            <div class="col-12 col-sm">
              <!-- <div class="hero-kicker">APLI DAKOP · KONAWE SELATAN</div> -->
              <h1 class="hero-title">Koperasi &amp; UMKM</h1>
              <p class="hero-description">
                Pusat data, pendaftaran, dan layanan bantuan usaha dalam satu
                akses yang terpercaya.
              </p>
              <q-btn unelevated no-caps icon-right="open_in_new" label="Kunjungi Website Resmi"
                class="official-site-button" href="https://dinkop.konaweselatankab.go.id/" target="_blank"
                rel="noopener noreferrer" />
            </div>
            <div class="col-auto gt-xs">
              <div class="agency-logo-panel">
                <img src="icons/koperasi.png" alt="Logo Dinas Koperasi dan UMKM Kabupaten Konawe Selatan" />
              </div>
            </div>
          </div>

          <!-- STATISTIK RINGKASAN STRIP -->
          <div class="row q-col-gutter-md stats-grid">
            <!-- Card Koperasi -->
            <div class="col-6 col-sm-6">
              <div class="stat-card full-height column justify-between">
                <div class="row items-start justify-between no-wrap">
                  <div>
                    <div class="stat-label">Koperasi Terdata</div>
                    <div class="stat-number">
                      {{ formatNumber(stats.totalKoperasi) }}
                    </div>
                  </div>
                  <div class="stat-icon stat-icon--teal">
                    <q-icon name="account_balance" size="23px" />
                  </div>
                </div>
                <div class="row items-center q-gutter-x-xs stat-meta">
                  <span class="badge-sub badge-active">
                    <q-icon name="check_circle" size="12px" />
                    {{ stats.koperasiAktif }} Aktif
                  </span>
                  <span class="badge-sub badge-inactive">
                    {{ stats.koperasiNonAktif }} Nonaktif
                  </span>
                </div>
              </div>
            </div>

            <!-- Card UMKM -->
            <div class="col-6 col-sm-6">
              <div class="stat-card full-height column justify-between">
                <div class="row items-start justify-between no-wrap">
                  <div>
                    <div class="stat-label">Pelaku UMKM</div>
                    <div class="stat-number">
                      {{ formatNumber(stats.totalUmkm) }}
                    </div>
                  </div>
                  <div class="stat-icon stat-icon--amber">
                    <q-icon name="storefront" size="23px" />
                  </div>
                </div>
                <div class="stat-meta stat-note row items-center">
                  <q-icon name="location_on" size="13px" />
                  <span>Terdata di 25 kecamatan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- NAVIGASI TAB MENU LAYANAN -->
      <div class="sticky-nav">
        <div class="content-container nav-shell">
          <q-tabs v-model="activeTab" no-caps align="justify" class="service-tabs" active-color="primary"
            indicator-color="transparent">
            <q-tab name="koperasi" icon="apartment" label="Koperasi" class="nav-tab-item" />
            <q-tab name="umkm" icon="store" label="Katalog UMKM" class="nav-tab-item" />
            <q-tab name="daftar" icon="app_registration" label="Pendaftaran" class="nav-tab-item" />
            <q-tab name="status" icon="manage_search" label="Cek Status" class="nav-tab-item" />
          </q-tabs>
        </div>
      </div>

      <!-- KONTEN TAB UTAMA (TERKONTROL RESPONSIF) -->
      <main class="content-container main-content q-px-md">
        <!-- ============================================== -->
        <!-- TAB 1: DIREKTORI KOPERASI                     -->
        <!-- ============================================== -->
        <section v-show="activeTab === 'koperasi'" class="content-section">
          <div class="section-heading row items-end justify-between q-mb-md">
            <div>
              <div class="section-eyebrow">Direktori resmi</div>
              <h2 class="section-title">Temukan koperasi</h2>
              <p class="section-description">
                Telusuri legalitas dan status koperasi di seluruh Konawe
                Selatan.
              </p>
            </div>
          </div>
          <!-- Filter & Pencarian -->
          <div class="filter-panel q-mb-lg">
            <q-input v-model="koperasiQuery" outlined bg-color="white" class="search-field"
              placeholder="Cari nama koperasi atau No. Badan Hukum..." @update:model-value="onKoperasiSearchInput"
              clearable @clear="fetchKoperasiList(1)">
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>

            <!-- Responsive Filter Grid: 2 kolom di mobile, 3 kolom di tablet/iPad -->
            <div class="row q-col-gutter-sm q-mt-sm">
              <!-- Filter Kecamatan -->
              <div class="col-6 col-sm-4">
                <q-select v-model="koperasiKecamatan" :options="kecamatanOptions" option-label="nama_kecamatan"
                  option-value="kecamatan_id" emit-value map-options dense outlined bg-color="white" label="Kecamatan"
                  clearable @update:model-value="onKoperasiKecamatanChange" />
              </div>

              <!-- Filter Desa (Responsif berdampingan di mobile & tablet) -->
              <div class="col-6 col-sm-4">
                <q-select v-model="koperasiDesa" :options="koperasiDesaOptions" option-label="nama_des_kel"
                  option-value="des_kel_id" emit-value map-options dense outlined bg-color="white"
                  label="Desa / Kelurahan" :disable="!koperasiKecamatan" clearable
                  @update:model-value="fetchKoperasiList(1)" />
              </div>

              <!-- Filter Jenis Koperasi (Penuh di mobile, berdampingan di tablet) -->
              <div class="col-12 col-sm-4">
                <q-select v-model="koperasiJenis" :options="jenisKoperasiOptions" option-label="uraian"
                  option-value="id" emit-value map-options dense outlined bg-color="white" label="Jenis Koperasi"
                  clearable @update:model-value="fetchKoperasiList(1)" />
              </div>
            </div>

            <!-- Filter Status Keaktifan (Chips Responsif) -->
            <div class="status-filter row items-center q-gutter-x-xs q-mt-md overflow-x-auto no-wrap-sm">
              <span class="text-caption text-grey-7 q-mr-xs text-weight-bold">Status</span>
              <q-chip clickable :selected="koperasiStatus === ''" @click="setKoperasiStatus('')" dense size="sm"
                :color="koperasiStatus === '' ? 'primary' : 'grey-3'"
                :text-color="koperasiStatus === '' ? 'white' : 'grey-8'" class="text-weight-bold">
                Semua
              </q-chip>
              <q-chip clickable :selected="koperasiStatus === 'aktif'" @click="setKoperasiStatus('aktif')" dense
                size="sm" :color="koperasiStatus === 'aktif' ? 'positive' : 'grey-3'"
                :text-color="koperasiStatus === 'aktif' ? 'white' : 'grey-8'" class="text-weight-bold">
                Aktif / Sehat
              </q-chip>
              <q-chip clickable :selected="koperasiStatus === 'tidak_aktif'" @click="setKoperasiStatus('tidak_aktif')"
                dense size="sm" :color="koperasiStatus === 'tidak_aktif' ? 'negative' : 'grey-3'
                  " :text-color="koperasiStatus === 'tidak_aktif' ? 'white' : 'grey-8'
                    " class="text-weight-bold">
                Tidak Aktif
              </q-chip>
            </div>
          </div>

          <!-- Total Info & Loading Indicator -->
          <div class="result-toolbar row items-center justify-between q-mb-md">
            <div class="result-count">
              <strong>{{ formatNumber(koperasiTotal) }}</strong> koperasi
              ditemukan
            </div>
            <div v-if="koperasiLoading" class="text-primary text-weight-medium">
              <q-spinner-dots size="16px" class="q-mr-xs" /> Memuat...
            </div>
          </div>

          <!-- List Koperasi: 1 kolom di mobile, 2 kolom di tablet/iPad -->
          <div v-if="koperasiLoading && koperasiList.length === 0" class="row q-col-gutter-sm">
            <div v-for="n in 4" :key="'skel-kop-' + n" class="col-12 col-sm-6">
              <q-card class="no-shadow bordered-card q-pa-sm h-100">
                <q-skeleton type="text" width="60%" height="22px" />
                <q-skeleton type="text" width="40%" height="16px" />
                <q-skeleton type="text" width="80%" height="14px" />
              </q-card>
            </div>
          </div>

          <div v-else-if="koperasiList.length === 0" class="empty-state text-center text-grey-6">
            <div class="empty-state-icon">
              <q-icon name="search_off" size="34px" />
            </div>
            <div class="text-weight-bold">Tidak ada koperasi ditemukan</div>
            <div class="text-caption">
              Coba ganti kata kunci atau sesuaikan filter wilayah/jenis
              koperasi.
            </div>
          </div>

          <div v-else>
            <div class="row q-col-gutter-sm">
              <div v-for="item in koperasiList" :key="item.id" class="col-12 col-sm-6">
                <q-card class="koperasi-item-card directory-card no-shadow cursor-pointer h-100 column justify-between"
                  v-ripple @click="openDetailKoperasi(item)">
                  <q-card-section class="directory-card-section">
                    <div class="row items-start justify-between no-wrap q-mb-sm">
                      <div class="row items-start no-wrap col">
                        <div class="directory-icon flex flex-center q-mr-sm">
                          <q-icon name="account_balance" size="20px" />
                        </div>
                        <div class="text-subtitle2 text-weight-bold text-grey-9 ellipsis-2-lines col directory-title">
                          {{ item.nama_koperasi }}
                        </div>
                      </div>
                      <q-chip dense size="sm" :color="isKoperasiAktif(item.status_koperasi)
                        ? 'positive'
                        : 'grey-5'
                        " text-color="white" class="q-ml-sm text-weight-bold flex-shrink-0">
                        {{ item.status_koperasi || "Aktif" }}
                      </q-chip>
                    </div>

                    <div class="data-line text-caption text-grey-7 q-mb-sm">
                      <q-icon name="verified_user" size="15px" />
                      <span>No. BH</span>
                      <strong>{{ item.no_bh || "-" }}</strong>
                    </div>

                    <div class="card-footer-line row items-center justify-between text-caption text-grey-6">
                      <div class="row items-center ellipsis col q-mr-xs">
                        <q-icon name="place" size="15px" class="q-mr-xs" />
                        <span class="ellipsis">{{ item.nama_desa }}, Kec.
                          {{ item.nama_kecamatan }}</span>
                      </div>
                      <div class="category-label flex-shrink-0">
                        {{ item.jenis_koperasi_nama }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Pagination Koperasi -->
            <div class="row justify-center q-mt-md" v-if="koperasiTotalPages > 1">
              <q-pagination v-model="koperasiPage" :max="koperasiTotalPages" :max-pages="5" boundary-numbers
                direction-links color="primary" size="sm" @update:model-value="fetchKoperasiList" />
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- TAB 2: KATALOG PELAKU UMKM                    -->
        <!-- ============================================== -->
        <section v-show="activeTab === 'umkm'" class="content-section">
          <div class="section-heading q-mb-md">
            <div class="section-eyebrow">Etalase daerah</div>
            <h2 class="section-title">Katalog pelaku UMKM</h2>
            <p class="section-description">
              Jelajahi usaha lokal yang tumbuh dari berbagai kecamatan.
            </p>
          </div>
          <!-- Filter & Pencarian UMKM -->
          <div class="filter-panel q-mb-lg">
            <q-input v-model="umkmQuery" outlined bg-color="white" class="search-field"
              placeholder="Cari nama usaha, pemilik, atau NIK..." @update:model-value="onUmkmSearchInput" clearable
              @clear="fetchUmkmList(1)">
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>

            <!-- Responsive Filter Grid: 2 kolom di mobile, 3 kolom di tablet/iPad -->
            <div class="row q-col-gutter-sm q-mt-sm">
              <!-- Filter Kecamatan -->
              <div class="col-6 col-sm-4">
                <q-select v-model="umkmKecamatan" :options="kecamatanOptions" option-label="nama_kecamatan"
                  option-value="kecamatan_id" emit-value map-options dense outlined bg-color="white" label="Kecamatan"
                  clearable @update:model-value="onUmkmKecamatanChange" />
              </div>

              <!-- Filter Desa (Responsif berdampingan di mobile & tablet) -->
              <div class="col-6 col-sm-4">
                <q-select v-model="umkmDesa" :options="umkmDesaOptions" option-label="nama_des_kel"
                  option-value="des_kel_id" emit-value map-options dense outlined bg-color="white"
                  label="Desa / Kelurahan" :disable="!umkmKecamatan" clearable @update:model-value="fetchUmkmList(1)" />
              </div>

              <!-- Filter Sektor Jenis Usaha -->
              <div class="col-12 col-sm-4">
                <q-select v-model="umkmJenisUsaha" :options="jenisUsahaOptions" option-label="uraian" option-value="id"
                  emit-value map-options dense outlined bg-color="white" label="Jenis Usaha" clearable
                  @update:model-value="fetchUmkmList(1)" />
              </div>
            </div>
          </div>

          <!-- Total Info -->
          <div class="result-toolbar row items-center justify-between q-mb-md">
            <div class="result-count">
              <strong>{{ formatNumber(umkmTotal) }}</strong> pelaku UMKM
              ditemukan
            </div>
            <div v-if="umkmLoading" class="text-primary text-weight-medium">
              <q-spinner-dots size="16px" class="q-mr-xs" /> Memuat...
            </div>
          </div>

          <!-- List UMKM: 1 kolom di mobile, 2 kolom di tablet/iPad -->
          <div v-if="umkmLoading && umkmList.length === 0" class="row q-col-gutter-sm">
            <div v-for="n in 4" :key="'skel-umkm-' + n" class="col-12 col-sm-6">
              <q-card class="no-shadow bordered-card q-pa-sm h-100">
                <q-skeleton type="text" width="70%" height="22px" />
                <q-skeleton type="text" width="40%" height="16px" />
                <q-skeleton type="text" width="60%" height="14px" />
              </q-card>
            </div>
          </div>

          <div v-else-if="umkmList.length === 0" class="empty-state text-center text-grey-6">
            <div class="empty-state-icon">
              <q-icon name="storefront" size="34px" />
            </div>
            <div class="text-weight-bold">Tidak ada pelaku UMKM ditemukan</div>
            <div class="text-caption">
              Coba ganti kata kunci pencarian atau filter wilayah.
            </div>
          </div>

          <div v-else>
            <div class="row q-col-gutter-sm">
              <div v-for="item in umkmList" :key="item.id" class="col-12 col-sm-6">
                <q-card class="umkm-card-modern no-shadow h-100 column justify-between">
                  <q-card-section class="umkm-card-body column justify-between full-height">
                    <div>
                      <!-- Baris 1: Kategori Usaha & Tahun Pendataan -->
                      <div class="row items-center justify-between no-wrap q-mb-sm">
                        <div class="umkm-badge-category row items-center no-wrap">
                          <!-- <q-icon name="sell" size="11px" class="q-mr-xs" /> -->
                          <span class="ellipsis">{{ item.jenis_usaha_nama || 'Usaha Mikro' }}</span>
                        </div>
                        <div v-if="item.tahun_pendataan" class="umkm-badge-year row items-center no-wrap">
                          <!-- <q-icon name="calendar_today" size="11px" class="q-mr-xs" /> -->
                          <span>Tahun {{ item.tahun_pendataan }}</span>
                        </div>
                      </div>

                      <!-- Baris 2: Nama Usaha -->
                      <div class="row items-start no-wrap q-mb-sm">
                        <!-- <div class="umkm-avatar-icon flex flex-center q-mr-sm flex-shrink-0">
                          <q-icon name="storefront" size="19px" />
                        </div> -->
                        <div class="col" style="min-width: 0;">
                          <div class="umkm-business-title ellipsis-2-lines">
                            {{ item.nama_usaha }}
                          </div>
                        </div>
                      </div>

                      <!-- Baris 3: Box Identitas Pemilik & NIK -->
                      <div class="umkm-identity-box q-mb-xs">
                        <div class="row items-center justify-between no-wrap q-py-xs">
                          <div class="row items-center no-wrap identity-label">
                            <q-icon name="person" size="14px" class="q-mr-xs text-teal-7" />
                            <span>Pemilik</span>
                          </div>
                          <div class="text-weight-bold ellipsis text-right identity-value">
                            {{ item.nama_pemilik }}
                          </div>
                        </div>

                        <div v-if="item.nik" class="identity-divider"></div>

                        <div v-if="item.nik" class="row items-center justify-between no-wrap q-py-xs">
                          <div class="row items-center no-wrap identity-label">
                            <q-icon name="badge" size="14px" class="q-mr-xs text-grey-6" />
                            <span>NIK Terdaftar</span>
                          </div>
                          <div class="identity-nik">
                            {{ maskNik(item.nik) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Baris 4: Footer Lokasi & Status Terdata -->
                    <div class="umkm-footer row items-center justify-between no-wrap q-pt-xs">
                      <div class="row items-center ellipsis col q-mr-xs text-grey-7 umkm-location">
                        <q-icon name="place" size="13px" class="text-red-5 q-mr-xs flex-shrink-0" />
                        <span class="ellipsis">{{ item.nama_desa }}, Kec. {{ item.nama_kecamatan }}</span>
                      </div>
                      <div class="umkm-verified-tag row items-center no-wrap flex-shrink-0">
                        <q-icon name="verified" size="12px" class="q-mr-xs text-positive" />
                        <span>Terdata</span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Pagination UMKM -->
            <div class="row justify-center q-mt-md" v-if="umkmTotalPages > 1">
              <q-pagination v-model="umkmPage" :max="umkmTotalPages" :max-pages="5" boundary-numbers direction-links
                color="primary" size="sm" @update:model-value="fetchUmkmList" />
            </div>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- TAB 3: LAYANAN PENDAFTARAN & AJUKAN BANTUAN   -->
        <!-- ============================================== -->
        <section v-show="activeTab === 'daftar'" class="form-container-box content-section">
          <div class="section-heading q-mb-md">
            <div class="section-eyebrow">Layanan digital</div>
            <h2 class="section-title">Pendaftaran &amp; bantuan</h2>
            <p class="section-description">
              Ajukan layanan secara mandiri dan pantau prosesnya melalui NIK.
            </p>
          </div>
          <!-- Switcher 2 Pilihan: Daftar UMKM Baru & Ajukan Bantuan -->
          <div class="row justify-center q-mb-md">
            <q-btn-toggle v-model="daftarSubTab" spread no-caps rounded unelevated class="custom-subtab-toggle bg-white"
              toggle-color="primary" color="white" text-color="grey-8" :options="[
                {
                  label: 'Daftar UMKM Baru',
                  value: 'daftar_umkm',
                  icon: 'add_business',
                },
                {
                  label: 'Ajukan Bantuan',
                  value: 'ajukan_bantuan',
                  icon: 'volunteer_activism',
                },
              ]" />
          </div>

          <!-- SUB-TAB A: DAFTAR UMKM BARU (MANDIRI) -->
          <q-card v-if="daftarSubTab === 'daftar_umkm'"
            class="no-shadow bordered-card service-card q-pa-md q-mb-lg bg-white">
            <div class="service-card-header row items-center q-mb-lg">
              <q-avatar size="44px" color="teal-1" text-color="teal-8" class="q-mr-sm">
                <q-icon name="app_registration" size="20px" />
              </q-avatar>
              <div>
                <div class="text-subtitle1 text-weight-bold text-grey-9">
                  Formulir Pendaftaran UMKM Baru
                </div>
                <div class="text-caption text-grey-6">
                  Untuk usaha yang belum terdaftar di basis data Dinas Koperasi
                  Konsel
                </div>
              </div>
            </div>

            <q-form @submit="onSubmitPendaftaran" class="q-gutter-y-md">
              <q-input v-model="formDaftar.nik" outlined dense label="NIK Pemilik (16 Digit) *" mask="################"
                :rules="[
                  (val) => !!val || 'NIK wajib diisi',
                  (val) => val.length === 16 || 'NIK harus 16 digit',
                ]">
                <template v-slot:prepend>
                  <q-icon name="badge" color="primary" />
                </template>
              </q-input>

              <q-input v-model="formDaftar.nama_pemilik" outlined dense label="Nama Lengkap Pemilik (Sesuai KTP) *"
                :rules="[(val) => !!val || 'Nama pemilik wajib diisi']" />

              <q-input v-model="formDaftar.nama_usaha" outlined dense label="Nama Usaha / Merk Dagang *"
                :rules="[(val) => !!val || 'Nama usaha wajib diisi']" />

              <q-select v-model="formDaftar.jenisusaha_id" :options="jenisUsahaOptions" option-label="uraian"
                option-value="id" emit-value map-options outlined dense label="Pilih Jenis Usaha *"
                :rules="[(val) => !!val || 'Pilih salah satu jenis usaha']" />

              <q-input v-model="formDaftar.no_hp" outlined dense label="Nomor WhatsApp / HP *" type="tel"
                placeholder="Contoh: 081234567890" :rules="[(val) => !!val || 'Nomor kontak wajib diisi']">
                <template v-slot:prepend>
                  <q-icon name="phone" color="positive" />
                </template>
              </q-input>

              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-select v-model="formDaftar.kecamatan_id" :options="kecamatanOptions" option-label="nama_kecamatan"
                    option-value="kecamatan_id" emit-value map-options outlined dense label="Kecamatan *"
                    @update:model-value="onKecamatanChange" :rules="[(val) => !!val || 'Wajib pilih']" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select v-model="formDaftar.desa_id" :options="desaOptions" option-label="nama_des_kel"
                    option-value="des_kel_id" emit-value map-options outlined dense label="Desa / Kelurahan *"
                    :disable="!formDaftar.kecamatan_id" :rules="[(val) => !!val || 'Wajib pilih']" />
                </div>
              </div>

              <q-input v-model="formDaftar.alamat_usaha" outlined dense type="textarea" rows="2"
                label="Alamat Lengkap Usaha" placeholder="Nama jalan, RT/RW, atau patokan lokasi usaha..." />

              <q-btn type="submit" color="primary" class="primary-action full-width q-py-sm text-weight-bold" unelevated
                :loading="formLoading" icon="send" label="Kirim Pendaftaran Usaha" />
            </q-form>
          </q-card>

          <!-- SUB-TAB B: AJUKAN BANTUAN UMKM (POLA WEBSITE RESMI) -->
          <div v-else-if="daftarSubTab === 'ajukan_bantuan'">
            <!-- Alert Berhasil Bantuan -->
            <q-card v-if="bantuanSuccessId"
              class="no-shadow bordered-card service-card success-card q-pa-md q-mb-lg bg-white text-center">
              <q-avatar size="56px" color="positive" text-color="white" class="q-mb-sm">
                <q-icon name="check" size="32px" />
              </q-avatar>
              <div class="text-subtitle1 text-weight-bolder text-grey-9">
                Pengajuan Bantuan Berhasil Dikirim!
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Berkas pengajuan bantuan usaha Anda telah masuk ke sistem Dinas
                Koperasi & UMKM Kab. Konawe Selatan dan sedang menunggu
                verifikasi administrasi.
              </div>
              <div class="q-pa-sm bg-grey-1 rounded-borders text-caption text-left q-mb-md border-subtle">
                <div class="row justify-between q-mb-xs">
                  <span class="text-grey-6">Nomor Registrasi:</span>
                  <span class="text-weight-bold text-primary">#{{ bantuanSuccessId }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Status:</span>
                  <q-badge color="amber-9">Menunggu Verifikasi</q-badge>
                </div>
              </div>
              <div class="row q-gutter-x-sm justify-center">
                <q-btn color="primary" unelevated label="Pantau Status Pengajuan"
                  @click="pantauStatusBantuan(bantuanNik)" />
                <q-btn flat color="grey-7" label="Buat Pengajuan Baru" @click="resetBantuanForm" />
              </div>
            </q-card>

            <!-- Form Pengajuan Bantuan -->
            <q-card v-else class="no-shadow bordered-card service-card q-pa-md q-mb-lg bg-white">
              <div class="service-card-header row items-center q-mb-lg">
                <q-avatar size="44px" color="amber-1" text-color="amber-9" class="q-mr-sm">
                  <q-icon name="volunteer_activism" size="20px" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bold text-grey-9">
                    Formulir Pengajuan Bantuan UMKM
                  </div>
                  <div class="text-caption text-grey-6">
                    Khusus untuk pelaku usaha yang telah terdaftar di database
                    dinas
                  </div>
                </div>
              </div>

              <!-- LANGKAH 1: CARI & PILIH USAHA -->
              <div class="q-mb-md">
                <div class="form-step-label q-mb-sm">
                  <span>1</span> Cari &amp; pilih usaha Anda terlebih dahulu
                </div>
                <q-input v-model="bantuanSearch" outlined dense
                  placeholder="Ketik min. 3 huruf nama pemilik atau nama usaha..."
                  @update:model-value="onBantuanSearchInput" clearable>
                  <template v-slot:append>
                    <q-spinner-dots v-if="bantuanSearching" size="18px" color="primary" />
                    <q-icon v-else name="search" color="grey-6" />
                  </template>
                </q-input>

                <!-- Pilihan Hasil Pencarian Pelaku -->
                <div v-if="bantuanSearchResults.length > 0" class="q-mt-sm">
                  <q-select v-model="bantuanSelectedPelaku" :options="bantuanSearchResults" option-label="nama_usaha"
                    outlined dense label="Pilih usaha dari hasil pencarian" @update:model-value="onPelakuSelected">
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="text-weight-bold">{{
                            scope.opt.nama_usaha
                          }}</q-item-label>
                          <q-item-label caption>
                            Pemilik: {{ scope.opt.nama_pemilik }} ({{
                              scope.opt.nama_des_kel || "-"
                            }}, Kec. {{ scope.opt.nama_kecamatan || "-" }})
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <!-- Info Usaha Terpilih -->
                <div v-if="bantuanSelectedPelaku" class="q-mt-sm q-pa-sm bg-grey-1 rounded-borders border-subtle">
                  <div class="row justify-between items-center">
                    <div>
                      <div class="text-caption text-weight-bold text-teal-9">
                        {{ bantuanSelectedPelaku.nama_usaha }}
                      </div>
                      <div class="text-caption text-grey-7">
                        Pemilik: {{ bantuanSelectedPelaku.nama_pemilik }}
                      </div>
                      <div class="text-caption text-grey-6" style="font-size: 11px">
                        Desa {{ bantuanSelectedPelaku.nama_des_kel || "-" }},
                        Kec. {{ bantuanSelectedPelaku.nama_kecamatan || "-" }}
                      </div>
                    </div>
                    <q-badge :color="Number(bantuanSelectedPelaku.pernah_bantuan)
                      ? 'amber-9'
                      : 'positive'
                      ">
                      <span v-if="Number(bantuanSelectedPelaku.pernah_bantuan)">Pernah Menerima Bantuan</span>
                      <span v-else>Belum Pernah Bantuan</span>
                    </q-badge>
                  </div>
                </div>
              </div>

              <!-- LANGKAH 2: FORM PENGIRIMAN & BERKAS -->
              <q-form @submit="onSubmitBantuan" class="q-gutter-y-md">
                <div class="form-step-label q-mb-sm">
                  <span>2</span> Konfirmasi NIK pemilik &amp; berkas persyaratan
                </div>

                <q-input v-model="bantuanNik" outlined dense label="NIK Pemilik Usaha (16 Digit) *"
                  mask="################" :disable="!bantuanSelectedPelaku" :rules="[
                    (val) => !!val || 'NIK wajib diisi',
                    (val) => val.length === 16 || 'NIK harus 16 digit',
                  ]">
                  <template v-slot:prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                </q-input>

                <!-- 4 Dokumen Persyaratan -->
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-file v-model="bantuanFiles.proposal" outlined dense label="1. Proposal Pengajuan *"
                      accept=".pdf,image/*" :disable="!bantuanSelectedPelaku"
                      :rules="[(val) => !!val || 'Proposal wajib diunggah']">
                      <template v-slot:prepend><q-icon name="description" color="primary" /></template>
                    </q-file>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-file v-model="bantuanFiles.ktp" outlined dense label="2. KTP Pemilik Usaha *"
                      accept=".pdf,image/*" :disable="!bantuanSelectedPelaku"
                      :rules="[(val) => !!val || 'KTP wajib diunggah']">
                      <template v-slot:prepend><q-icon name="badge" color="primary" /></template>
                    </q-file>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-file v-model="bantuanFiles.kk" outlined dense label="3. Kartu Keluarga (KK) *"
                      accept=".pdf,image/*" :disable="!bantuanSelectedPelaku"
                      :rules="[(val) => !!val || 'KK wajib diunggah']">
                      <template v-slot:prepend><q-icon name="family_restroom" color="primary" /></template>
                    </q-file>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-file v-model="bantuanFiles.sku" outlined dense label="4. Surat Keterangan Usaha (SKU) *"
                      accept=".pdf,image/*" :disable="!bantuanSelectedPelaku"
                      :rules="[(val) => !!val || 'SKU wajib diunggah']">
                      <template v-slot:prepend><q-icon name="verified" color="primary" /></template>
                    </q-file>
                  </div>
                </div>

                <div class="text-caption text-grey-6" style="font-size: 11px">
                  * Format berkas: PDF, JPG, atau PNG (maksimal 5 MB per
                  berkas).
                </div>

                <q-btn type="submit" color="amber-9" text-color="white"
                  class="primary-action full-width q-py-sm text-weight-bold" unelevated
                  :disable="!bantuanSelectedPelaku" :loading="bantuanSubmitting" icon="send"
                  label="Kirim Permohonan Bantuan" />
              </q-form>
            </q-card>
          </div>
        </section>

        <!-- ============================================== -->
        <!-- TAB 4: CEK STATUS PENDAFTARAN & BANTUAN (NIK)  -->
        <!-- ============================================== -->
        <section v-show="activeTab === 'status'" class="form-container-box content-section">
          <div class="section-heading q-mb-md">
            <div class="section-eyebrow">Pelacakan layanan</div>
            <h2 class="section-title">Cek status pengajuan</h2>
            <p class="section-description">
              Gunakan NIK pemilik untuk melihat data usaha dan perkembangan
              layanan.
            </p>
          </div>
          <div class="card-cek-nik q-pa-lg q-mb-md" @click="focusNikInput">
            <div class="row items-center no-wrap">
              <div class="cek-nik-icon-box flex flex-center q-mr-md flex-shrink-0">
                <q-icon name="person_search" size="26px" color="primary" />
              </div>
              <div class="col">
                <div class="text-subtitle2 text-weight-bold text-grey-9">
                  Cek Status Pelaku UMKM & Bantuan
                </div>
                <div class="text-caption text-grey-7" style="font-size: 11px">
                  Masukkan NIK 16 digit untuk memeriksa kepesertaan usaha dan
                  progres pengajuan bantuan.
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-8 col-sm-9">
                <q-input ref="nikInputRef" v-model="nikQuery" outlined dense bg-color="white"
                  placeholder="Ketik 16 Digit NIK..." mask="################" clearable @keyup.enter="handleCekNik" />
              </div>
              <div class="col-4 col-sm-3">
                <q-btn color="primary" icon="search" unelevated
                  class="primary-action full-width full-height text-weight-bold" label="Cek" :loading="nikLoading"
                  @click="handleCekNik" />
              </div>
            </div>
          </div>

          <!-- HASIL CEK NIK -->
          <div v-if="nikSearched">
            <!-- JIKA DITEMUKAN (PROFIL ATAU RIWAYAT) -->
            <div v-if="nikProfil || nikRiwayat.length > 0" class="q-gutter-y-md">
              <!-- CARD 1: PROFIL PELAKU USAHA (SATU DATA UMKM) -->
              <q-card v-if="nikProfil" class="no-shadow bordered-card service-card q-pa-md bg-white">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="row items-center col">
                    <q-icon name="verified" color="positive" size="22px" class="q-mr-xs" />
                    <div class="text-subtitle2 text-weight-bold text-grey-9 ellipsis">
                      Data Pelaku Usaha (Satu Data UMKM)
                    </div>
                  </div>
                  <q-badge color="positive" class="text-weight-bold flex-shrink-0">
                    {{
                      nikProfil.tahun_pendataan
                        ? "Terdaftar " + nikProfil.tahun_pendataan
                        : "Terdata Resmi"
                    }}
                  </q-badge>
                </div>
                <q-separator class="q-my-sm" />

                <div class="q-gutter-y-xs text-caption">
                  <div class="row justify-between">
                    <span class="text-grey-6">NIK Pemilik:</span>
                    <span class="text-weight-bold text-grey-9">{{
                      maskNik(nikQuery)
                    }}</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Nama Pemilik:</span>
                    <span class="text-weight-bold text-grey-9">{{
                      nikProfil.nama_pemilik || "-"
                    }}</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Nama Usaha:</span>
                    <span class="text-weight-bold text-teal-9">{{
                      nikProfil.nama_usaha || "-"
                    }}</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Jenis Usaha:</span>
                    <span class="text-grey-8">{{
                      nikProfil.jenis_usaha_nama || "-"
                    }}</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Wilayah:</span>
                    <span class="text-grey-8">Desa {{ nikProfil.nama_desa || "-" }}, Kec.
                      {{ nikProfil.nama_kecamatan || "-" }}</span>
                  </div>
                </div>
              </q-card>

              <!-- CARD 2: RIWAYAT PENGAJUAN & BANTUAN -->
              <q-card class="no-shadow bordered-card service-card q-pa-md bg-white">
                <div class="row items-center q-mb-xs">
                  <q-icon name="history_edu" color="primary" size="22px" class="q-mr-xs" />
                  <div class="text-subtitle2 text-weight-bold text-grey-9">
                    Riwayat Pengajuan & Bantuan Dinas
                  </div>
                </div>
                <q-separator class="q-my-sm" />

                <!-- Jika Ada Pengajuan / Bantuan -->
                <div v-if="nikRiwayat.length > 0" class="q-gutter-y-sm">
                  <div v-for="(item, idx) in nikRiwayat" :key="'riwayat-' + idx"
                    class="q-pa-sm bg-grey-1 rounded-borders border-subtle">
                    <div class="row items-center justify-between no-wrap q-mb-xs">
                      <q-badge :color="item.jenis === 'bantuan' ? 'indigo-8' : 'teal-8'
                        " class="text-weight-bold">
                        {{
                          item.jenis === "bantuan"
                            ? "PROGRAM BANTUAN UMKM"
                            : "PENDAFTARAN UMKM BARU"
                        }}
                      </q-badge>
                      <q-badge :color="getStatusBadgeColor(item.status)" class="text-weight-bold">
                        {{ item.status || "DIAJUKAN" }}
                      </q-badge>
                    </div>

                    <div class="text-caption text-grey-9 text-weight-medium q-mt-xs">
                      {{ item.nama_usaha }}
                      <span class="text-grey-6">({{ item.nama_pemilik }})</span>
                    </div>

                    <div class="text-caption text-grey-6" style="font-size: 11px">
                      Diajukan pada: {{ formatDateOnly(item.created_at) }}
                    </div>

                    <!-- Catatan Verifikator Dinas -->
                    <div v-if="item.catatan" class="catatan-dinas-box q-mt-xs q-pa-xs rounded-borders text-caption">
                      <q-icon name="speaker_notes" size="13px" class="q-mr-xs text-negative" />
                      <strong class="text-negative">Catatan Verifikator:</strong>
                      <span class="text-grey-9 q-ml-xs">{{
                        item.catatan
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Jika Belum Ada Pengajuan Bantuan/Pendaftaran Baru -->
                <div v-else class="text-center q-py-md text-grey-6">
                  <div class="text-caption">
                    Belum ada riwayat pengajuan bantuan atau pendaftaran baru
                    online untuk NIK ini.
                  </div>
                </div>
              </q-card>
            </div>

            <!-- JIKA TIDAK DITEMUKAN SAMA SEKALI -->
            <q-card v-else class="no-shadow bordered-card service-card empty-result q-pa-lg text-center bg-white">
              <q-icon name="info" color="grey-5" size="48px" class="q-mb-sm" />
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                Data NIK Belum Terdaftar
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                NIK {{ maskNik(nikQuery) }} belum tercatat dalam sistem APLI
                DAKOP atau pendaftaran belum diajukan.
              </div>
              <q-btn flat color="primary" class="q-mt-sm text-weight-bold" label="Daftarkan Usaha Sekarang" @click="
                activeTab = 'daftar';
              daftarSubTab = 'daftar_umkm';
              " />
            </q-card>
          </div>
        </section>
      </main>

      <!-- DETAIL KOPERASI DIALOG (RESPONSIF MOBILE / IPAD) -->
      <q-dialog v-model="detailKoperasiOpen" position="bottom">
        <q-card class="detail-dialog-card bg-white">
          <div class="detail-dialog-header row items-center justify-between">
            <div class="row items-center no-wrap">
              <div class="detail-header-icon flex flex-center q-mr-sm">
                <q-icon name="verified_user" size="22px" />
              </div>
              <div>
                <div class="dialog-eyebrow">Data terverifikasi</div>
                <div class="text-subtitle1 text-weight-bolder text-grey-9">
                  Detail Legalitas Koperasi
                </div>
              </div>
            </div>
            <q-btn icon="close" flat round v-close-popup color="grey-7" aria-label="Tutup" />
          </div>

          <div v-if="selectedKoperasi" class="detail-dialog-body text-caption">
            <div class="detail-name text-subtitle1 text-weight-bold">
              {{ selectedKoperasi.nama_koperasi }}
            </div>
            <div class="detail-row row justify-between">
              <span class="text-grey-6">No. Badan Hukum:</span>
              <span class="text-weight-medium text-grey-9">{{
                selectedKoperasi.no_bh || "-"
              }}</span>
            </div>
            <div class="detail-row row justify-between items-center">
              <span class="text-grey-6">Status Keaktifan:</span>
              <q-chip dense size="xs" :color="isKoperasiAktif(selectedKoperasi.status_koperasi)
                ? 'positive'
                : 'grey-5'
                " text-color="white" class="text-weight-bold">
                {{ selectedKoperasi.status_koperasi || "Aktif" }}
              </q-chip>
            </div>
            <div class="detail-row row justify-between">
              <span class="text-grey-6">Jenis Koperasi:</span>
              <span class="text-grey-9">{{
                selectedKoperasi.jenis_koperasi_nama || "-"
              }}</span>
            </div>
            <div class="detail-row row justify-between">
              <span class="text-grey-6">Bentuk Koperasi:</span>
              <span class="text-grey-9">{{
                selectedKoperasi.bentuk_koperasi || "Primer"
              }}</span>
            </div>
            <div class="detail-row row justify-between">
              <span class="text-grey-6">Kecamatan:</span>
              <span class="text-grey-9">{{
                selectedKoperasi.nama_kecamatan
              }}</span>
            </div>
            <div class="detail-row row justify-between">
              <span class="text-grey-6">Desa / Kelurahan:</span>
              <span class="text-grey-9">{{ selectedKoperasi.nama_desa }}</span>
            </div>
          </div>
        </q-card>
      </q-dialog>
    </q-pull-to-refresh>

    <!-- FLOATING SKM (SURVEI KEPUASAN MASYARAKAT) -->
    <Skm nama-aplikasi="Koperasi & UMKM" />
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { KoperasiService } from "src/api/apiKoperasi";
import Skm from "src/components/Skm.vue";

export default {
  name: "KoperasiUmkmDashboard",
  components: {
    Skm,
  },
  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const activeTab = ref("koperasi");

    const stats = ref({
      totalKoperasi: 0,
      koperasiAktif: 0,
      koperasiNonAktif: 0,
      totalUmkm: 0,
    });

    const kecamatanOptions = ref([]);
    const jenisUsahaOptions = ref([]);
    const jenisKoperasiOptions = ref([]);

    // 1. Data Koperasi (dengan filter kecamatan & desa)
    const koperasiList = ref([]);
    const koperasiLoading = ref(false);
    const koperasiQuery = ref("");
    const koperasiKecamatan = ref(null);
    const koperasiDesa = ref(null);
    const koperasiDesaOptions = ref([]);
    const koperasiJenis = ref(null);
    const koperasiStatus = ref("");
    const koperasiPage = ref(1);
    const koperasiTotal = ref(0);
    const koperasiTotalPages = ref(1);
    let koperasiTimer = null;

    // 2. Data UMKM
    const umkmList = ref([]);
    const umkmLoading = ref(false);
    const umkmQuery = ref("");
    const umkmKecamatan = ref(null);
    const umkmDesa = ref(null);
    const umkmDesaOptions = ref([]);
    const umkmJenisUsaha = ref(null);
    const umkmPage = ref(1);
    const umkmTotal = ref(0);
    const umkmTotalPages = ref(1);
    let umkmTimer = null;

    // 3. Detail Koperasi Modal
    const detailKoperasiOpen = ref(false);
    const selectedKoperasi = ref(null);

    // 4. Layanan Pendaftaran (2 Sub-tab: daftar_umkm & ajukan_bantuan)
    const daftarSubTab = ref("daftar_umkm");

    // Form Pendaftaran UMKM Baru
    const formDaftar = ref({
      nik: "",
      nama_pemilik: "",
      nama_usaha: "",
      jenisusaha_id: null,
      no_hp: "",
      kecamatan_id: null,
      desa_id: null,
      alamat_usaha: "",
    });
    const desaOptions = ref([]);
    const formLoading = ref(false);

    // Form Pengajuan Bantuan UMKM
    const bantuanSearch = ref("");
    const bantuanSearching = ref(false);
    const bantuanSearchResults = ref([]);
    const bantuanSelectedPelaku = ref(null);
    const bantuanNik = ref("");
    const bantuanFiles = ref({
      proposal: null,
      ktp: null,
      kk: null,
      sku: null,
    });
    const bantuanSubmitting = ref(false);
    const bantuanSuccessId = ref("");
    let bantuanSearchTimer = null;

    // 5. Cek NIK
    const nikInputRef = ref(null);
    const nikQuery = ref("");
    const nikLoading = ref(false);
    const nikSearched = ref(false);
    const nikProfil = ref(null);
    const nikRiwayat = ref([]);

    const formatNumber = (num) => {
      return new Intl.NumberFormat("id-ID").format(num || 0);
    };

    // Masking NIK Sesuai UU PDP
    const maskNik = (nik) => {
      if (!nik) return "";
      const str = String(nik).trim();
      if (str.length < 8) return str;
      return str.substring(0, 4) + "********" + str.substring(str.length - 4);
    };

    const formatDateOnly = (dStr) => {
      if (!dStr) return "-";
      try {
        const d = new Date(dStr);
        return d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return dStr;
      }
    };

    const getStatusBadgeColor = (status) => {
      if (!status) return "amber-9";
      const s = status.toUpperCase();
      if (
        s.includes("SETUJU") ||
        s.includes("VERIFIKASI") ||
        s.includes("SELESAI")
      )
        return "positive";
      if (s.includes("TOLAK")) return "negative";
      return "amber-9";
    };

    const isKoperasiAktif = (status) => {
      if (!status) return true;
      const s = status.toLowerCase();
      return s.includes("aktif") || s.includes("sehat");
    };

    const setKoperasiStatus = (statusVal) => {
      koperasiStatus.value = statusVal;
      fetchKoperasiList(1);
    };

    const goBack = () => {
      router.back();
    };

    // Ambil Statistik Agregat
    const fetchStatistik = async () => {
      try {
        const res = await KoperasiService.getStatistik();
        if (res.data?.status && res.data?.data) {
          stats.value = res.data.data;
        }
      } catch (err) {
        console.warn("Gagal memuat statistik koperasi:", err);
      }
    };

    // Ambil Master Kecamatan, Jenis Usaha, & Jenis Koperasi
    const fetchMasterData = async () => {
      try {
        const [resKec, resJenisUsaha, resJenisKop] = await Promise.all([
          KoperasiService.getKecamatan(),
          KoperasiService.getJenisUsaha(),
          KoperasiService.getJenisKoperasi(),
        ]);
        if (resKec.data?.status && resKec.data?.data) {
          kecamatanOptions.value = resKec.data.data;
        }
        if (resJenisUsaha.data?.status && resJenisUsaha.data?.data) {
          jenisUsahaOptions.value = resJenisUsaha.data.data;
        }
        if (resJenisKop.data?.status && resJenisKop.data?.data) {
          jenisKoperasiOptions.value = resJenisKop.data.data;
        }
      } catch (err) {
        console.warn("Gagal memuat data referensi:", err);
      }
    };

    // Fetch Direktori Koperasi (dengan filter kecamatan & desa)
    const fetchKoperasiList = async (page = 1) => {
      koperasiPage.value = page;
      koperasiLoading.value = true;
      try {
        const params = {
          page,
          limit: 10,
          search: koperasiQuery.value?.trim() || "",
          kecamatan_id: koperasiKecamatan.value || "",
          desa_id: koperasiDesa.value || "",
          jenis_koperasi: koperasiJenis.value || "",
          status: koperasiStatus.value || "",
        };
        const res = await KoperasiService.getKoperasi(params);
        if (res.data?.status) {
          koperasiList.value = res.data.data || [];
          koperasiTotal.value = res.data.total || 0;
          koperasiTotalPages.value = res.data.totalPages || 1;
        }
      } catch (err) {
        console.error("Error load koperasi:", err);
      } finally {
        koperasiLoading.value = false;
      }
    };

    const onKoperasiSearchInput = () => {
      clearTimeout(koperasiTimer);
      koperasiTimer = setTimeout(() => {
        fetchKoperasiList(1);
      }, 400);
    };

    const onKoperasiKecamatanChange = async (kecId) => {
      koperasiDesa.value = null;
      koperasiDesaOptions.value = [];
      if (kecId) {
        try {
          const res = await KoperasiService.getDesa(kecId);
          if (res.data?.status && res.data?.data) {
            koperasiDesaOptions.value = res.data.data;
          }
        } catch (err) {
          console.error("Error load desa koperasi:", err);
        }
      }
      fetchKoperasiList(1);
    };

    const onUmkmKecamatanChange = async (kecId) => {
      umkmDesa.value = null;
      umkmDesaOptions.value = [];
      if (kecId) {
        try {
          const res = await KoperasiService.getDesa(kecId);
          if (res.data?.status && res.data?.data) {
            umkmDesaOptions.value = res.data.data;
          }
        } catch (err) {
          console.error("Error load desa umkm:", err);
        }
      }
      fetchUmkmList(1);
    };

    // Fetch Katalog UMKM
    const fetchUmkmList = async (page = 1) => {
      umkmPage.value = page;
      umkmLoading.value = true;
      try {
        const params = {
          page,
          limit: 10,
          search: umkmQuery.value?.trim() || "",
          kecamatan_id: umkmKecamatan.value || "",
          desa_id: umkmDesa.value || "",
          jenisusaha_id: umkmJenisUsaha.value || "",
        };
        const res = await KoperasiService.getUmkm(params);
        if (res.data?.status) {
          umkmList.value = res.data.data || [];
          umkmTotal.value = res.data.total || 0;
          umkmTotalPages.value = res.data.totalPages || 1;
        }
      } catch (err) {
        console.error("Error load umkm:", err);
      } finally {
        umkmLoading.value = false;
      }
    };

    const onUmkmSearchInput = () => {
      clearTimeout(umkmTimer);
      umkmTimer = setTimeout(() => {
        fetchUmkmList(1);
      }, 400);
    };

    const openDetailKoperasi = (item) => {
      selectedKoperasi.value = item;
      detailKoperasiOpen.value = true;
    };

    // Dropdown Desa Berdasarkan Kecamatan (Form Pendaftaran UMKM)
    const onKecamatanChange = async (kecId) => {
      formDaftar.value.desa_id = null;
      desaOptions.value = [];
      if (!kecId) return;
      try {
        const res = await KoperasiService.getDesa(kecId);
        if (res.data?.status && res.data?.data) {
          desaOptions.value = res.data.data;
        }
      } catch (err) {
        console.error("Error load desa:", err);
      }
    };

    // Kirim Pendaftaran UMKM Baru
    const onSubmitPendaftaran = async () => {
      formLoading.value = true;
      try {
        const formData = new FormData();
        Object.keys(formDaftar.value).forEach((key) => {
          if (
            formDaftar.value[key] !== null &&
            formDaftar.value[key] !== undefined
          ) {
            formData.append(key, formDaftar.value[key]);
          }
        });

        const res = await KoperasiService.submitPendaftaran(formData);
        if (res.data?.status) {
          $q.notify({
            type: "positive",
            message: "Pendaftaran Berhasil!",
            caption:
              "Data usaha Anda telah masuk ke sistem verifikasi Dinas Koperasi.",
          });
          formDaftar.value = {
            nik: "",
            nama_pemilik: "",
            nama_usaha: "",
            jenisusaha_id: null,
            no_hp: "",
            kecamatan_id: null,
            desa_id: null,
            alamat_usaha: "",
          };
        } else {
          $q.notify({
            type: "negative",
            message: res.data?.message || "Gagal mengirim pendaftaran",
          });
        }
      } catch (err) {
        $q.notify({
          type: "negative",
          message: "Terjadi kesalahan sistem saat mendaftar.",
        });
      } finally {
        formLoading.value = false;
      }
    };

    // Pencarian Pelaku Usaha Terdaftar untuk Pengajuan Bantuan
    const onBantuanSearchInput = () => {
      clearTimeout(bantuanSearchTimer);
      const q = bantuanSearch.value?.trim() || "";
      if (q.length < 3) {
        bantuanSearchResults.value = [];
        return;
      }
      bantuanSearching.value = true;
      bantuanSearchTimer = setTimeout(async () => {
        try {
          const res = await KoperasiService.cariPelakuBantuan(q);
          if (res.data?.status) {
            bantuanSearchResults.value = res.data.data || [];
          }
        } catch (err) {
          console.error("Error cari pelaku bantuan:", err);
        } finally {
          bantuanSearching.value = false;
        }
      }, 350);
    };

    const onPelakuSelected = (pelaku) => {
      bantuanSelectedPelaku.value = pelaku;
      bantuanNik.value = "";
    };

    // Kirim Pengajuan Bantuan UMKM
    const onSubmitBantuan = async () => {
      if (!bantuanSelectedPelaku.value) {
        $q.notify({
          type: "warning",
          message: "Silakan pilih usaha terlebih dahulu.",
        });
        return;
      }

      bantuanSubmitting.value = true;
      try {
        const formData = new FormData();
        formData.append("pelaku_id", bantuanSelectedPelaku.value.id);
        formData.append("nik", bantuanNik.value.trim());

        if (bantuanFiles.value.proposal)
          formData.append("proposal", bantuanFiles.value.proposal);
        if (bantuanFiles.value.ktp)
          formData.append("ktp", bantuanFiles.value.ktp);
        if (bantuanFiles.value.kk) formData.append("kk", bantuanFiles.value.kk);
        if (bantuanFiles.value.sku)
          formData.append("sku", bantuanFiles.value.sku);

        const res = await KoperasiService.submitBantuan(formData);
        if (res.data?.status) {
          bantuanSuccessId.value =
            res.data.id || "REG-" + Date.now().toString().slice(-6);
          $q.notify({
            type: "positive",
            message: "Pengajuan Bantuan Terkirim!",
            caption: "Berkas Anda sedang menunggu verifikasi petugas dinas.",
          });
        } else {
          $q.notify({
            type: "negative",
            message: res.data?.message || "Gagal mengirim pengajuan bantuan.",
          });
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Terjadi kesalahan sistem saat mengajukan bantuan.";
        $q.notify({ type: "negative", message: msg });
      } finally {
        bantuanSubmitting.value = false;
      }
    };

    const resetBantuanForm = () => {
      bantuanSuccessId.value = "";
      bantuanSearch.value = "";
      bantuanSearchResults.value = [];
      bantuanSelectedPelaku.value = null;
      bantuanNik.value = "";
      bantuanFiles.value = { proposal: null, ktp: null, kk: null, sku: null };
    };

    const pantauStatusBantuan = (nik) => {
      activeTab.value = "status";
      nikQuery.value = nik;
      handleCekNik();
    };

    // Cek NIK (Memeriksa Data Master UMKM & Riwayat Pengajuan/Bantuan)
    const handleCekNik = async () => {
      const cleanNik = nikQuery.value?.trim();
      if (!cleanNik || cleanNik.length < 16) {
        $q.notify({
          type: "warning",
          message: "Ketik 16 digit NIK dengan lengkap.",
        });
        return;
      }

      nikLoading.value = true;
      nikSearched.value = false;
      nikProfil.value = null;
      nikRiwayat.value = [];

      try {
        const [resStatus, resUmkm] = await Promise.all([
          KoperasiService.cekStatusPendaftaran(cleanNik),
          KoperasiService.getUmkm({ search: cleanNik, limit: 1 }),
        ]);

        if (
          resStatus.data?.status &&
          Array.isArray(resStatus.data?.data) &&
          resStatus.data.data.length > 0
        ) {
          nikRiwayat.value = resStatus.data.data;
        }

        if (
          resUmkm.data?.status &&
          Array.isArray(resUmkm.data?.data) &&
          resUmkm.data.data.length > 0
        ) {
          nikProfil.value = resUmkm.data.data[0];
        } else if (nikRiwayat.value.length > 0) {
          const first = nikRiwayat.value[0];
          nikProfil.value = {
            nama_usaha: first.nama_usaha,
            nama_pemilik: first.nama_pemilik,
            jenis_usaha_nama:
              first.jenis === "bantuan" ? "Peserta Bantuan" : "Pendaftar Baru",
            nama_kecamatan: "-",
            nama_desa: "-",
          };
        }

        nikSearched.value = true;
      } catch (err) {
        console.error("Error Cek NIK:", err);
        nikSearched.value = true;
      } finally {
        nikLoading.value = false;
      }
    };

    const focusNikInput = () => {
      if (nikInputRef.value) {
        nikInputRef.value.focus();
      }
    };

    const refreshAll = async (done) => {
      await Promise.all([
        fetchStatistik(),
        fetchMasterData(),
        fetchKoperasiList(1),
        fetchUmkmList(1),
      ]);
      if (typeof done === "function") done();
    };

    onMounted(() => {
      fetchStatistik();
      fetchMasterData();
      fetchKoperasiList(1);
      fetchUmkmList(1);
    });

    return {
      activeTab,
      stats,
      kecamatanOptions,
      jenisUsahaOptions,
      jenisKoperasiOptions,
      koperasiList,
      koperasiLoading,
      koperasiQuery,
      koperasiKecamatan,
      koperasiDesa,
      koperasiDesaOptions,
      koperasiJenis,
      koperasiStatus,
      koperasiPage,
      koperasiTotal,
      koperasiTotalPages,
      onKoperasiSearchInput,
      onKoperasiKecamatanChange,
      fetchKoperasiList,
      setKoperasiStatus,
      openDetailKoperasi,
      umkmList,
      umkmLoading,
      umkmQuery,
      umkmKecamatan,
      umkmDesa,
      umkmDesaOptions,
      umkmJenisUsaha,
      umkmPage,
      umkmTotal,
      umkmTotalPages,
      onUmkmSearchInput,
      onUmkmKecamatanChange,
      fetchUmkmList,
      detailKoperasiOpen,
      selectedKoperasi,
      daftarSubTab,
      formDaftar,
      desaOptions,
      formLoading,
      onKecamatanChange,
      onSubmitPendaftaran,
      bantuanSearch,
      bantuanSearching,
      bantuanSearchResults,
      bantuanSelectedPelaku,
      bantuanNik,
      bantuanFiles,
      bantuanSubmitting,
      bantuanSuccessId,
      onBantuanSearchInput,
      onPelakuSelected,
      onSubmitBantuan,
      resetBantuanForm,
      pantauStatusBantuan,
      nikInputRef,
      nikQuery,
      nikLoading,
      nikSearched,
      nikProfil,
      nikRiwayat,
      handleCekNik,
      focusNikInput,
      formatNumber,
      maskNik,
      formatDateOnly,
      getStatusBadgeColor,
      isKoperasiAktif,
      goBack,
      refreshAll,
    };
  },
};
</script>

<style scoped>
.koperasi-page {
  min-height: 100vh;
  color: #172b27;
  background:
    radial-gradient(circle at 8% 35%,
      rgba(15, 118, 110, 0.05),
      transparent 24rem),
    #f5f7f6;
}

.content-container {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

.koperasi-header {
  position: relative;
  overflow: hidden;
  padding-bottom: 52px;
  background:
    linear-gradient(125deg, rgba(5, 46, 42, 0.98), rgba(15, 118, 110, 0.96)),
    #064e3b;
  border-radius: 0 0 32px 32px;
  box-shadow: 0 20px 50px rgba(6, 78, 59, 0.18);
}

.header-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.45;
  background-image:
    radial-gradient(circle at 82% 16%,
      rgba(255, 255, 255, 0.18) 0 2px,
      transparent 3px),
    radial-gradient(circle at 88% 24%,
      rgba(255, 255, 255, 0.12) 0 1px,
      transparent 2px),
    linear-gradient(115deg,
      transparent 56%,
      rgba(255, 255, 255, 0.055) 56% 57%,
      transparent 57%);
  background-size:
    28px 28px,
    20px 20px,
    100% 100%;
  mask-image: linear-gradient(to left, #000, transparent 72%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 14px 20px 0;
}

.topbar {
  min-height: 46px;
}

.back-button,
.website-icon-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.official-badge {
  gap: 6px;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #d1fae5;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.hero-copy {
  padding: 24px 4px 8px;
}

.hero-kicker,
.section-eyebrow,
.dialog-eyebrow {
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-kicker {
  margin-bottom: 7px;
  color: #99f6e4;
}

.hero-title {
  margin: 0;
  font-size: clamp(28px, 6vw, 42px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.hero-description {
  max-width: 560px;
  margin: 10px 0 16px;
  color: rgba(236, 253, 245, 0.8);
  font-size: 12px;
  line-height: 1.65;
}

.official-site-button {
  min-height: 38px;
  padding: 0 14px;
  color: #064e3b;
  background: #ffffff;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 8px 22px rgba(3, 35, 29, 0.2);
}

.agency-logo-panel {
  width: 230px;
  padding: 19px 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 18px;
  box-shadow: 0 16px 32px rgba(3, 35, 29, 0.22);
}

.agency-logo-panel img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.stats-grid {
  margin-top: 20px;
}

.stat-card {
  min-height: 112px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08);
}

.stat-label {
  margin-bottom: 5px;
  color: rgba(236, 253, 245, 0.74);
  font-size: 11px;
  font-weight: 500;
}

.stat-number {
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
}

.stat-icon--teal {
  color: #5eead4;
  background: rgba(20, 184, 166, 0.18);
}

.stat-icon--amber {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.18);
}

.stat-meta {
  min-height: 20px;
  margin-top: 12px;
  font-size: 10px;
}

.badge-sub {
  padding: 3px 7px;
  border-radius: 7px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-active {
  background: rgba(16, 185, 129, 0.25);
  color: #a7f3d0;
}

.badge-inactive {
  background: rgba(255, 255, 255, 0.09);
  color: #d1fae5;
}

.stat-note {
  gap: 3px;
  color: rgba(236, 253, 245, 0.72);
}

.sticky-nav {
  position: sticky;
  top: 8px;
  z-index: 20;
  margin-top: -27px;
  padding: 0 16px;
}

.nav-shell {
  overflow: hidden;
  padding: 5px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 118, 110, 0.11);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(15, 53, 45, 0.13);
  backdrop-filter: blur(16px);
}

.service-tabs {
  color: #73837f;
}

.service-tabs :deep(.q-tab) {
  min-height: 57px;
  margin: 0 2px;
  border-radius: 13px;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.service-tabs :deep(.q-tab__icon) {
  margin-bottom: 3px;
  font-size: 21px;
}

.service-tabs :deep(.q-tab__label) {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.15;
}

.service-tabs :deep(.q-tab--active) {
  color: #0f766e !important;
  background: #ecfdf5;
}

.main-content {
  padding-top: 36px;
}

.content-section {
  animation: section-enter 0.28s ease-out;
}

@keyframes section-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-heading {
  padding: 0 2px;
}

.section-eyebrow {
  margin-bottom: 5px;
  color: #0f766e;
}

.section-title {
  margin: 0;
  color: #172b27;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.section-description {
  margin: 6px 0 0;
  color: #72817d;
  font-size: 11px;
  line-height: 1.55;
}

.filter-panel {
  padding: 14px;
  background: #ffffff;
  border: 1px solid #e4ebe8;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(17, 55, 47, 0.055);
}

.search-field :deep(.q-field__control) {
  min-height: 48px;
  border-radius: 12px;
}

.filter-panel :deep(.q-field--outlined .q-field__control),
.service-card :deep(.q-field--outlined .q-field__control),
.card-cek-nik :deep(.q-field--outlined .q-field__control) {
  border-radius: 11px;
}

.filter-panel :deep(.q-field--outlined .q-field__control::before),
.service-card :deep(.q-field--outlined .q-field__control::before),
.card-cek-nik :deep(.q-field--outlined .q-field__control::before) {
  border-color: #dce5e2;
}

.status-filter {
  padding-top: 2px;
}

.status-filter :deep(.q-chip) {
  min-height: 27px;
  padding: 0 9px;
  border-radius: 8px;
}

.result-toolbar {
  min-height: 24px;
  padding: 0 2px;
  color: #71807c;
  font-size: 11px;
}

.result-count strong {
  color: #173b33;
  font-size: 13px;
}

.empty-state {
  padding: 48px 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px dashed #cddbd6;
  border-radius: 18px;
}

.empty-state-icon {
  display: grid;
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  place-items: center;
  color: #83a39a;
  background: #edf5f2;
  border-radius: 18px;
}

.bordered-card {
  border: 1px solid #e1e9e6;
  border-radius: 18px;
}

.koperasi-item-card,
.umkm-item-card {
  background: #ffffff;
  border: 1px solid #e4ebe8;
  border-radius: 16px;
  box-shadow: 0 7px 20px rgba(22, 57, 49, 0.045);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.directory-card-section {
  padding: 14px;
}

.directory-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  color: #0f766e;
  background: #e9f7f3;
  border-radius: 11px;
}

.directory-icon--amber {
  color: #a16207;
  background: #fff7df;
}

.directory-title {
  min-width: 0;
  padding-top: 1px;
  line-height: 1.35;
}

.data-line {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 6px 9px;
  color: #64736f;
  background: #f7faf9;
  border-radius: 9px;
}

.data-line .q-icon {
  color: #0f766e;
}

.data-line strong {
  overflow: hidden;
  color: #253c36;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer-line {
  min-height: 22px;
  font-size: 10px;
}

.category-label {
  max-width: 43%;
  overflow: hidden;
  color: #0f766e;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Card UMKM Modern */
.umkm-card-modern {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  overflow: hidden;
}

.umkm-card-modern:active {
  transform: scale(0.985);
}

@media (hover: hover) {
  .umkm-card-modern:hover {
    border-color: #cbd5e1;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.07);
    transform: translateY(-2px);
  }
}

.umkm-card-body {
  padding: 13px 14px 11px 14px;
}

/* Category Pill */
.umkm-badge-category {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  padding: 2px 9px;
  max-width: 65%;
}

.umkm-badge-category .q-icon {
  color: #b45309;
}

/* Year Badge */
.umkm-badge-year {
  background: #f1f5f9;
  color: #64748b;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 8px;
}

/* Avatar Icon */
.umkm-avatar-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #d97706;
  border: 1px solid #fde68a;
}

/* Business Title */
.umkm-business-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  padding-top: 1px;
}

/* Identity Box */
.umkm-identity-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 5px 9px;
}

.identity-label {
  font-size: 11px;
  color: #64748b;
}

.identity-value {
  font-size: 12px;
  color: #0f172a;
  max-width: 60%;
}

.identity-divider {
  border-top: 1px dashed #e2e8f0;
  margin: 3px 0;
}

.identity-nik {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  color: #334155;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 1px 6px;
  border-radius: 5px;
  letter-spacing: 0.3px;
}

/* Footer */
.umkm-footer {
  border-top: 1px solid #f1f5f9;
  margin-top: 6px;
}

.umkm-location {
  font-size: 11px;
  color: #64748b;
}

.umkm-verified-tag {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 7px;
}

.koperasi-item-card:active,
.umkm-item-card:active {
  transform: scale(0.985);
}

@media (hover: hover) {

  .koperasi-item-card:hover,
  .umkm-item-card:hover {
    border-color: #b8d9d1;
    box-shadow: 0 14px 30px rgba(22, 57, 49, 0.09);
    transform: translateY(-2px);
  }
}

.form-container-box {
  max-width: 700px;
  margin: 0 auto;
}

.service-card {
  box-shadow: 0 10px 30px rgba(17, 55, 47, 0.06);
}

.service-card-header {
  padding-bottom: 14px;
  border-bottom: 1px solid #edf1ef;
}

.form-step-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3f514c;
  font-size: 11px;
  font-weight: 700;
}

.form-step-label>span {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: #ffffff;
  background: #0f766e;
  border-radius: 8px;
  font-size: 11px;
}

.primary-action {
  min-height: 44px;
  border-radius: 11px;
  letter-spacing: 0;
}

.success-card {
  padding-top: 26px !important;
  padding-bottom: 26px !important;
}

.card-cek-nik {
  background: #ffffff;
  border: 1px solid #dce8e4;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(17, 55, 47, 0.07);
}

.cek-nik-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  background: #e8f6f2;
}

.border-b {
  border-bottom: 1px solid #f1f5f9;
}

.border-subtle {
  border: 1px solid #e2e8f0;
}

.catatan-dinas-box {
  background: #fff1f2;
  border: 1px dashed #fecdd3;
}

.custom-subtab-toggle {
  border: 1px solid #dfe8e5;
  padding: 4px;
  border-radius: 15px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 6px 18px rgba(17, 55, 47, 0.055);
}

.custom-subtab-toggle :deep(.q-btn) {
  min-height: 43px;
  border-radius: 11px !important;
  font-size: 11px;
  font-weight: 600;
}

.detail-dialog-card {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -12px 40px rgba(15, 53, 45, 0.2);
}

.detail-dialog-header {
  padding: 16px 18px;
  background: linear-gradient(135deg, #f0fdfa, #f7fbfa);
  border-bottom: 1px solid #e1ebe8;
}

.detail-header-icon {
  width: 42px;
  height: 42px;
  color: #0f766e;
  background: #d9f4ec;
  border-radius: 13px;
}

.dialog-eyebrow {
  margin-bottom: 2px;
  color: #0f766e;
  font-size: 8px;
}

.detail-dialog-body {
  padding: 18px;
}

.detail-name {
  margin-bottom: 14px;
  padding: 13px 14px;
  color: #0f766e;
  background: #f0fdfa;
  border-left: 3px solid #14b8a6;
  border-radius: 5px 12px 12px 5px;
}

.detail-row {
  gap: 16px;
  padding: 11px 2px;
  border-bottom: 1px solid #eef2f1;
}

.detail-row:last-child {
  border-bottom: 0;
}

.empty-result {
  padding-top: 34px !important;
  padding-bottom: 34px !important;
}

@media (min-width: 600px) {
  .header-content {
    padding-right: 24px;
    padding-left: 24px;
  }

  .hero-copy {
    padding-top: 30px;
  }

  .stat-card {
    min-height: 120px;
    padding: 18px;
  }

  .service-tabs :deep(.q-tab__label) {
    font-size: 11px;
  }

  .service-tabs :deep(.q-tab) {
    min-height: 61px;
  }

  .main-content {
    padding-top: 42px;
  }

  .section-title {
    font-size: 25px;
  }

  .section-description {
    font-size: 12px;
  }

  .directory-card-section {
    padding: 16px;
  }

  .detail-dialog-card {
    border-radius: 24px;
    margin-bottom: 24px;
  }
}

@media (max-width: 599px) {
  .koperasi-header {
    padding-bottom: 48px;
    border-radius: 0 0 25px 25px;
  }

  .header-content {
    padding-right: 14px;
    padding-left: 14px;
  }

  .hero-copy {
    padding-right: 4px;
    padding-left: 4px;
  }

  .hero-description {
    max-width: 92%;
  }

  .stats-grid {
    margin-top: 18px;
  }

  .stats-grid>div:first-child {
    padding-right: 4px;
  }

  .stats-grid>div:last-child {
    padding-left: 4px;
  }

  .stat-card {
    min-height: 108px;
    padding: 12px;
  }

  .stat-icon {
    width: 34px;
    height: 34px;
    border-radius: 11px;
  }

  .badge-sub {
    padding: 2px 5px;
    font-size: 8px;
  }

  .nav-shell {
    padding: 4px 2px;
    border-radius: 16px;
  }

  .sticky-nav {
    padding: 0 10px;
  }

  .service-tabs :deep(.q-tab) {
    min-width: 0;
    padding: 0 3px;
  }

  .service-tabs :deep(.q-tab__label) {
    font-size: 9px;
  }

  .filter-panel {
    padding: 12px;
  }

  .directory-card-section {
    padding: 13px;
  }

  .card-cek-nik {
    padding: 16px !important;
  }

  .card-cek-nik .q-btn :deep(.q-icon) {
    display: none;
  }
}

.koperasi-page :deep(.text-primary) {
  color: #0f766e !important;
}

.koperasi-page :deep(.bg-primary) {
  background: #0f766e !important;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
