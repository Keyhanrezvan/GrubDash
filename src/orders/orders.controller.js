const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function orderExists(req, res, next){
    const orderId = req.params.orderId
    const foundOrder = orders.find((order)=>order.id === orderId)
    if (foundOrder) {
        res.locals.order = foundOrder
        next()
    } else {
        next({status: 404, message: `Order ${orderId} not found.`})
    }
}

function IdValid(req, res, next){
  const {data:{id}} =req.body
  const orderId = req.params.orderId
    if (
        req.body.data.id === null ||
        req.body.data.id === undefined ||
        req.body.data.id === ""
    ) {
        return next()
    }
    if (req.body.data.id !== orderId){
        next({
            status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
        })
    } else {
        next()
    }
}
  

function statusValid (req, res, next){
    const {data: {status}={}} =req.body
    if (status !== ("pending" || "preparing" || "out-for-delivery" || "delivered")) {
        return next({status:400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered."})
    }
    if (status === "delivered") {
        return next({
            status: 400, message: `A delivered order cannot be changed`
        })
    } 
    next()
}

function createValid(req, res, next){
    const {deliverTo, mobileNumber, dishes} =req.body.data
    if (!deliverTo){
        next({status: 400, message: "Order must include a deliverTo."})
    }
    if (!mobileNumber){
        next({status: 400, message: "Order must include a mobileNumber."})
    }
    if (!dishes){
        next({status: 400, message: "Order must include a dish."})
    }
    if (!Array.isArray(dishes) || !dishes.length > 0){
        return next({
            status: 400,
            message: `Dishes must include at least one dish.`
        })
    }
    dishes.map((dish, index)=>{
        const {quantity} = dish
        if (!quantity || !Number.isInteger(quantity) || !quantity > 0){
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0.`
            })
        }
    })
    res.locals.order = req.body.data
    next()
}

function list(req, res){
    res.json({data: orders})
}

function create(req, res){
    const newOrder= {...res.locals.order, id: nextId()}
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

function read(req, res){
    const foundOrder =res.locals.order
    if (foundOrder){
        res.json({data:foundOrder})
    }
}

function update(req, res) {
    const orderId = req.params.orderId;
    let { data: {id, deliverTo, mobileNumber, status, dishes} } = req.body;
    let updatedOrder = {
      id: orderId,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    };
  
    return res.json({ data: updatedOrder });
  }

  function destroy(req, res, next){
const orderId = req.params.orderId
const foundOrder = res.locals.order
const index = orders.find((order)=> order.id === Number(orderId))
const todelete = orders.splice(index, 1)

if (foundOrder.status === "pending"){
    res.sendStatus(204)
}
next({
    status:400,
    message:"An order cannot be deleted unless it is pending."
})
  }

  module.exports={
    create: [createValid, create],
    read: [orderExists, read],
    update: [orderExists, createValid, IdValid, statusValid, update],
    delete:[orderExists, destroy],
    list,
  }