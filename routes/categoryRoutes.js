import express from "express";
import { categoryModel } from "../models/kategoriaModel.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { validateRequest } from "../auth/middleware.js";
export const router1 = express.Router();

router1.route("/").get(validateRequest("user"), async (req, res) => {
  try {
    const results = await categoryModel.find();
    res
      .status(StatusCodes.OK)
      .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, results });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while fetching categories",
      error: err.message,
    });
  }
});
