const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");


// TODO: Implement the /dishes handlers needed to make the tests pass
//CREATE
function create(req, res) {
  const { data: { id, name, description, price, image_url }, } = req.body;
         
  const newId = nextId();
  const newName = req.body.data.name;
  const newDescription = req.body.data.description;
  const newPrice = req.body.data.price;
  const newImageUrl = req.body.data.image_url;
  
  const newDish = {
    id: newId,
    name: newName,
    description: newDescription,
    price: newPrice,
    image_url: newImageUrl
  };
  
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

//CREATE VALIDATION
//Check if dish already exists
 function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.filter((dish) => dish.id === dishId);
    
    if (foundDish.length > 0) {
      res.locals.dish = foundDish;
      next();
    } else {
      next({ status: 404, message: `Dish ${dishId} not found.` });
    }
  };



//READ
function read(req, res, next) {
  const foundDish = res.locals.dish;
  if(foundDish) {
    res.json({ data: foundDish[0] });
  }
};

//VALIDATION FOR READ
//Check if name is valid
function isNameValid(req, res, next) {
  const { data: name } = req.body;
  
  if (
    req.body.data.name === null ||
    req.body.data.name === "" ||
    req.body.data.name === undefined
  ) {
    next({ status: 400, message: "Dish must include a name." });
  }
  next();
};

//Check if description is valid
function isDescriptionValid(req, res, next) {
  const { data: description } = req.body;
  
  if (
    req.body.data.description === null ||
    req.body.data.description === "" ||
    req.body.data.description === undefined
  ) {
    next({ status: 400, message: "Dish must include a description." });
  }
  next();
};

//Check if price is valid
function isPriceValid(req, res, next) {
  const { data: price } = req.body;

  if (
    req.body.data.price === null ||
    req.body.data.price === undefined ||
    req.body.data.price === ""
  ) {
    next({ status: 400, message: "Dish must include a price." });
  }
  if (typeof req.body.data.price === "number" && req.body.data.price > 0) {
    return next();
  } else {
    next({
      status: 400, 
      message: `The price must be a number greater than 0.`,
    });
  }
};

//Check if image url is valid
function isUrlValid(req, res, next) {
  const { data: image_url } = req.body;
  
  if (
    req.body.data.image_url === null ||
    req.body.data.image_url === "" ||
    req.body.data.image_url === undefined
  ) {
    next({ status: 400, message: "Dish must include an image_url." });
  }
  next();
};

//Check if ID is valid
function isIdValid(req, res, next) {
  let {
    data: { id },
  } = req.body;
  
  const dishId = req.params.dishId;
  if (
    req.body.data.id === null ||
    req.body.data.id === "" ||
    req.body.data.id === undefined
  ) {
    return next();
  }
  if (req.body.data.id !== dishId) {
    next({
      status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  } else {
    next();
  }
};


//UPDATE
function update(req, res) {
  dishId = req.params.dishId;
  
  let {
    data: { name, description, price, image_url },
  } = req.body;
  
  let updatedDish = {
    id: dishId,
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url,
  };
  
  return res.json({ data: updatedDish });
};


//LIST
function list(req, res) {
  res.json({ data: dishes });
};


//EXPORTS
module.exports = {
  list, 
  create: [isNameValid, isDescriptionValid, isPriceValid, isUrlValid, create],
  read: [dishExists, read],
  update: [
    dishExists,
    isNameValid,
    isDescriptionValid,
    isPriceValid,
    isUrlValid,
    isIdValid,
    update,
  ],
};
