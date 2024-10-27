module.exports = (sequelize, Sequelize) => {
    const parabhakti = sequelize.define('parabhakti', {
        itemRecId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        itemId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        qty: {
            type: Sequelize.STRING,
            allowNull: false
        },
        choki: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        sender: {
            type: Sequelize.STRING,
            allowNull: false
        },
        unit: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        remark: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    
    parabhakti.associate = (models) => {
        parabhakti.belongsTo(models.itemAssParabhakti, {
            foreignKey: 'itemId', 
            as: 'itemDetails'
        });

        parabhakti.belongsTo(models.user, {
            foreignKey: 'createdBy', 
            as: 'createdByname'
        });
    };
    
    return parabhakti;
};


