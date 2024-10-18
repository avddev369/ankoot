module.exports = (sequelize, Sequelize) => {
    const itemRec = sequelize.define('other', {
        otherId: {
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
        dePerson: {
            type: Sequelize.STRING,
            allowNull: false
        },
        dePerCont: {
            type: Sequelize.STRING,
            allowNull: false
        },
        reference: {
            type: Sequelize.STRING,
            allowNull: false
        },
        remark: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    
    itemRec.associate = (models) => {
        itemRec.belongsTo(models.item, {
            foreignKey: 'itemId', 
            as: 'itemDetails'
        });
    };
    
    return itemRec;
};


