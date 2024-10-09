require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
app.use(bodyParser.json());
app.use(cors());

//Database
const db = require("./models");


// db.sequelize.sync({ force: false })
//   .then(() => {
//     console.log("Synced db.");
//   })
//   .catch((err) => {
//     console.error("Failed to sync db: " + err.message);
//   });
console.log("Synced db.");  

//Routes
require("./routes/user.routes")(app);
require("./routes/gernal.routes")(app);


app.get("/", (req, res) => {
    res.json({ message: "Welcome to Ankoot Api." });
});

app.post("/", (req, res) => {
    res.json({ message: "Welcome to Ankoot Api." });
});



const PORT = process.env.SERVER_LOCAL_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});


process.on('unhandledRejection', err => {
    console.log(`[unhandledRejection] Shutting down server...`);
    console.log(err);
    server.close(() => {
      process.exit(1);
    });
  });
  
  module.exports.appServer = serverless(app);