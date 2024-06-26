module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_vendor', 'role', {
      type: Sequelize.ENUM('Admin', 'Manager', 'Rider'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_vendor', 'role');
  },
};