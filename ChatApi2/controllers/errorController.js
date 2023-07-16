const AppError = require("./../utils/appError");

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

function json2array(json) {
  if (json != null) {
    const result = [];
    const keys = Object.keys(json);
    keys.forEach(function (key) {
      result.push(json[key]);
    });
    return result;
  }
  return json;
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: false,
    errors: json2array(err.errors),
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to clients or users
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error to console
    console.error("Error 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: false,
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 400;
  err.status = false;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
