const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models/index");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Resize = require("../utils/resize");
const path = require("path");
const { Op } = require("sequelize");
const User = db.User;
const Blocks = db.Blocks;
const { v4: uuidv4 } = require("uuid");

const fs = require("fs");
const request = require("request");

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on("close", callback);
  });
};

const signToken = (id) => {
  // JWT.sign(payload, secret, options)
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  user.password = undefined;

  res.status(statusCode).json({
    status: true,
    token,
    data: {
      user,
    },
  });
};

/*
 ***********register by email************
 */

exports.registerByEmail = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }
  if (req.body.passwordConfirm !== req.body.password) {
    res.status(400).send({
      status: false,
      message: "Passwords not match!",
    });
    return;
  }
  const freshUser = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (freshUser) {
    return next(new AppError("The email has been taken", 400));
  }
  let imageName = "logo.png";
  let thumbImageName = "logo.png";
  if (req.file) {
    const imagePath = path.join(__dirname, "./../public/images");
    const fileUpload = new Resize(imagePath, 600, 600);
    imageName = await fileUpload.save(req.file.buffer);
    const fileUpload2 = new Resize(imagePath, 100, 100);
    thumbImageName = await fileUpload2.save(req.file.buffer);
  }

  // Create a User
  await bcrypt.hash(req.body.password, 12, function (err, hash) {
    User.create({
      name: req.body.name,
      username: `${req.body.name.split(" ")[0]}${Date.now()}`,
      email: req.body.email,
      password: hash,
      image: imageName,
      thumbImage: thumbImageName,
    })
      .then((data) => {
        createSendToken(data, 201, res);
      })
      .catch((err) => {
        res.status(400).send({
          status: false,
          message: err,
        });
        return;
      });
  });
});

/*
 ***********register by phone************
 */

exports.registerByPhone = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.name || !req.body.phone || !req.body.password) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }
  if (req.body.passwordConfirm !== req.body.password) {
    res.status(400).send({
      status: false,
      message: "Passwords not match!",
    });
    return;
  }
  const freshUser = await User.findOne({
    where: {
      phone: req.body.phone,
    },
  });
  if (freshUser) {
    return next(new AppError("The phone has been taken", 400));
  }
  let imageName = "logo.png";
  let thumbImageName = "logo.png";
  if (req.file) {
    const imagePath = path.join(__dirname, "./../public/images");
    const fileUpload = new Resize(imagePath, 600, 600);
    imageName = await fileUpload.save(req.file.buffer);
    const fileUpload2 = new Resize(imagePath, 100, 100);
    thumbImageName = await fileUpload2.save(req.file.buffer);
  }

  // Create a User
  await bcrypt.hash(req.body.password, 12, function (err, hash) {
    User.create({
      name: req.body.name,
      username: `${req.body.name.split(" ")[0]}${Date.now()}`,
      phone: req.body.phone,
      password: hash,
      image: imageName,
      thumbImage: thumbImageName,
    })
      .then((data) => {
        createSendToken(data, 201, res);
      })
      .catch((err) => {
        res.status(400).send({
          status: false,
          message: err,
        });
        return;
      });
  });
});

/*
 ***********register by facebook************
 */

exports.registerOrLoginByFacebook = catchAsync(async (req, res, next) => {
  // Validate request

  if (!req.body.name || !req.body.facebookID || !req.body.email) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  let imageName = "logo.png";
  if (req.body.image) {
    imageName = `${uuidv4()}.jpg`;
    const imagePath = path.join(__dirname, `./../public/images/${imageName}`);

    await download(req.body.image, imagePath, () => {
      console.log("✅ Done!");
    });
  }

  const freshUser = await User.findOne({
    where: {
      facebookID: req.body.facebookID,
    },
  });

  if (!freshUser) {
    const data = await User.create({
      name: req.body.name,
      username: `${req.body.name.split(" ")[0]}${Date.now()}`,
      facebookID: req.body.facebookID,
      email: req.body.email,
      image: `${imageName}`,
      thumbImage: `${imageName}`,
    });

    createSendToken(data, 201, res);
  } else {
    createSendToken(freshUser, 201, res);
  }
  // Create a User
});
/*
 ***********register by gmail************
 */

