import express from "express"
import { productModel } from "../models/productModel.js";
import { categoryModel } from "../models/kategoriaModel.js";
import { getGroqChatCompletion } from "../groq.js";

export const router = express.Router();

router.route("/").get(async (req,res)=>{
    const results = await productModel.find();
    res.json(results);
})

router.route("/:id").get(async (req,res)=>{
    const results = await productModel.findById(`${req.params.id}`);
    res.json(results);
})

router.route("/").post(async (req,res)=>{
    const kat = await categoryModel.findOne({nazwa:req.body.kategoria})
    const np = new productModel({
      nazwa : req.body.name,
      opis : req.body.opis,
      cena : req.body.cena,
      waga : req.body.waga,
      kategoria : kat._id,
    });
    console.log(np.validateSync());
    const val = await np.save();
    res.json(val); 
})

router.route("/:id").put(async (req,res)=>{
    const productId = req.params.id;
    const updatedId = req.body;
      productModel.findOneAndUpdate({_id: productId}, updatedId,{runValidators:true})
      .then((stu)=>res.json(stu))    
      .catch(err=>res.status(400).json({error: err.message}));
})


router.route("/:id/seo-description").get(async (req,res)=>{
    const results = await productModel.find({_id: req.params.id});
    res.set('Content-Type', 'text/html');
    const chatCompletion = await getGroqChatCompletion(results);
    res.send(Buffer.from(chatCompletion.choices[0]?.message?.content || ""));
})

