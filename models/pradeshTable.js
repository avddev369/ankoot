module.exports = (sequelize, Sequelize) => {
    const pradesh = sequelize.define('pradesh_master', {
        pId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lastNameEng: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastNameGuj: {
            type: Sequelize.STRING,
            allowNull: false
        },
        newNameEng: {
            type: Sequelize.STRING,
            allowNull: false
        },
        newNameGuj: {
            type: Sequelize.STRING,
            allowNull: false
        },
        pSantEng: {
            type: Sequelize.STRING,
            allowNull: false
        },
        pSantGuj: {
            type: Sequelize.STRING,
            allowNull: false
        },
        area: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contPerson: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contPersonNo: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    
    return pradesh;
};


