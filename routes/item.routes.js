module.exports = app => {
    const item = require("../controllers/itemController.js");

    var router = require("express").Router();

    router.post("/dashboard", item.dashboard);
    router.post("/assignItemToPradesh", item.assignItemToPradesh);
    router.post("/getPradeshItemsDetails", item.getPradeshItemsDetails);
    router.get("/downloadPradeshReceivedItems", item.downloadPradeshReceivedItems);
    router.post("/addReceiveItem", item.addReceiveItem);
    
    app.use("/", router);
};
      