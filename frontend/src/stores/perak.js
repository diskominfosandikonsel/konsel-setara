import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { PerakService } from 'src/services/perak.service'

export const usePerakStore = defineStore('perak', {
    state: () => ({

        URL_APP: 'https://serverperak.konaweselatankab.go.id/',
        
        biodata: [],
        pendidikan: [],
        pengalaman: [],
        list_kecamatan: [],
        list_des_kel: [],
        list_perkawinan: [],
        list_agama: [],
        list_pendidikan: [],
        list_jurusan: [],
        opsiJenkel: [
            { id: 1, label: 'Laki-laki', value: 'Laki-laki' },
            { id: 2, label: 'Perempuan', value: 'Perempuan' }
        ],

        jml_data: 0,
        selectData: null,
        dataEdit: null,
        
        loading_wilayah: false,
        loading: false,
    }),

    getters: {
        urlFoto: (state) => state.URL_APP + "uploads/"
    },

    actions: {
        async fetchKecamatan() {
            try {
                const res = await PerakService.getKecamatan()
                // console.log(res.data);
                this.list_kecamatan = res.data
            } catch (err) {
                console.error("Gagal load kecamatan", err)
            }
        },
        async fetchDesKel(kecamatan_id) {
            this.loading_wilayah = true
            try {
                const res = await PerakService.getDesKel(kecamatan_id)
                // console.log(res.data);
                this.list_des_kel = res.data
            } catch (err) {
                console.error("Gagal load desa", err)
            } finally {
                this.loading_wilayah = false
            }
        },
        async fetchPerkawinan() {
            try {
                const res = await PerakService.getPerkawinan()
                console.log(res.data);
                this.list_perkawinan = res.data
            } catch (err) {
                console.error("Gagal load perkawinan", err)
            }
        },
        async fetchAgama() {
            try {
                const res = await PerakService.getAgama()
                // console.log(res.data);
                this.list_agama = res.data
            } catch (err) {
                console.error("Gagal load agama", err)
            }
        },
        async fetchPendidikan() {
            try {
                const res = await PerakService.getPendidikan()
                // console.log(res.data);
                this.list_pendidikan = res.data
            } catch (err) {
                console.error("Gagal load pendidikan", err)
            }
        },
        async fetchJurusan(pendidikan_id) {
            this.loading = true
            try {
                const res = await PerakService.getJurusan(pendidikan_id)
                // console.log(res.data);
                this.list_jurusan = res.data
            } catch (err) {
                console.error("Gagal load jurusan", err)
            } finally {
                this.loading = false
            }
        },



        async fetchBiodata(payload = {}) {
            console.log("BIODATA TERPANGGIL");
            this.loading = true;
            try {
                const res = await PerakService.getBiodata(payload)
                console.log("Response Backend:", res.data.data)
                this.biodata = res.data.data
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
        async addBiodata(payload) {
            console.log("ADD BIODATA DIPANGGIL", payload);
            Loading.show({ message: 'Proses menyimpan ke sistem...' });


            try {
                const formData = new FormData();

                formData.append("nik", payload.nik);
                formData.append("tmp_lahir", payload.tmp_lahir);
                formData.append("tgl_lahir", payload.tgl_lahir);
                formData.append("jns_kelamin", payload.jns_kelamin);
                formData.append("alamat", payload.alamat);
                formData.append("dusun", payload.dusun);
                formData.append("rt_rw", payload.rt_rw);
                formData.append("kecamatan_id", payload.kecamatan_id);
                formData.append("des_kel_id", payload.des_kel_id);
                formData.append("kode_pos", payload.kode_pos);
                formData.append("status_perkawinan_id", payload.status_perkawinan_id);
                formData.append("agama_id", payload.agama_id);
                formData.append("tinggi_bdn", payload.tinggi_bdn);
                formData.append("berat_bdn", payload.berat_bdn);
                formData.append("file", payload.file);

                const res = await PerakService.addBiodata(formData);
                
                if (res) {
                Notify.create({
                    message: 'Sukses Menambah Data',
                    color: 'primary',
                    icon: 'check_circle_outline'
                });
                await this.fetchBiodata();
                return true;
                }
            } catch (err) {
                console.error("Error FrontEnd:", err);
                Notify.create({ message: 'Gagal menambah data', color: 'negative' });
                return false;
            }
        },
        async editBiodata(payload, file_old) {
            console.log("EDIT BIODATA DIPANGGIL", payload);
            Loading.show({ message: 'Proses menyimpan ke sistem...' });

            try {
                const formData = new FormData();

                formData.append("id", payload.id);
                formData.append("nik", payload.nik);
                formData.append("tmp_lahir", payload.tmp_lahir);
                formData.append("tgl_lahir", payload.tgl_lahir);
                formData.append("jns_kelamin", payload.jns_kelamin);
                formData.append("alamat", payload.alamat);
                formData.append("dusun", payload.dusun);
                formData.append("rt_rw", payload.rt_rw);
                formData.append("kecamatan_id", payload.kecamatan_id);
                formData.append("des_kel_id", payload.des_kel_id);
                formData.append("kode_pos", payload.kode_pos);
                formData.append("status_perkawinan_id", payload.status_perkawinan_id);
                formData.append("agama_id", payload.agama_id);
                formData.append("tinggi_bdn", payload.tinggi_bdn);
                formData.append("berat_bdn", payload.berat_bdn);
                
                formData.append("file", payload.file);
                formData.append('file_old', file_old);

                const res = await PerakService.editBiodata(formData);
                
                if (res) {
                Notify.create({
                    message: 'Sukses Merubah Data',
                    color: 'warning',
                    icon: 'check_circle_outline'
                });
                await this.fetchBiodata();
                return true;
                }
            } catch (err) {
                console.error("Error FrontEnd:", err);
                Notify.create({ message: 'Gagal mengedit data', color: 'negative' });
                return false;
            }
        },
        async removeData(idnya, filenya) {
            try {
                const res = await PerakService.removeBiodata({ id: idnya, file: filenya });
                if (res) {
                Notify.create({
                    message: 'Sukses Menghapus Data',
                    color: 'negative',
                    icon: 'check_circle_outline'
                });
                await this.fetchBiodata();
                return true;
                }
            } catch (err) {
                console.error(err);
                return false;
            }
        },
        selectData(data) {
            this.dataEdit = { ...data };
        },


        async fetchPendidikanFormal(payload = {}) {
            console.log("PENDIDIKAN FORMAL TERPANGGIL");
            this.loading = true;
            try {
                const res = await PerakService.getPendidikanFormal(payload)
                // console.log("Response Backend:", res.data.data)
                this.pendidikan = res.data.data
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
        async addPendidikan(payload) {
            console.log("ADD PENDIDIKAN DIPANGGIL", payload);
            Loading.show({ message: 'Proses menyimpan ke sistem...' });

            try {
                const formData = new FormData();

                formData.append("biodata_id", payload.biodata_id);
                formData.append("nama_pendidikan", payload.nama_pendidikan);
                formData.append("pendidikan_id", payload.pendidikan_id);
                formData.append("jurusan_id", payload.jurusan_id);
                formData.append("tahun_tamat", payload.tahun_tamat);
                formData.append("nem_ipk", payload.nem_ipk);

                const res = await PerakService.addPendidikan(formData);
                
                if (res) {
                Notify.create({
                    message: 'Sukses Menambah Data',
                    color: 'primary',
                    icon: 'check_circle_outline'
                });
                await this.fetchPendidikan();
                return true;
                }
            } catch (err) {
                console.error("Error FrontEnd:", err);
                Notify.create({ message: 'Gagal menambah data', color: 'negative' });
                return false;
            }
        },
        async editPendidikan(payload) {
            console.log("EDIT PENDIDIKAN DIPANGGIL", payload);
            Loading.show({ message: 'Proses menyimpan ke sistem...' });

            try {
                const formData = new FormData();

                formData.append("id", payload.id);
                formData.append("biodata_id", payload.biodata_id);
                formData.append("nama_pendidikan", payload.nama_pendidikan);
                formData.append("pendidikan_id", payload.pendidikan_id);
                formData.append("jurusan_id", payload.jurusan_id);
                formData.append("tahun_tamat", payload.tahun_tamat);
                formData.append("nem_ipk", payload.nem_ipk);

                const res = await PerakService.editPendidikan(formData);
                
                if (res) {
                    Notify.create({
                        message: 'Sukses Merubah Data',
                        color: 'warning',
                        icon: 'check_circle_outline'
                    });
                    await this.fetchPendidikanFormal();
                    return true;
                }
            } catch (err) {
                console.error("Error FrontEnd:", err);
                Notify.create({ message: 'Gagal mengedit data', color: 'negative' });
                return false;
            }
        },
        async removePendidikan(payload) {
            try {
                const res = await PerakService.removePendidikan({id: payload});
                if (res) {
                    Notify.create({
                        message: 'Data Berhasil Dihapus',
                        color: 'negative',
                        icon: 'delete'
                    });
                    if (this.biodata.length > 0) {
                        await this.fetchPendidikanFormal({ 
                            biodata_id: this.biodata[0].id 
                        });
                    }
                    return true;
                }
            } catch (err) {
                console.error(err);
                return false;
            }
        },

        async fetchPengalaman(payload = {}) {
            console.log("PENGALAMAN KERJA TERPANGGIL");
            this.loading = true;
            try {
                const res = await PerakService.getPengalaman(payload)
                console.log("Response Backend:", res.data.data)
                this.pengalaman = res.data.data
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
        async addPengalaman(payload) {
            console.log("ADD PENGALAMAN KERJA DIPANGGIL", payload);
            Loading.show({ message: 'Proses menyimpan ke sistem...' });

            try {
                const formData = new FormData();

                formData.append("biodata_id", payload.biodata_id);
                formData.append("jabatan", payload.jabatan);
                formData.append("uraian_tugas", payload.uraian_tugas);
                formData.append("lama_kerja", payload.lama_kerja);
                formData.append("pemberian_pengguna", payload.pemberian_pengguna);
                formData.append("catatan", payload.catatan);

                const res = await PerakService.addPengalaman(formData);
                
                if (res) {
                Notify.create({
                    message: 'Sukses Menambah Data',
                    color: 'primary',
                    icon: 'check_circle_outline'
                });
                await this.fetchPengalaman();
                return true;
                }
            } catch (err) {
                console.error("Error FrontEnd:", err);
                Notify.create({ message: 'Gagal menambah data', color: 'negative' });
                return false;
            }
        },
        async editPengalaman(payload) {
            console.log("EDIT PENGALAMAN KERJA DIPANGGIL", payload);
            Loading.show({ message: 'Proses menyimpan ke sistem...' });

            try {
                const formData = new FormData();

                formData.append("id", payload.id);
                formData.append("biodata_id", payload.biodata_id);
                formData.append("jabatan", payload.jabatan);
                formData.append("uraian_tugas", payload.uraian_tugas);
                formData.append("lama_kerja", payload.lama_kerja);
                formData.append("pemberian_pengguna", payload.pemberian_pengguna);
                formData.append("catatan", payload.catatan);

                const res = await PerakService.editPengalaman(formData);
                
                if (res) {
                    Notify.create({
                        message: 'Sukses Merubah Data',
                        color: 'warning',
                        icon: 'check_circle_outline'
                    });
                    await this.fetchPengalaman();
                    return true;
                }
            } catch (err) {
                console.error("Error FrontEnd:", err);
                Notify.create({ message: 'Gagal mengedit data', color: 'negative' });
                return false;
            }
        },
        async removePengalaman(payload) {
            try {
                const res = await PerakService.removePengalaman({id: payload});
                if (res) {
                    Notify.create({
                        message: 'Data Berhasil Dihapus',
                        color: 'negative',
                        icon: 'delete'
                    });
                    if (this.biodata.length > 0) {
                        await this.fetchPengalaman({ 
                            biodata_id: this.biodata[0].id 
                        });
                    }
                    return true;
                }
            } catch (err) {
                console.error(err);
                return false;
            }
        },
    },
})