const express = require('express');
const connectToDB = require('./config');
const cors = require("cors");
const app = express();

const router = require("./routes/index.js");

const PORT = 5000;

connectToDB();

app.use(cors());
app.use(express.json());
app.get("/', async (req, res) => {
        return res.json({message: "server running"});
});
app.use("/api", router);



app.listen(PORT, () => {
    console.log(`app is listening to port ${PORT}`);
})
