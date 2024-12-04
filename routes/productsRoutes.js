import express from "express";
import { productModel } from "../models/productModel.js";
import { categoryModel } from "../models/kategoriaModel.js";
import { getGroqChatCompletion } from "../groq.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  addProductBodyValidator,
  updateProductBodyValidator,
} from "../validators/productValidators.js";
import mongoose, { mongo } from "mongoose";
import e from "express";

export const router = express.Router();

router.route("/").get(async (req, res) => {
  try {
    const results = await productModel.find();
    res
      .status(StatusCodes.OK)
      .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, results });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while fetching products",
      error: error.message,
    });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const results = await productModel.findById(`${req.params.id}`);
    res
      .status(StatusCodes.OK)
      .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, results });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: `Error while fetching product with id: ${req.params.id}`,
      error: error.message,
    });
  }
});

//* add product
router.route("/").post(async (req, res) => {
  try {
    const errors = addProductBodyValidator(req.body);
    if (errors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        errors,
      });
    }
    const kat = await categoryModel
      .findOne({ nazwa: req.body.kategoria })
      .catch((err) => {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: "Error while adding product, category not found",
          error: err.message,
        });
      });

    const np = new productModel({
      nazwa: req.body.nazwa,
      opis: req.body.opis,
      cena: req.body.cena,
      waga: req.body.waga,
      kategoria: kat._id,
    });
    console.log(np.validateSync());
    const val = await np.save();
    return res
      .status(StatusCodes.OK)
      .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, val });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while adding product",
      error: error.message,
    });
  }
});

//* update product

router.route("/:id").put(async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: "Invalid product id",
      });
    }

    const errors = updateProductBodyValidator(req.body);
    if (errors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        errors,
      });
    }

    if (updates.kategoria) {
      const category = await categoryModel.findOne({
        nazwa: updates.kategoria,
      });
      if (!category) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: "Category not found",
        });
      } else {
        updates.kategoria = category._id;
      }
    }

    const updatedProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: `${StatusCodes.NOT_FOUND} ${ReasonPhrases.NOT_FOUND}`,
        message: `Product with id ${productId} not found`,
      });
    }
    return res.status(StatusCodes.OK).json({
      status: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      updatedProduct,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while updating product",
      error: error.message,
    });
  }
});

router.route("/:id/seo-description").get(async (req, res) => {
  try {
    const results = await productModel.find({ _id: req.params.id });
    res.set("Content-Type", "text/html");
    const chatCompletion = await getGroqChatCompletion(results);
    res.send(Buffer.from(chatCompletion.choices[0]?.message?.content || ""));
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while fetching product with seo description",
      error: error.message,
    });
  }
});
