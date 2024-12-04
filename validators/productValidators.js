function addProductBodyValidator(body) {
  const errors = [];

  if (body.nazwa === undefined) {
    errors.push("Product name is required");
  } else if (typeof body.nazwa !== "string") {
    errors.push("Product name must be a string");
  } else if (body.nazwa.trim() === "") {
    errors.push("Product name cannot be empty");
  }

  if (body.opis === undefined) {
    errors.push("Product description is required");
  } else if (typeof body.opis !== "string") {
    errors.push("Product description must be a string");
  } else if (body.opis.trim() === "") {
    errors.push("Product description cannot be empty");
  }

  if (body.cena === undefined) {
    errors.push("Product price is required");
  } else if (typeof body.cena !== "number") {
    errors.push("Product price must be a number");
  } else if (body.cena <= 0) {
    errors.push("Product price must be greater than zero");
  }

  if (body.waga === undefined) {
    errors.push("Product weight is required");
  } else if (typeof body.waga !== "number") {
    errors.push("Product weight must be a number");
  } else if (body.waga <= 0) {
    errors.push("Product weight must be greater than zero");
  }

  if (body.kategoria === undefined) {
    errors.push("Product category is required");
  } else if (typeof body.kategoria !== "string") {
    errors.push("Product category must be a string");
  } else if (body.kategoria.trim() === "") {
    errors.push("Product category cannot be empty");
  }

  return errors;
}

function updateProductBodyValidator(body) {
  const errors = [];

  if (body.nazwa !== undefined) {
    if (typeof body.nazwa !== "string") {
      errors.push("Name must be a string");
    } else if (body.nazwa.trim() === "") {
      errors.push("Name cannot be empty");
    }
  }

  if (body.opis !== undefined) {
    if (typeof body.opis !== "string") {
      errors.push("Description must be a string");
    } else if (body.opis.trim() === "") {
      errors.push("Description cannot be empty");
    }
  }
  if (body.cena !== undefined) {
    if (typeof body.cena !== "number") {
      errors.push("Price must be a number");
    } else if (body.cena <= 0) {
      errors.push("Price must be greater than zero");
    }
  }

  if (body.waga !== undefined)
    if (typeof body.waga !== "number") {
      errors.push("Weight must be a number");
    } else if (body.waga <= 0) {
      errors.push("Weight must be greater than zero");
    }

  if (body.kategoria !== undefined) {
    if (typeof body.kategoria !== "string") {
      errors.push("Category must be a string");
    } else if (body.kategoria.trim() === "") {
      errors.push("Category cannot be empty");
    }
  }

  return errors;
}

export { addProductBodyValidator, updateProductBodyValidator };
