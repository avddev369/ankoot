module.exports = (sequelize, Sequelize) => {
    const itemAss = sequelize.define('itemAss_master', {
        itemAssId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        itemId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        pId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        qty: {
            type: Sequelize.STRING,
            allowNull: false
        },
        year: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    
    return itemAss;
};


