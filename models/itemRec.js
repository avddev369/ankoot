module.exports = (sequelize, Sequelize) => {
    const itemRec = sequelize.define('itemRec', {
        itemRecId: {
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
            allowNull: true
        },
        remark: {
            type: Sequelize.STRING,
            allowNull: true
        }
    });
    
    itemRec.associate = (models) => {
        itemRec.belongsTo(models.item, {
            foreignKey: 'itemId', // Adjust if your foreign key has a different name
            as: 'itemDetails'
        });
    };
    
    return itemRec;
};


