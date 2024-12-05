import mongoose from "mongoose";
const emailRegex =
  /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const listPoint = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "productModel" },
  count: {
    type: Number,
    min: 1,
  },
  price: {
    type: Number,
    min: 0,
  },
});

export const zamowienie = new mongoose.Schema({
  dataZatwierdzenia: Date,
  stanZamowienia: { type: mongoose.Schema.Types.ObjectId, ref: "stanModel" },
  nazwaUzytkownika: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "User email is required"],
    match: [emailRegex, "Please provide a valid email address"],
  },
  numerTelefonu: {
    type: String,
    match: /^\d{9}$/,
  },
  listaZakupow: [listPoint],
  opinia: [
    {
      ocena: {
        type: Number,
        min: 1,
        max: 5,
      },
      tresc: {
        type: String,
        required: true,
      },
    },
  ],
});

export const orderModel = mongoose.model("zamowienie", zamowienie);
export const listModel = mongoose.model("points", listPoint);
