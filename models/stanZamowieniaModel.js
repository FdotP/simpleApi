import mongoose from "mongoose";
export const stanZamowienia = new mongoose.Schema({
  nazwa : String
});

export const stanModel = mongoose.model('stanZamowienia', stanZamowienia);