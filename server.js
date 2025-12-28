require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
app.use(bodyParser.json());
app.use(cors());


const allowedOrigins = [
    'http://api.hpparam.com:8053',
    'http://localhost:8053'
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        // If the origin is in the allowedOrigins list, allow it
        callback(null, true);
      } else {
        // If not, block the request
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  }));
    
  
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
require("./routes/item.routes")(app);


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