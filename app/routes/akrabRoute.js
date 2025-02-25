const express = require('express');
const akrabRoute = express.Router();
const AkrabController = require('../controllers/AkrabController');
const PurchaseController = require('../controllers/PurchaseController');

// Rute API
akrabRoute.get('/otomatis/all', AkrabController.getAll);
akrabRoute.get('/otomatis/:id', AkrabController.getById);
akrabRoute.post('/otomatis/add', AkrabController.create);
akrabRoute.put('/otomatis/edit/:id', AkrabController.update);
akrabRoute.delete('/otomatis/delete/:id', AkrabController.delete);

akrabRoute.post('/otomatis/purchase', PurchaseController.akrabPurchase);


module.exports = akrabRoute;