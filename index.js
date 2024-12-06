import express, { response } from "express";
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import jsonwebtoken from "jsonwebtoken";
import { validateRequest, validateRequest1 } from "./auth/middleware.js";
import fs from "fs";
import { router } from "./routes/productsRoutes.js";
import { router1 } from "./routes/categoryRoutes.js";
import { router2 } from "./routes/orderRoutes.js";
import { router3 } from "./routes/statusRoutes.js";
import { loginModel } from "./models/userModel.js";
import cors from "cors";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

const app = express();
app.use(bodyParser.json());
app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 7000;
const MONGOurl = process.env.MONGO_URL;

mongoose
  .connect(MONGOurl)
  .then(() => {
    console.log("smigam");
    app.listen(PORT, () => {
      console.log(`server smiga na ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

app.get("/", validateRequest("admin"), (req, res) => {
  res.send("GET Request Called");
});

app.use("/products", router);

app.use("/categories", router1);

app.use("/orders", router2);

app.use("/status", router3);

app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  const user = await loginModel.findOne({ login: login });
  if (!user || user.password !== password) {
    res.status(StatusCodes.UNAUTHORIZED).send({
      status: `${StatusCodes.UNAUTHORIZED} ${ReasonPhrases.UNAUTHORIZED}`,
      message: "Invalid username or password",
    });
    return;
  }

  if (user.password === password) {
    const token = jsonwebtoken.sign(
      {
        role: user.role,
      },
      "TokenKey",
      {
        algorithm: "HS256",
        expiresIn: "40m",
        issuer: "my-api",
        subject: user.id,
      }
    );
    const refreshToken = jsonwebtoken.sign(
      {
        role: user.role,
      },
      "TokenKey",
      {
        algorithm: "HS256",
        expiresIn: "1d",
        issuer: "my-api",
        subject: user.id,
      }
    );

    res.send({ token: token, refreshToken: refreshToken });
    return;
  }
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      status: `${StatusCodes.UNAUTHORIZED} ${ReasonPhrases.UNAUTHORIZED}`,
      message: "No refresh cookie token provided.",
    });
  }
  console.log(refreshToken);

  try {
    const decoded = jsonwebtoken.verify(refreshToken, "TokenKey");
    console.log(decoded);
    const accessToken = jsonwebtoken.sign(
      {
        role: decoded.role,
      },
      "TokenKey",
      {
        algorithm: "HS256",
        expiresIn: "1d",
        issuer: "my-api",
        subject: decoded.sub,
      }
    );

    res.status(StatusCodes.OK).send({
      stasus: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      message: "Token refreshed",
      accessToken,
    });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
      message: "Invalid token",
    });
  }
});

app.post("/register", async (req, res) => {
  const { login, password } = req.body;
  const user = await loginModel.findOne({ login: login });
  if (!user) {
    const user = loginModel({ login: login, password: password });
    user.save();
    res.status(StatusCodes.OK).send({
      status: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      message: "User created",
    });
  }
  res.status(StatusCodes.CONFLICT).send({
    status: `${StatusCodes.CONFLICT} ${ReasonPhrases.CONFLICT}`,
    message: "User already exists",
  });
  return;
});

app.get("/user", async (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (authorization) {
    const token = authorization.substring("Bearer ".length);
    console.log(token + "token");
    try {
      const data = jsonwebtoken.verify(token, "TokenKey");
      console.log(data);
      const user = await loginModel.findById(data.sub);
      // TODO idk
      res.send(user.login);
    } catch (err) {
      res.status(StatusCodes.FORBIDDEN).send({
        status: `${StatusCodes.FORBIDDEN} ${ReasonPhrases.FORBIDDEN}`,
        message: "Invalid token",
      });
      return;
    }
  } else {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send({
      status: `${StatusCodes.METHOD_NOT_ALLOWED} ${ReasonPhrases.METHOD_NOT_ALLOWED}`,
      message: "No token provided",
    });
  }
});

app.post("/init", async (req, res) => {
  let obj;
  let ans;
  fs.readFile("file.json", "utf8", async (err, data) => {
    if (err) throw err;
    obj = JSON.parse(data);
    obj.forEach(async (element) => {
      const kat = await categoryModel.findOne({ nazwa: element.kategoria });
      let produkt = await productModel.find({
        nazwa: element.nazwa,
        opis: element.opis,
        cena: element.cena,
        waga: element.waga,
        kategoria: kat._id,
      });
      if (produkt.length == 0) {
        const nowyProdukt = new productModel({
          nazwa: element.nazwa,
          opis: element.opis,
          cena: element.cena,
          waga: element.waga,
          kategoria: kat._id,
        });
        ans = await nowyProdukt.save();
      }
    });
    console.log(ans);
    res.status(StatusCodes.OK).send({
      status: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      message: "Products added",
    });
  });
});
