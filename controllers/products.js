/*
* Kannibox Marketplace Router
*/
const { Router } = require('express');
const { Product } = require('../models');
const { Strain } = require('../models');
const { logger } = require('../utils/logger');
const { respondWith } = require('../utils/clientResponse');
const { asyncHandler } = require('../utils/asyncRouteHandler');
const { requireRole } = require('../utils/requireRole');

const router = Router();

// GET all products in DB
router.get('/all/records', asyncHandler(async (req, res) => {
  // Allow frontend to make very specific queries
  const queryDict = {};

  await Promise.all(await ['brandId', 'strainId'].map((element) => {
    if (req.query[element]) {
      queryDict[element] = req.query[element];
    }
  }));

  const allProducts = await Product.findAll({
    where: queryDict,
    limit: req.query.limit,
    offset: req.query.offset,
    include: [{
      model: Strain,
      required: false,
      attributes: ['id', 'name', 'type'],
    }],
  });

  if (!allProducts) {
    return respondWith(res, 500, ['An error occured while retrieveing all Products']);
  }

  return respondWith(res, 200, ['Returning all products'], { allProducts });
}));

/** Find Product by ID */
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findByPk(
    req.params.id,
    {
      include: [{
        model: Strain,
        required: false,
        attributes: ['id', 'name', 'type'],
      }],
    },
  );

  // Exit early if search fails
  if (!product) {
    return respondWith(res, 400, ['Product not found.']);
  }

  return respondWith(res, 200, ['Product found'], { product });
}));

// POST create product
router.post('/create', requireRole('vendor'), asyncHandler(async (req, res) => {
  const product = {
    brandId: req.body.brandId,
    strainId: req.body.strainId,
    productName: req.body.productName,
    productDescription: req.body.productDescription,
    productType: req.body.productType,
    price: req.body.price,
    dosage: req.body.dosage,
  };

  const savedProduct = await Product.create(product, { w: 1 }, { returning: true });

  // Early exit if product was not saved
  if (!savedProduct) {
    return respondWith(res, 500, ['Something went wrong trying to create the product']);
  }

  // Product was created
  return respondWith(res, 200, ['Created product'], { savedProduct });
}));

// PATCH update product
router.patch('/:id', requireRole('vendor'), asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return respondWith(res, 400, ['Product not found']);
  }

  const updatedProduct = await product.update({
    brandId: req.body.brandId || product.brandId,
    strainId: req.body.strainId || product.strainId,
    productName: req.body.productName || product.productName,
    productDescription: req.body.productDescription || product.productDescription,
    productType: req.body.productType || product.productType,
    price: req.body.price || product.price,
    dosage: req.body.dosage || product.dosage,
  }, { where: { id: req.params.id } },
  { returning: true });

  // Exist early if updating failed
  if (!updatedProduct) {
    return respondWith(res, 500, ['An error occurred while updating Product']);
  }

  return respondWith(res, 200, ['Updated Product successfully.'], { updatedProduct });
}));

/** Delete Product */
router.delete('/:id', requireRole('vendor'), asyncHandler(async (req, res) => {
  const deletedProduct = await Product.destroy({
    where: { id: req.params.id },
  });

  //   Exit early if deletion failed
  if (!deletedProduct) {
    return respondWith(res, 500, ['An error occured while deleting Product']);
  }

  return respondWith(res, 200, ['Product deleted successfully'], { deletedProduct });
}));

module.exports = router;
