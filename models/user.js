module.exports = (sequelize, Sequelize) => {
    const user = sequelize.define('user_master', {
        userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        mobile: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        isMaster: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            default: false
        },
        isLogin: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            default: true
        },
    });
    
    return user;
};


