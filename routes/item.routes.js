module.exports = app => {
    const item = require("../controllers/itemController.js");

    var router = require("express").Router();

    router.post("/dashboard", item.dashboard);
    router.post("/assignItemToPradesh", item.assignItemToPradesh);
    router.post("/getPradeshItemsDetails", item.getPradeshItemsDetails);
    router.get("/downloadPradeshReceivedItems", item.downloadPradeshReceivedItems);
    router.get("/downloadParabhaktiReport", item.downloadParabhaktiReport);
    router.post("/addReceiveItem", item.addReceiveItem);
    router.post("/report", item.report);
    router.post("/addParabhaktiItems", item.addParabhaktiItems );
    router.post("/getParabhakti", item.getParabhakti );
    router.post("/parabhaktiReport", item.parabhaktiReport );
    
    app.use("/", router);
};
      