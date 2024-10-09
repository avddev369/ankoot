module.exports = app => {
    const gernal = require("../controllers/gernalController.js");

    var router = require("express").Router();

    router.post("/insertData", gernal.insertData);
    router.post("/updateData", gernal.updateData);
    router.post("/getData", gernal.getData);
    router.post("/deleteData", gernal.deleteData);

    app.use("/", router);
};
      