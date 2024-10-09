module.exports = (sequelize, Sequelize) => {
    const item = sequelize.define('item_master', {
        itemId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nameEng: {
            type: Sequelize.STRING,
            allowNull: false
        },
        nameGuj: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category: {
            type: Sequelize.STRING,
            allowNull: false
        },
        unit: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    
    return item;
};