exports.registerOrLoginByGmail = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.name || !req.body.googleID || !req.body.email) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  let imageName = "logo.png";
  if (req.body.image) {
    imageName = `${uuidv4()}.jpg`;
    const imagePath = path.join(__dirname, `./../public/images/${imageName}`);

    await download(req.body.image, imagePath, () => {
      console.log("✅ Done!");
    });
  }

  const freshUser = await User.findOne({
    where: {
      googleID: req.body.googleID,
    },
  });

  if (!freshUser) {
    const data = await User.create({
      name: req.body.name,
      username: `${req.body.name.split(" ")[0]}${Date.now()}`,
      googleID: req.body.googleID,
      email: req.body.email,
      image: `${imageName}`,
      thumbImage: `${imageName}`,
    });

    createSendToken(data, 201, res);
  } else {
    createSendToken(freshUser, 201, res);
  }
  // Create a User
});

/*
 ***********login by email************
 */
async function correctPassword(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}
exports.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    res.status(400).send({
      status: false,
      message: "please provide an email and password!",
    });
    return;
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ where: { email } });

  if (!user || !(await correctPassword(password, user.password))) {
    res.status(400).send({
      status: false,
      message: "Incorrect email or password!",
    });
    return;
  }

  // 3) If everything is ok, then send token to client
  createSendToken(user, 200, res);
});

/*
 ***********login by phone************
 */

exports.loginWithPhone = catchAsync(async (req, res, next) => {
  const { phone, password } = req.body;

  // 1) Check if email and password exist
  if (!phone || !password) {
    res.status(400).send({
      status: false,
      message: "please provide an phone and password!",
    });
    return;
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ where: { phone } });

  if (!user || !(await correctPassword(password, user.password))) {
    res.status(400).send({
      status: false,
      message: "Incorrect phone or password!",
    });
    return;
  }

  // 3) If everything is ok, then send token to client
  createSendToken(user, 200, res);
});

/*
 ****************getUserProfile
 */
exports.getUserProfile = catchAsync(async (req, res, next) => {
  // 1) Check if email and password exist
  if (!req.body.username) {
    res.status(400).send({
      status: false,
      message: "please provide an username!",
    });
    return;
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({
    attributes: {
      exclude: [
        "email",
        "phone",
        "password",
        "activated",
        "facebookID",
        "googleID",
        "firebaseToken",
        "createdAt",
      ],
    },
    where: { username: req.body.username },
  });

  if (!user) {
    res.status(404).send({
      status: false,
      message: "User not found!",
    });
  } else {
    res.status(200).send({
      status: true,
      data: user,
      message: "Here is the profile",
    });
  }
});
/*
 ***********edit Profile************
 */

exports.editProfile = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.id) {
    res.status(400).send({
      status: false,
      message: "please send your ID!",
    });
    return;
  }

  // edit email
  if (req.body.email && req.body.id) {
    const freshUser = await User.findOne({
      where: {
        email: req.body.email,
        id: { [Op.ne]: req.body.id },
      },
    });
    if (freshUser) {
      return next(new AppError("The email has been taken", 401));
    } else {
      await User.update(
        { email: req.body.email },
        { where: { id: req.body.id } }
      );
    }
  }

  // edit password
  if (req.body.password && req.body.passwordConfirm) {
    if (req.body.passwordConfirm !== req.body.password) {
      res.status(400).send({
        status: false,
        message: "Passwords not match!",
      });
      return;
    } else {
      await bcrypt.hash(req.body.password, 12, function (err, hash) {
        User.update({ password: hash }, { where: { id: req.body.id } }).catch(
          (err) => {
            res.status(400).send({
              status: false,
              message: err,
            });
            return;
          }
        );
      });
    }
  }

  // edit name
  if (req.body.name) {
    await User.update({ name: req.body.name }, { where: { id: req.body.id } });
  }
  // edit token
  if (req.body.firebaseToken) {
    await User.update(
      { firebaseToken: req.body.firebaseToken },
      { where: { id: req.body.id } }
    );
  }
  // edit image
  if (req.file) {
    const imagePath = path.join(__dirname, "./../public/images");
    const fileUpload = new Resize(imagePath, 600, 600);
    imageName = await fileUpload.save(req.file.buffer);
    const fileUpload2 = new Resize(imagePath, 100, 100);
    thumbImageName = await fileUpload2.save(req.file.buffer);

    await User.update(
      { image: imageName, thumbImage: thumbImageName },
      { where: { id: req.body.id } }
    );
  }
  if (req.body.active) {
    await User.update(
      { active: req.body.active },
      { where: { id: req.body.id } }
    );
  }
  res.status(200).send({
    status: true,
    message: "your profile updated successfully!",
  });
});

