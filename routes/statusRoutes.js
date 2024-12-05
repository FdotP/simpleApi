import express from "express";
import { categoryModel } from "../models/kategoriaModel.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { validateRequest } from "../auth/middleware.js";

export const router3 = express.Router();

router3.route("/").get(validateRequest("admin"), async (req, res) => {
  try {
    const results = await categoryModel.find();
    res
      .status(StatusCodes.OK)
      .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, results });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while fetching statuses",
      error: error.message,
    });
  }
});
