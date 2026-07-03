const express = require("express");
const cookieParser = require("cookie-parser");

const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://interview-genai.netlify.app",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// require all the routes here
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")


// apply the routes here
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter)

app.get("/test-cors", (req, res) => {
  res.json({
    message: "Latest deployment is running ggg",
    origin: "https://interview-genai.netlify.app"
  });
});

module.exports = app;