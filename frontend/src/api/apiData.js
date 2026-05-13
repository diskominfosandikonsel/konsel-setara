import axios from 'axios'

export const apiData = axios.create({
  baseURL: 'http://81.17.99.110:5005/'
})
