module.exports = app => {
    const item = require("../controllers/itemController.js");

    var router = require("express").Router();

    router.post("/dasboard", item.dasboard);
    router.post("/assignItemToPradesh", item.assignItemToPradesh);
    router.post("/getPradeshItemsDetails", item.getPradeshItemsDetails);
    
    app.use("/", router);
};
      