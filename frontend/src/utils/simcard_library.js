import axios from 'axios'
import { useSimcardStore } from '../stores/simcard';
const simcard = useSimcardStore()

// FILTER DAERAH ADMINISTRATIF

const fecthpost = async (url, token, val) => {
    return new Promise((resolve, reject) => {
        resolve("Data fetched successfully")
    })
}

const provinsi = async (token, val) =>{
    return new Promise((resolve, reject) => {
            // console.log('Provinsi input library:', val)
            axios.get(simcard.url.URL_APP+'api/v1/m_provinsi/list', {
              params: {
                q: val  // ← Dikirim sebagai query parameter
              },          
              headers: {
                'Authorization': `kikensbatara ${token}`,
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              console.log('Provinsi response lobrary:', response.data)
              resolve(response.data || [])
            //   return response.data || []
            //    
            })
            .catch(error => {
              console.error('Error fetching provinsi:', error)
            })    
    })

}

const kabupaten = (token, val, m_kecamatan) =>{

    return new Promise((resolve, reject) => {

        axios.get(simcard.url.URL_DATAMASTER_KAB_KOTA+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_provinsi: m_kecamatan  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => { 
            resolve(response.data) 
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })    
    })
}

const kecamatan = (token, val, m_kabupaten) =>{

    return new Promise((resolve, reject) => {

        axios.get(simcard.url.URL_DATAMASTER_KECAMATAN+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kabupaten: m_kabupaten  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => { 
            resolve(response.data) 
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })    
    })
}

const desa_kelurahan = (token, val, m_kecamatan) =>{

    return new Promise((resolve, reject) => {

        axios.get(simcard.url.URL_DATAMASTER_DES_KEL+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kecamatan: m_kecamatan  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => { 
            resolve(response.data) 
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })    
    })
}
 


export default {
    provinsi,
    kabupaten,
    kecamatan,
    desa_kelurahan
}