import express from "express";
import { productModel } from "../models/productModel.js";
import { listModel, orderModel } from "../models/orderModel.js";
import { stanModel } from "../models/stanZamowieniaModel.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  addOrderItemsValidator,
  addOrderBodyUserValidator,
  updateOrderStatusValidator,
} from "../validators/orderValidators.js";
import mongoose from "mongoose";
import { validateRequest, validateRequest1 } from "../auth/middleware.js";

export const router2 = express.Router();

router2.route("/").get(validateRequest("user"), async (req, res) => {
  try {
    const results = await orderModel.find();
    res
      .status(StatusCodes.OK)
      .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, results });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      error: err.message,
    });
  }
});

router2.route("/:id").get(validateRequest("user"), async (req, res) => {
  try {
    const results = await productModel.findById(`${req.params.id}`);
    res.json(results);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: `Error while fetching product with id: ${req.params.id}`,
      error: err.message,
    });
  }
});

// * add order
router2.route("/").post(validateRequest("admin"), async (req, res) => {
  try {
    const userFieldsErrors = addOrderBodyUserValidator(req.body);
    if (userFieldsErrors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: "Invalid user data, order not added",
        errors: userFieldsErrors,
      });
    }

    if (req.body.listaZakupow.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: "Order must contain at least one item",
      });
    }

    let newitems = [];
    for (let element of req.body.listaZakupow) {
      if (!mongoose.Types.ObjectId.isValid(element.item)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: "Invalid product id",
        });
      }

      const product = await productModel.findById(element.item);

      if (!product) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: `Product with id ${element.item} not found`,
        });
      }
      element = { ...element, price: product.cena };
      newitems.push(element);
    }
    req.body.listaZakupow = newitems;
    console.log(req.body.listaZakupow);

    const itemsErrors = await addOrderItemsValidator(req.body.listaZakupow);
    if (itemsErrors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: "Invalid order items data, order not added",
        errors: itemsErrors,
      });
    }

    const stanid = await stanModel.findOne({ nazwa: req.body.stanZamowienia });

    const np = new orderModel({
      dataZatwierdzenia: req.body.dataZatwierdzenia,
      stanZamowienia: stanid._id,
      nazwaUzytkownika: req.body.nazwaUzytkownika,
      email: req.body.email,
      numerTelefonu: req.body.numerTelefonu,
      listaZakupow: req.body.listaZakupow,
    });
    const val = await np.save();
    return res.status(StatusCodes.OK).json({
      status: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      val,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while adding order",
      error: err.message,
    });
  }
});

router2.route("/:id").patch(validateRequest("admin"), async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: "Invalid order id",
      });
    }

    if (req.body.stanZamowienia !== undefined) {
      const newstatus = req.body.stanZamowienia;
      let oldstatus = await orderModel.findById(orderId);
      if (!oldstatus) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: `Order with id ${orderId} not found`,
        });
      }
      oldstatus = oldstatus.stanZamowienia;
      const oldstatusObject = await stanModel.findById(oldstatus);
      const oldstatusName = oldstatusObject.nazwa;

      const statusErrors = updateOrderStatusValidator(newstatus, oldstatusName);
      if (statusErrors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: "Invalid order status update, order not updated",
          errors: statusErrors,
        });
      }

      const newStatus = await stanModel.findOne({
        nazwa: updates.stanZamowienia,
      });

      updates.stanZamowienia = newStatus._id;
    }

    const updatedorder = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedorder) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: `Order with id ${orderId} not found`,
      });
    }
    return res.status(StatusCodes.OK).json({
      status: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      updatedorder,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while updating product",
      error: err.message,
    });
  }
});

// * id - nazwa statusu
router2.route("/status/:id").get(validateRequest("user"), async (req, res) => {
  try {
    const results = await orderModel.find({ stanZamowienia: req.params.id });
    return res.status(StatusCodes.OK).json({
      status: `${StatusCodes.OK} ${ReasonPhrases.OK}`,
      results,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while fetching orders",
      error: err.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
    message: "Error while fetching orders",
  });
});

router2
  .route("/:id/opinions")
  .patch(validateRequest1("user"), async (req, res) => {
    const productId = req.params.id;
    const updatedId = req.body;
    orderModel
      .findOneAndUpdate({ _id: productId }, updatedId, { runValidators: true })
      .then((stu) => res.status(StatusCodes.OK).json(stu))
      .catch((err) =>
        res.status(StatusCodes.BAD_REQUEST).json({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          error: err.message,
        })
      );
  });
