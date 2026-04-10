<template>
    <q-layout view="hHh lpR fFf">
        <q-header bordered class="bg-white text-black">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
                    </q-avatar>
                    <span class="headerText">Putusan Pengadilan</span>
                </q-toolbar-title>
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page class="q-pa-md" style="background-color: #FFFFFF;">
                <div class="q-px-md q-pt-sm">
                    <div class="row q-col-gutter-sm">
                        <div class="col-12">
                            <q-input 
                                v-model="cari_value" 
                                dense outlined 
                                placeholder="Cari data..." 
                                class="search-input"
                                bg-color="grey-1"
                                @update:model-value="loadData"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="search" size="20px" />
                                </template>
                            </q-input>
                        </div>
                    </div>
                </div>
                <q-list class="mulish q-pa-md">
                    <q-infinite-scroll @load="onLoad" :offset="250" :disable="page_first >= jdih.jml_data">
                        <q-card 
                            v-for="(item, index) in jdih.dokumen"
                            :key="index" 
                            class="q-mb-md cardPerda"
                        >
                            <q-card-section class="q-pa-md">
                                <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-xs line-clamp-2" @click="getDetil(item)">
                                    {{ item.judul }}
                                </div>
                                <div class="text-caption text-grey-8 q-mt-sm line-clamp-3">
                                    {{ item.deskripsi }}
                                </div>
                                <div class="text-caption text-grey-7 q-mb-sm">
                                    <div class="row items-center q-mt-xs">
                                        <span>Sumber: {{ item.createBy }}</span>
                                    </div>
                                </div>

                                <q-separator inset class="q-my-sm" style="opacity: 0.5;" />

                                <div class="row items-center q-mt-sm">
                                    <div class="row items-center text-grey-7">
                                        <q-icon name="r_calendar_month" size="16px" class="q-mr-xs" />
                                        <span class="text-caption">{{ tglConvert(item.createAt) }}</span>
                                    </div>
                                    <q-space />
                                    <div class="text-positive text-caption text-weight-bolder">
                                        <q-badge color="blue-1" text-color="primary" class="text-weight-bolder q-px-sm q-py-xs">
                                            <q-icon name="description" size="14px" class="q-mr-xs" />
                                            {{ item.jenis }}
                                        </q-badge>
                                        
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>

                        <template v-slot:loading>
                            <div class="row justify-center q-my-md">
                                <q-spinner-dots color="primary" size="40px" />
                            </div>
                        </template>
                    </q-infinite-scroll>

                    <div v-if="jdih.dokumen.length === 0" class="justify-center items-center q-pa-md empty-container">
                        <q-img
                            src="/img/no_data.png"
                            fit="contain"
                            style="width: 120px; height: 120px;"
                            no-spinner
                        />
                        <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
                            Tidak ada data ditemukan
                        </div>
                    </div>
                </q-list>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import { useJdihStore } from '../../stores/jdih'
import { formatDate } from '../../utils/library'

export default {
    data() {
        return {
            cari_value: '',
            page_first: 1,
            page_last: 0,
            jenis: 'Putusan Pengadilan',
        }
    },
    computed: {
        jdih() {
            return useJdihStore()
        },
    },
    watch: {
        cari_value() { this.loadData() },
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        getDetil(item) {
            this.jdih.dokumen = item; 
            this.$router.push({
                path: '/detilDokumen' 
            });
        },

        async loadData() {
            const payload = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
                jenis: this.jenis,
            }
            // console.log("Data dikirim:", payload);
            await this.jdih.fetchDokumen(payload)
        },

        async onLoad(done){
            if (this.page_first >= this.jdih.jml_data) {
                done();
                return;
            }
            this.page_first++;
            const payload = {
                data_ke: this.page_first,
                cari_value: this.cari_value,
                cari_jenis: this.jenis,
            };
            await this.jdih.fetchMoreDokumen(payload);
            done();
        },
        tglConvert(tgl) {
            return formatDate(tgl)
        }
    },
    mounted() {
        this.loadData()
    }
}
</script>
