const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const path = require("path");
const http = require("http");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(cors());
app.use(logger("dev"));
// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("./routes/socketHandler")(io);

dotenv.config({ path: "./config.env" });

/*
const userRouter = require("./routes/userRoutes");
app.use("/nodejsapp/api/v1/users", userRouter);
const conversationRouter = require("./routes/conversationRoutes");
app.use("/nodejsapp/api/v1/conversations", conversationRouter);
const messageRouter = require("./routes/messageRoutes");
app.use("/nodejsapp/api/v1/messages", messageRouter);
*/
const userRouter = require("./routes/userRoutes");
app.use("/api/v1/users", userRouter);
const conversationRouter = require("./routes/conversationRoutes");
app.use("/api/v1/conversations", conversationRouter);
const messageRouter = require("./routes/messageRoutes");
app.use("/api/v1/messages", messageRouter);

app.all("*", (req, res, next) => {
  res.status(404).send({
      status: false,
      message: "there is no result!",
    });
  next();
});
app.use(globalErrorHandler);

const port =3000 ;
app.set("port", port);
server.listen(port);
module.exports = app;
