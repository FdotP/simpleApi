import mongoose from "mongoose";
export const Kategoria = new mongoose.Schema({
    nazwa : String ,
    _id: String
  });

export  const categoryModel = mongoose.model('Kategoria', Kategoria);