module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Orders', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        default: Sequelize.fn('uuid_generate_v4'),
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      shippingAddressId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      driverId: {
        type: Sequelize.UUID,
      },
      deliveryStatus: {
        type: Sequelize.STRING,
        defaultValue: 'Pending',
      },
      note: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('Orders');
  },
};
