import jsonwebtoken from "jsonwebtoken";
import { loginModel } from "../models/userModel.js";
import { orderModel } from "../models/orderModel.js";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const validateRequest = (requiredRole) => {
  return (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: `${StatusCodes.UNAUTHORIZED} ${ReasonPhrases.UNAUTHORIZED}`,
        message: "Invalid token",
      });
    }

    const token = authorization.substring("Bearer ".length);
    try {
      const decoded = jsonwebtoken.verify(token, "TokenKey");
      const { exp, iss, role } = decoded;
      if (
        iss === "my-api" &&
        exp < Date.now() &&
        (role === requiredRole || role === "admin")
      ) {

       
        next();
        return;
      } else {
        return res.status(StatusCodes.FORBIDDEN).send({
          status: `${StatusCodes.FORBIDDEN} ${ReasonPhrases.FORBIDDEN}`,
          messege: "Access denied",
        });
      }
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: `${StatusCodes.UNAUTHORIZED} ${ReasonPhrases.UNAUTHORIZED}`,
        message: "Invalid token",
      });
    }
  };
};

export const validateRequest1 = (requiredRole) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: `${StatusCodes.UNAUTHORIZED} ${ReasonPhrases.UNAUTHORIZED}`,
        message: "Invalid token",
      });
    }
    const token = authorization.substring("Bearer ".length);
    const order = await orderModel
      .findOne({ _id: req.params.id })
      .select({ nazwaUzytkownika: 1, _id: 0 });
    try {
      const { sub, exp, iss, role } = jsonwebtoken.verify(token, "TokenKey");
      const user = await loginModel
        .findOne({ _id: sub })
        .select({ login: 1, _id: 0 });
      if (
        iss === "my-api" &&
        exp < Date.now() &&
        role === requiredRole &&
        user.login == order.nazwaUzytkownika
      ) {
        next();
        return;
      } else {
        return res.status(StatusCodes.FORBIDDEN).send({
          status: `${StatusCodes.FORBIDDEN} ${ReasonPhrases.FORBIDDEN}`,
          messege: "Access denied",
        });
      }
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: `${StatusCodes.UNAUTHORIZED} ${ReasonPhrases.UNAUTHORIZED}`,
        message: "Invalid token",
      });
    }
  };
};
