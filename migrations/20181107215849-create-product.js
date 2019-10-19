module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        default: Sequelize.fn('uuid_generate_v4'),
      },
      brandId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      strainId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      productName: {
        type: Sequelize.STRING,
      },
      productDescription: {
        type: Sequelize.TEXT,
      },
      productType: {
        type: Sequelize.STRING,
      },
      produceType: Sequelize.STRING,
      price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      dosage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products');
  },
};
