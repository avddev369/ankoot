module.exports = (sequelize, Sequelize) => {
    const pOther = sequelize.define('parabhaktiOther', {
        pOtherId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        itemName: {
            type: Sequelize.STRING,  
            allowNull: false
        },
        qty: {
            type: Sequelize.STRING,
            allowNull: false
        },
        sender: {
            type: Sequelize.STRING,
            allowNull: true
        },
        remark: {
            type: Sequelize.STRING,
            allowNull: true
        },
        choki: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        unit: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });

    return pOther;
};