exports.activateProfile = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.id) {
    res.status(400).send({
      status: false,
      message: "please send your ID!",
    });
    return;
  }
  // edit name
  await User.update({ activated: 1 }, { where: { id: req.body.id } });

  res.status(200).send({
    status: true,
    message: "your account activated successfully!",
  });
});

/*
 ***********register by email************
 */

exports.registerByEmail = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }
  if (req.body.passwordConfirm !== req.body.password) {
    res.status(400).send({
      status: false,
      message: "Passwords not match!",
    });
    return;
  }
  const freshUser = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (freshUser) {
    return next(new AppError("The email has been taken", 400));
  }
  let imageName = "logo.png";
  let thumbImageName = "logo.png";
  if (req.file) {
    const imagePath = path.join(__dirname, "./../public/images");
    const fileUpload = new Resize(imagePath, 600, 600);
    imageName = await fileUpload.save(req.file.buffer);
    const fileUpload2 = new Resize(imagePath, 100, 100);
    thumbImageName = await fileUpload2.save(req.file.buffer);
  }

  // Create a User
  await bcrypt.hash(req.body.password, 12, function (err, hash) {
    User.create({
      name: req.body.name,
      username: `${req.body.name.split(" ")[0]}${Date.now()}`,
      email: req.body.email,
      password: hash,
      image: imageName,
      thumbImage: thumbImageName,
    })
      .then((data) => {
        createSendToken(data, 201, res);
      })
      .catch((err) => {
        res.status(400).send({
          status: false,
          message: err,
        });
        return;
      });
  });
});
/*
 ***********block user************
 */

exports.blockUser = catchAsync(async (req, res, next) => {
  // Validate request
  if (
    !req.body.id ||
    !req.body.username ||
    !req.body.blockedID ||
    !req.body.blockedUsername
  ) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  const isBlocked = await Blocks.findOne({
    where: {
      username: req.body.username,
      userID: req.body.id,
      blockedUsername: req.body.blockedUsername,
      blockedUserID: req.body.blockedID,
    },
  });
  if (isBlocked) {
    return next(new AppError("The user already blocked!", 400));
  }
  // block a User

  const block = await Blocks.create({
    username: req.body.username,
    userID: req.body.id,
    blockedUsername: req.body.blockedUsername,
    blockedUserID: req.body.blockedID,
  });

  res.status(200).send({
    status: true,
    data: block,
    message: "user blocked successfully",
  });
});
/*
 ***********unblock user************
 */

exports.unblockUser = catchAsync(async (req, res, next) => {
  // Validate request
  if (
    !req.body.id ||
    !req.body.username ||
    !req.body.blockedID ||
    !req.body.blockedUsername
  ) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  await Blocks.destroy({
    where: {
      username: req.body.username,
      userID: req.body.id,
      blockedUsername: req.body.blockedUsername,
      blockedUserID: req.body.blockedID,
    },
  });

  res.status(200).send({
    status: true,
    message: "user unblocked successfully",
  });
});
/*
 ***********get blocked users************
 */

exports.getBlockedUsers = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.id || !req.body.username) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  const BlockedUsers = await Blocks.findAll({
    where: {
      username: req.body.username,
      userID: req.body.id,
    },
  });
  if (BlockedUsers.length == 0) {
    res.status(404).send({
      status: false,
      message: "not find any blocked user",
    });
    return;
  }

  res.status(200).send({
    status: true,
    data: BlockedUsers,
    message: "here is your blocked list",
  });
});
/*
 ***********get users blocked me************
 */

exports.getBlockedMe = catchAsync(async (req, res, next) => {
  // Validate request
  if (!req.body.id || !req.body.username) {
    res.status(400).send({
      status: false,
      message: "Required fields content can not be empty!",
    });
    return;
  }

  const BlockedMe = await Blocks.findAll({
    where: {
      blockedUsername: req.body.username,
      blockedUserID: req.body.id,
    },
  });
  if (BlockedMe.length == 0) {
    res.status(404).send({
      status: false,
      message: "not find any user blocked you",
    });
    return;
  }

  res.status(200).send({
    status: true,
    data: BlockedMe,
    message: "here is the list",
  });
});
// JWT Auth
exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in, please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findOne({
    where: {
      id: decoded.id,
    },
  });
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does not longer exist.",
        401
      )
    );
  }
  next();
});
