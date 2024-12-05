import mongoose from "mongoose";
import { productModel } from "../models/productModel.js";

const phoneRegex = /^\d{9}$/;
const emailRegex = /^[^@]+@[^@]+.[^@]+$/;

function addOrderBodyUserValidator(body) {
  const errors = [];

  if (body.nazwaUzytkownika === undefined) {
    errors.push("User name is required");
  } else if (typeof body.nazwaUzytkownika !== "string") {
    errors.push("User name must be a string");
  } else if (body.nazwaUzytkownika.trim() === "") {
    errors.push("User name is empty");
  }

  if (body.email === undefined) {
    errors.push("Email is required");
  } else if (typeof body.email !== "string") {
    errors.push("Email must be a string");
  } else if (!emailRegex.test(body.email)) {
    errors.push("Email is not valid");
  }

  if (body.numerTelefonu === undefined) {
    errors.push("Phone number is required");
  } else if (typeof body.numerTelefonu !== "string") {
    errors.push("Phone number must be a string");
  } else if (!phoneRegex.test(body.numerTelefonu)) {
    errors.push("Phone number is not valid");
  }

  return errors;
}

function updateOrderStatusValidator(newstatus, oldstatus) {
  const statusTransitions = {
    niezatwierdzone: ["zatwierdzone", "zrealizowane"],
    zatwierdzone: ["zrealizowane"],
  };
  const errors = [];
  if (newstatus === undefined) {
    errors.push("New status is required");
  } else if (typeof newstatus !== "string") {
    errors.push("New status must be a string");
  } else if (newstatus.trim() === "") {
    errors.push("New status is empty");
  } else if (
    !["zatwierdzone", "anulowane", "niezatwierdzone", "zrealizowane"].includes(
      newstatus
    )
  ) {
    errors.push("New status is not valid");
  }

  if (newstatus == oldstatus) {
    errors.push("Order status is the same as before");
  }
  if (oldstatus == "anulowane") {
    errors.push("Order status cannot be changed when order was cancelled");
  }
  if (
    newstatus in statusTransitions &&
    statusTransitions[newstatus].includes(oldstatus)
  ) {
    errors.push("Order status cannot be changed to previous status");
  }
  return errors;
}

async function addOrderItemsValidator(items) {
  const errors = [];

  for (const element of items) {
    if (typeof element.price !== "number" || !Number.isFinite(element.price)) {
      errors.push(`ProductID: ${element.item} - Price is not a valid number`);
    } else if (element.price <= 0) {
      errors.push(`ProductID: ${element.item} - Price cannot be 0 or negative`);
    }
  }

  return errors;
}

export {
  addOrderBodyUserValidator,
  updateOrderStatusValidator,
  addOrderItemsValidator,
};
