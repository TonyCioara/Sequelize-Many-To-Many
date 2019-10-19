module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  }, {});
  Product.associate = (models) => {
    // associations can be defined here
    Product.belongsToMany(models.Order, {
      through: 'ProductOrders',
      as: 'orders',
      foreignKey: 'productId',
      // otherKey: 'orderId'
    });
  };
  return Product;
};
