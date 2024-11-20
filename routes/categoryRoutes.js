import express from "express"
import { categoryModel } from "../models/kategoriaModel.js";
export const router1 = express.Router();

router1.route("/").get(async (req,res)=>{
    const results = await categoryModel.find();
    res.json(results);
})



