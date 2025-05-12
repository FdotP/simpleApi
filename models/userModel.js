import mongoose from "mongoose";

export const user = new mongoose.Schema({ 
    login: {
      type:String,
      required:true
    },
    email: {
      type:String,
      required:true
    },
    phoneNumber: {
      type:Number,
      required:true
    },
    password: {
      type:String,
      required:true
    },
    role: {
      type:String,
      required:true,
    default:"user"
  }
  });

export const loginModel = mongoose.model('users', user)
