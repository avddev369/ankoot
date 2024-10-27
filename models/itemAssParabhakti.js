module.exports = (sequelize, Sequelize) => {
    const itemAssParabhakti = sequelize.define('itemAssParabhakti_master', {
        itemAssId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ItemName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        qty: {
            type: Sequelize.STRING,
            allowNull: false
        },
    });

    return itemAssParabhakti;
};


