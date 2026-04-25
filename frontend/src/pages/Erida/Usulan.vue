<template>
  <!-- HEADER -->
  <q-header bordered class="bg-white text-black">
    <q-toolbar>
      <q-btn flat round dense icon="r_chevron_left" @click="goBack" />
      <q-toolbar-title>Usulan Tema Penelitian</q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md bg-white pb-xl">
    <!-- 🔍 SEARCH -->
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

    <!-- 🦴 SKELETON -->
    <div v-if="skeletonLoading" class="q-mt-sm">
      <div v-for="n in 6" :key="n" class="q-mb-md">
        <q-skeleton height="70px" />
      </div>
    </div>

    <!-- 📜 LIST + INFINITE -->
    <q-infinite-scroll v-else @load="onLoad" :offset="150" class="q-mt-sm">
      <div
        v-for="(item, i) in temaList"
        :key="i"
        class="tema-card q-mb-sm"
        :class="{ active: expandedId === item.id }"
        @click="toggleExpand(item)"
      >
        <div class="col">
          <div
            class="tema-text text-weight-medium text-primary"
            :class="{ collapsed: expandedId !== item.id }"
          >
            {{ item.tema }}
          </div>
          <div class="row items-start justify-between no-wrap">
            <!-- OPD (tetap di bawah tema) -->
            <div class="opd-text text-caption text-grey-7 text-weight-medium">
              {{ item.opd }}
            </div>

            <q-fab
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
      </div>

      <!-- LOADING -->
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots size="40px" color="primary" />
        </div>
      </template>

      <!-- END -->
      <div
        v-if="allDataLoaded && temaList.length > 0"
        class="text-center text-grey-5 q-py-md text-caption"
      >
        Tidak ada data lagi
      </div>
    </q-infinite-scroll>

    <!-- EMPTY -->
    <div
      v-if="!skeletonLoading && temaList.length === 0"
      class="text-center text-grey-5 q-mt-lg"
    >
      Tidak ada data ditemukan
    </div>

    <!-- ➕ FLOATING BUTTON -->
    <q-page-sticky
      position="bottom-right"
      :offset="[17.5, 17.5]"
      style="z-index: 9999"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        class="shadow-10"
        @click="addItem"
      />
    </q-page-sticky>

    <!-- 🧾 FORM MODAL -->
    <q-dialog v-model="showForm">
      <q-card style="width: 100%; max-width: 400px; border-radius: 16px">
        <!-- HEADER -->
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">
            {{ isEdit ? "Edit Tema" : "Tambah Tema" }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <!-- FORM -->
        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.tema"
            label="Tema Penelitian"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input v-model="form.opd" label="Nama Instansi" outlined dense />
        </q-card-section>

        <!-- ACTION -->
        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn label="Simpan" color="primary" @click="submitForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useEridaStore } from "stores/erida";

export default {
  name: "UsulanTema",

  data() {
    return {
      temaList: [],
      page: 1,
      lastPage: 1,
      allDataLoaded: false,
      cari: "",
      skeletonLoading: true,
      showForm: false,
      isEdit: false,
      expandedId: null,
      form: {
        id: null,
        tema: "",
        opd: "",
      },
    };
  },

  computed: {
    erida() {
      return useEridaStore();
    },
  },

  methods: {
    goBack() {
      this.$router.back();
    },

    toggleExpand(item) {
      this.expandedId = this.expandedId === item.id ? null : item.id;
    },

    async loadData(reset = false) {
      if (this.erida.loading) return;

      if (reset) {
        this.page = 1;
        this.temaList = [];
        this.allDataLoaded = false;
        this.erida.tema = [];
      }

      const payload = {
        data_ke: this.page,
        cari_value: this.cari,
      };

      await this.erida.fetchTema(payload, !reset);

      const totalPage = this.erida.dataLastPage || 1;
      this.lastPage = totalPage;

      this.temaList = [...this.erida.tema];

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
      return `tema_${this.cari || "all"}`;
    },

    clearSearch() {
      this.cari = "";
      this.onSearch();
    },

    addItem() {
      this.isEdit = false;
      this.form = {
        id: null,
        tema: "",
        opd: "",
      };
      this.showForm = true;
    },

    editItem(item) {
      this.isEdit = true;
      this.form = {
        id: item.id,
        tema: item.tema,
        opd: item.opd,
      };
      this.showForm = true;
    },

    deleteItem(item) {
      this.$q
        .dialog({
          title: "Konfirmasi",
          message: "Hapus data ini?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          console.log("DELETE", item);
          // call API delete di sini
        });
    },
  },

  mounted() {
    this.loadData(true);
  },
};
</script>

<style scoped>
.pb-xl {
  padding-bottom: 30px;
}

/* CARD */
.tema-card {
  padding: 12px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #eef2f7;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* ACTIVE CARD */
.tema-card.active {
  background: #eef4ff;
  border-color: #c7d7ff;
  padding: 16px;
}

/* TEMA TEXT */
.tema-text {
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.25s ease;
}

/* COLLAPSED (dipotong) */
.tema-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* EXPANDED */
.tema-card.active .tema-text {
  -webkit-line-clamp: unset;
  font-size: 15px;
}

/* OPD */
.opd-text {
  margin-top: 5px;
  transition: all 0.25s ease;
}

/* efek naik dikit saat expand */
.tema-card.active .opd-text {
  margin-top: 10px;
  font-size: 12px;
  color: #4b5563;
}

.tema-card:active {
  transform: scale(0.98);
}

.q-dialog__inner > div {
  animation: scaleIn 0.2s ease;
}

.q-page-sticky {
  pointer-events: none;
}

.q-page-sticky .q-btn {
  pointer-events: all;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* TABLET */
@media (min-width: 600px) {
  .tema-card {
    padding: 16px;
  }
}

/* DESKTOP */
@media (min-width: 900px) {
  .q-page {
    max-width: 800px;
    margin: auto;
  }
}
</style>
