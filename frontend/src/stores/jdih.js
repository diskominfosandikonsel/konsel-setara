import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { JdihService } from 'src/services/jdih.service'

export const useJdihStore = defineStore('jdih', {
    state: () => ({
        produkHukum: [],
        detailProduk: null,
        jml_data: 0,
        loading: false
    }),

    actions: {
        // 🌐 PRODUK HUKUM (NO TOKEN)
        async fetchProdukHukum(payload = {}) {
            console.log("terpanggil");
            this.loading = true
            Loading.show()

            try {
                const res = await JdihService.getProdukHukum(payload)
                // console.log("Response Backend:", res.data)
                this.produkHukum = res.data.data
                this.jml_data = res.data.jml_data
            } catch (err) {
                Notify.create({
                    message: 'Gagal ambil data',
                    color: 'negative'
                })
            } finally {
                this.loading = false
                Loading.hide()
            }
        },
        async fetchDetailProduk(id) {
            this.loading = true;
            try {
                const res = await JdihService.getDetailProduk(id);
                // console.log('Detail Produk Response:', res.data);
                this.detailProduk = res.data;
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        // untuk load infinity scroll
        async fetchMoreProdukHukum(payload) {
            try {
                const res = await JdihService.getProdukHukum(payload);
                this.produkHukum = [...this.produkHukum, ...res.data.data];
            } catch (err) {
                console.error(err);
            }
        },
    }
})