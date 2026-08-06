const express = require("express");
const authRouter = require("./routes/auth.route");

const app = express();
app.use(express.json());

app.get("/health", (req,res,next)=>{
    console.log("Health route accessed");
    res.status(200).json({message:"Server is healthy"});
});
app.use("/api/auth", authRouter);

module.exports = app;