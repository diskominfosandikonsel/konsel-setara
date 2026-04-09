<template>
    <q-page class="bg-grey-1">
        <div class="header q-pa-md">
            <div class="row items-center justify-between relative-position" style="min-height: 40px;">
                <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />
            </div>

            <div>
                <swiper :modules="modules" :slides-per-view="1.15" :centered-slides="true" :space-between="12"
                    :loop="true" :autoplay="{ delay: 4000, disableOnInteraction: false }" class="main-swiper">
                    <swiper-slide v-for="banner in banners" :key="banner.id">
                        <div class="bannerWrapper">
                            <img :src="banner.src" class="banner-img" :alt="banner.alt" />
                        </div>
                    </swiper-slide>
                </swiper>

                <div class="row justify-center q-my-sm q-pb-sm">
                    <!-- <div v-for="n in 3" :key="'dot-' + n" class="nav-dot q-mx-xs cursor-pointer"
                        :class="(activeIndex % 3) === (n - 1) ? 'dot-active' : 'dot-inactive'"
                        @click="goToSlide(n - 1)"></div> -->
                </div>
            </div>

            <div class="header-fade"></div>
        </div>

        <div class="content q-pa-md">
            <q-card class="q-pa-md q-mb-md cardJdih">
                <div class="text-subtitle2 text-weight-bold text-grey-9">Produk Hukum</div>
                <div class="row q-col-gutter-xs">
                    <div class="col-3">
                        <div @click="goPerda">
                            <q-card-section class="menuSection">
                                <div class="cardx flex flex-center">
                                    <q-img src="/img/jdih/perda.png" class="card-icon" />
                                </div>
                                <div class="judul">Peraturan Daerah</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div @click="goPerbup">
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/perbup.png" class="card-icon" />
                                </div>
                                <div class="judul">Peraturan Bupati</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/kepbup.png" class="card-icon" />
                                </div>
                                <div class="judul">Keputusan Bupati</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/insbup.png" class="card-icon" />
                                </div>
                                <div class="judul">Instruksi Bupati</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/skpd.png" class="card-icon" />
                                </div>
                                <div class="judul">Keputusan Kepala OPD</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/pemdes.png" class="card-icon" />
                                </div>
                                <div class="judul">Pemerintah Desa</div>
                            </q-card-section>
                        </div>
                    </div>
                </div>
            </q-card>

            <q-card class="q-pa-md q-mb-md cardJdih">
                <div class="text-subtitle2 text-weight-bold text-grey-9">Dokumen</div>
                <div class="row q-col-gutter-xs">
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx flex flex-center">
                                    <q-img src="/img/jdih/dokumen.png" class="card-icon" />
                                </div>
                                <div class="judul">Surat Keputusan</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/list.png" class="card-icon" />
                                </div>
                                <div class="judul">SOP</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/putusan.png" class="card-icon" />
                                </div>
                                <div class="judul">Putusan Pengadilan</div>
                            </q-card-section>
                        </div>
                    </div>
                    <div class="col-3">
                        <div>
                            <q-card-section class="menuSection">
                                <div class="cardx">
                                    <q-img src="/img/jdih/folder.png" class="card-icon" />
                                </div>
                                <div class="judul">Dokumen Lainnya</div>
                            </q-card-section>
                        </div>
                    </div>
                </div>
            </q-card>
        </div>
    </q-page>
</template>

<script>

// Import Swiper Vue components
import { Swiper, SwiperSlide } from 'swiper/vue';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

// Import required modules
import { Autoplay } from 'swiper/modules';

export default {
    components: {
        Swiper,
        SwiperSlide,
    },
    setup() {
        return {
            modules: [Autoplay],
        };
    },
    name: 'JdihDashboard',
    data() {
        return {
            slide: 1,
            banners: [
                { id: 1, src: '/img/jdih/banner-1.png', alt: 'Layanan Lapor 1' },
                { id: 2, src: '/img/jdih/banner-2.png', alt: 'Layanan Lapor 2' },
                { id: 3, src: '/img/jdih/banner-1.png', alt: 'Layanan Lapor 1' },
            ]
        }
    },
    methods: {
        goBack() {
            this.$router.back()
        },
        goPerda() {
            this.$router.push('/peraturanDaerah');
        },
        goPerbup() {
            this.$router.push('/peraturanBupati');
        },
    }
}
</script>