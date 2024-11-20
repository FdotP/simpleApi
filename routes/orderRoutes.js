import express from "express"
import { productModel } from "../models/productModel.js"
import {listModel, orderModel} from "../models/orderModel.js"
import {stanModel} from "../models/stanZamowieniaModel.js"

export const router2 = express.Router();

router2.route("/").get(async (req,res)=>{
    const results = await orderModel.find();
    res.json(results);
})

router2.route("/:id").get(async (req,res)=>{
    const results = await productModel.findById(`${req.params.id}`);
    res.json(results);
})

router2.route("/").post(async (req,res)=>{
    const stanid = await stanModel.findOne({nazwa:req.body.stanZamowienia}) 
    const np = new orderModel({
    dataZatwierdzenia : req.body.dataZatwierdzenia,
    stanZamowienia : stanid._id,
    nazwaUzytkownika : req.body.nazwaUzytkownika,
    email : req.body.email,
    numerTelefonu : req.body.numerTelefonu,
    listaZakupow:new listModel({
      item:req.body.item,
      count:req.body.count
    })
  });
  const val = await np.save().catch(err=>res.status(400).send({eroror: err.mess}));
  res.json(val); 
})

router2.route("/:id").patch(async (req,res)=>{
    const productId = req.params.id;
    const updatedId = req.body;
    orderModel.findOneAndUpdate({_id: productId}, updatedId)
    .then((stu)=>res.json(stu))
    .catch(err=>res.status(400).send({eroror: err.message}));
})

router2.route("/orders/status/:id").get(async (req,res)=>{
    const results = await orderModel.find({stanZamowienia: req.params.id});
  res.json(results);
})

router2.route("/orders/:id/opinions").patch(async (req,res)=>{
    const productId = req.params.id;
    const updatedId = req.body;
    orderModel.findOneAndUpdate({_id: productId}, updatedId,{runValidators:true})
    .then((stu)=>res.json(stu))    
    .catch(err=>res.status(400).json({error: err.message}));
})
