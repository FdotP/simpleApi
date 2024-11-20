import express from "express"
import { categoryModel } from "../models/kategoriaModel.js";

export const router3 = express.Router();

router3.route("/").get(async (req,res)=>{
    const results = await categoryModel.find();
    res.json(results);
})



