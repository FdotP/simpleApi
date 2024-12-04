import express from "express";
import { productModel } from "../models/productModel.js";
import { listModel, orderModel } from "../models/orderModel.js";
import { stanModel } from "../models/stanZamowieniaModel.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const router2 = express.Router();

router2.route("/").get(async (req, res) => {
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

// TODO naprawic - ma zwracac zamowenia z danym statusem
router2.route("/:id").get(async (req, res) => {
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

router2.route("/").post(async (req, res) => {
  try {
    const stanid = await stanModel.findOne({ nazwa: req.body.stanZamowienia });
    const np = new orderModel({
      dataZatwierdzenia: req.body.dataZatwierdzenia,
      stanZamowienia: stanid._id,
      nazwaUzytkownika: req.body.nazwaUzytkownika,
      email: req.body.email,
      numerTelefonu: req.body.numerTelefonu,
      listaZakupow: new listModel({
        item: req.body.item,
        count: req.body.count,
      }),
    });
    const val = await np.save().catch((err) =>
      res.status(StatusCodes.BAD_REQUEST).send({
        status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
        message: "Error while saving product to database",
        error: err.mess,
      })
    );
    res.json(val);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while adding product",
      error: err.message,
    });
  }
});

router2.route("/:id").patch(async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedId = req.body;
    orderModel
      .findOneAndUpdate({ _id: productId }, updatedId)
      .then((stu) =>
        res
          .status(StatusCodes.OK)
          .json({ status: `${StatusCodes.OK} ${ReasonPhrases.OK}`, stu })
      )
      .catch((err) =>
        res.status(StatusCodes.BAD_REQUEST).send({
          status: `${StatusCodes.BAD_REQUEST} ${ReasonPhrases.BAD_REQUEST}`,
          message: "Error while updating product",
          error: err.message,
        })
      );
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: `${StatusCodes.INTERNAL_SERVER_ERROR} ${ReasonPhrases.INTERNAL_SERVER_ERROR}`,
      message: "Error while updating product",
      error: err.message,
    });
  }
});

router2.route("/orders/status/:id").get(async (req, res) => {
  const results = await orderModel.find({ stanZamowienia: req.params.id });
  res.json(results);
});

router2.route("/orders/:id/opinions").patch(async (req, res) => {
  const productId = req.params.id;
  const updatedId = req.body;
  orderModel
    .findOneAndUpdate({ _id: productId }, updatedId, { runValidators: true })
    .then((stu) => res.json(stu))
    .catch((err) => res.status(400).json({ error: err.message }));
});
