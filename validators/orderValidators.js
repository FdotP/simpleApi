import mongoose from "mongoose";
import Product from "../models/Product.js";

const phoneRegex = /^\d{9}$/;
const emailRegex = /^[^@]+@[^@]+.[^@]+$/;

function addOrderBodyUserValidator(body) {
  const errors = [];
  if (body.user_id === undefined) {
    errors.push("User id is required");
  } else if (!mongoose.Types.ObjectId.isValid(body.user_id)) {
    errors.push("User id is not valid");
  }

  if (body.user_name === undefined) {
    errors.push("User name is required");
  } else if (typeof body.user_name !== "string") {
    errors.push("User name must be a string");
  } else if (body.user_name.trim() === "") {
    errors.push("User name is empty");
  }

  if (body.email === undefined) {
    errors.push("Email is required");
  } else if (typeof body.email !== "string") {
    errors.push("Email must be a string");
  } else if (!emailRegex.test(body.email)) {
    errors.push("Email is not valid");
  }

  if (body.phone === undefined) {
    errors.push("Phone number is required");
  } else if (typeof body.phone !== "string") {
    errors.push("Phone number must be a string");
  } else if (!phoneRegex.test(body.phone)) {
    errors.push("Phone number is not valid");
  }

  return errors;
}

function updateOrderStatusValidator(newstatus_id, oldstatus_id) {
  const statusTransitions = {
    status1: ["status2", "status3", "status4"],
    status2: ["status3", "status4"],
    status3: ["status4"],
  };
  const errors = [];
  if (newstatus_id === undefined) {
    errors.push("New status is required");
  } else if (typeof newstatus_id !== "string") {
    errors.push("New status must be a string");
  } else if (newstatus_id.trim() === "") {
    errors.push("New status is empty");
  } else if (
    !["status1", "status2", "status3", "status4"].includes(newstatus_id)
  ) {
    errors.push("New status is not valid");
  }

  if (newstatus_id == oldstatus_id) {
    errors.push("Order status is the same as before");
  }
  if (oldstatus_id == "status3") {
    errors.push("Order status cannot be changed when order was cancelled");
  }
  if (
    newstatus_id in statusTransitions &&
    statusTransitions[newstatus_id].includes(oldstatus_id)
  ) {
    errors.push("Order status cannot be changed to previous status");
  }
  return errors;
}

async function addOrderItemsValidator(items) {
  const errors = [];
  if (items.length === 0) {
    errors.push("Items filed is empty");
    return errors;
  }
  for (const element of items) {
    if (!mongoose.Types.ObjectId.isValid(element.product_id)) {
      errors.push("Product id is invalid");
    } else {
      const product = await Product.findById(element.product_id);
      if (!product) {
        errors.push(`Product with id ${element.product_id} not found`);
      } else {
        if (!Number.isInteger(element.quantity)) {
          errors.push(
            `ProductID: ${element.product_id} - Quantity is not a number`
          );
        } else if (element.quantity < 1) {
          console.log(element.quantity);
          errors.push(
            `ProductID: ${element.product_id} - Quantity cannot be less than 1`
          );
        }
        if (
          typeof element.unit_price !== "number" ||
          !Number.isFinite(element.unit_price)
        ) {
          errors.push(
            `ProductID: ${element.product_id} - Price is not a valid number`
          );
        } else if (element.unit_price <= 0) {
          errors.push(
            `ProductID: ${element.product_id} - Price cannot be 0 or negative`
          );
        }
      }
    }
  }

  return errors;
}

export {
  addOrderBodyUserValidator,
  updateOrderStatusValidator,
  addOrderItemsValidator,
};
