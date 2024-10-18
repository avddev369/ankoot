module.exports = (sequelize, Sequelize) => {
    const other = sequelize.define('other', {
        otherId: {
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

    return other;
};
