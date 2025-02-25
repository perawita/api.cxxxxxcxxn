const express = require('express');
const propertiRoute = express.Router();
const PropertiController = require('../controllers/PropertiController');

// Rute API
propertiRoute.get('/akrab', PropertiController.getListAkrab);


module.exports = propertiRoute;