import jsonwebtoken from "jsonwebtoken"
import { loginModel } from "../models/userModel.js"
import { orderModel } from "../models/orderModel.js"

export const validateRequest = (requiredRole) => {
    return (req, res, next) => {
        const { authorization } = req.headers
        const token = authorization.substring('Bearer '.length);
        try {
            const { exp, iss, role } = jsonwebtoken.verify(token, 'pindol');
            if (iss === 'my-api' && exp < Date.now() && role === requiredRole) {
                next();
                return;
            }
            else
            {
                res.status(403)
                res.send({messege:"perrmission denied"})
            }
        } catch (err) {
            res.sendStatus(403);
            return;
        }
    }
}

export const validateRequest1 = (requiredRole) => {
    return async (req, res, next) => {
        const { authorization } = req.headers
        const token = authorization.substring('Bearer '.length);
        const order = await orderModel.findOne({_id:req.params.id}).select({nazwaUzytkownika:1, _id:0});
        try {
            const { sub, exp, iss, role } = jsonwebtoken.verify(token, 'pindol');
            const user = await loginModel.findOne({_id:sub}).select({login:1, _id:0})
            if (iss === 'my-api' && exp < Date.now() && role === requiredRole && user.login == order.nazwaUzytkownika) {
                next();
                return;
            }
            else
            {
                res.status(403)
                res.send({messege:"perrmission denied"})
            }
        } catch (err) {
            res.sendStatus(403);
            return;
        }
    }
}