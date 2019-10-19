const { Router } = require('express');
const { Order } = require('../models');
const { Product } = require('../models');
const { ProductOrder } = require('../models');
const { asyncHandler } = require('../utils/asyncRouteHandler');
const { respondWith } = require('../utils/clientResponse');

const router = Router();

/** GET all Order ever recorded in db */
router.get('/all/records', asyncHandler(async (req, res) => {

  const allOrders = await Order.findAll();

  if (!allOrders) {
    return respondWith(res, 500, ['Something went wrong trying to retrieve all orders']);
  }

  return respondWith(res, 200, ['Returning all orders'], { allOrders });
}));

/** Find Order by ID */
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findByPk(
    req.params.id,
    {
      include: [{
        model: Product,
        as: 'products',
        required: false,
        attributes: ['id', 'productName'],
        through: {
          model: ProductOrder,
          as: 'productOrders',
          attributes: ['qty', 'productPrice'],
        },
      }],
    },
  );

  if (!order) {
    return respondWith(res, 400, ['Order not found']);
  }

  return respondWith(res, 200, ['Order found'], { order });
}));

/** POST create Order
 * PARAMS
 * userId: uuid
 * products: [ {id: uuid} ]
*/
router.post('/create', asyncHandler(async (req, res) => {
  const order = {
    userId: req.body.userId,
    address: req.body.address,
  };

  const savedOrder = await Order.create(order, { w: 1 }, { returning: true });

  if (!savedOrder) {
    return respondWith(res, 500, ['Something went wrong trying to create order.']);
  }

  await Promise.all(await req.body.products.map(async (element) => {
    const product = await Product.findByPk(element.id);

    if (!product) {
      return respondWith(res, 500, ['One or more of the product ids were invalid']);
    }

    const po = {
      orderId: savedOrder.id,
      productId: element.id,
    };

    const savedProductOrder = await ProductOrder.create(po, { w: 1 }, { returning: true });

    // Early exit if order was not saved
    if (!savedProductOrder) {
      return respondWith(res, 500, ['Something went wrong trying to create the order. Failed to create productOrder.']);
    }
  }));

  // Order was created
  return respondWith(res, 200, ['Created order and inventory'], { savedOrder, savedInventory });
}));

/** PATCH order */
router.patch('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    return respondWith(res, 400, ['Order not found']);
  }

  const updatedOrder = await order.update({
    userId: req.body.userId || order.userId,
    address: req.body.address || order.address,
  }, { where: { id: req.params.id } });

  if (!updatedOrder) {
    return respondWith(res, 500, ['Something went wrong trying to update order']);
  }

  const products = await order.getProducts();
  order.removeProducts(products);

  await Promise.all(await req.body.products.map(async (element) => {
    const product = await Product.findByPk(element.id);

    const po = {
      orderId: order.id,
      productId: element.id,
    };

    const savedProductOrder = await ProductOrder.create(po, { w: 1 }, { returning: true });

    if (!savedProductOrder) {
      return respondWith(res, 500, ['Something went wrong trying to update the order. Failed to create product order']);
    }
  }));

  // Order was created
  return respondWith(res, 200, ['Updated order'], { updatedOrder });
}));

/** Delete Order
 * TODO: Check if deleting an order / product removes the productOrders.
*/
router.delete('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  const products = await order.getProducts();
  order.removeProducts(products);

  const deletedOrder = await Order.destroy({
    where: {
      id: req.params.id,
    },
  });

  if (!deletedOrder) {
    return respondWith(res, 500, ['There was an error trying to delete the order.']);
  }

  return respondWith(res, 200, ['Order deleted successfully'], { deletedOrder });
}));

module.exports = router;
