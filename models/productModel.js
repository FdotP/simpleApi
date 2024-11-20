import mongoose from "mongoose"
export const Produkt = new mongoose.Schema({
    nazwa : {
      type:String,
      required:true
    },
    opis : {
      type:String,
      required:true
    },
    cena :{
      type:Number,
      required:true,
      min:0
    },
    waga: {
      type:Number,
      required:true,
      min:0.01
    }, 
    kategoria : {type: mongoose.Schema.Types.ObjectId, ref:'categoryModel' , required: true}
  });

  export const productModel = mongoose.model('Produkt', Produkt);