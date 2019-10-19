module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
  }, {});
  Order.associate = function (models) {
    // associations can be defined here
    Order.belongsToMany(models.Product, {
      through: 'ProductOrders',
      as: 'products',
      foreignKey: 'orderId',
      // otherKey: 'productId'
    });
  };
  return Order;
};
