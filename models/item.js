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
    
    module.exports = (sequelize, DataTypes) => {
        const item = sequelize.define('items', {
            // Define your model attributes
            itemName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            // Other attributes
        });
    
        item.associate = (models) => {
            item.hasMany(models.itemRec, {
                foreignKey: 'itemId', // Adjust if your foreign key has a different name
                as: 'receivedItems'
            });
        };
    }
    return item;
};


