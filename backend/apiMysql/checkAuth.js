const express = require('express');
const router = express.Router();

var db = require('../db/MySql/utama');


router.post('/', (req, res)=>{
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
    res.json([
  { id: 1, nama: "Test" }
])

})

router.get('/', (req, res)=>{
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
    res.json([
  { id: 1, nama: "Test" }
])

})

module.exports = router;
