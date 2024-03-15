//Third party modules
const Razorpay = require('razorpay')

//Importing models
const Products = require('../model/product')
const Cart = require('../model/cart')
const Users = require('../model/users')
const Addresses = require('../model/address')
const Orders = require('../model/order')

//ObjectID
const { ObjectId } = require('mongodb');

//function of dateContvert from utilities
const dateConvert = require('../utilities/dateConvert')

//razorpay credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
})

module.exports = {
  //create Order 
  createOrder: async (req, res) => {

    try {
      //Session userId
      const userId = new ObjectId(req.session.userId)
      const user = await Users.findOne({ _id: userId })

      const { totalPrice } = req.body //req.body of axios
      const addressId = new ObjectId(req.body.addressId)
      const options = {
        amount: totalPrice * 100,
        currency: 'INR',
      }


      //checking if already any address  for this id
      let addressExist = await Addresses.findOne(
        { "addresses._id": addressId },// Match the document containing the desired address
        { "addresses.$": 1 } // Project only the matched address
      )

      const order = await razorpay.orders.create(options)

      res.json({ order, key_id: process.env.RAZORPAY_ID_KEY, user, address: addressExist, totalPrice })

    } catch (error) {
      console.log(error)
    }

  },

  //complete order
  completeOrder: async (req, res) => {

    const { products } = req.body

    try {
      //Admin for Operator
      const admin = await Users.findOne({ role: 'admin' })

      if (req.body.type === 'razorpay') {
        var responseData = req.body.responseData
        //Order Id
        var orderId = responseData.order.id

        //delivery location
        var address = responseData.address.addresses[0]
      } else if (req.body.type === 'cod') {

        const addressId = new ObjectId(req.body.addressId)

        //checking if already any address  for this id
        address = await Addresses.findOne(
          { "addresses._id": addressId },// Match the document containing the desired address
          { "addresses.$": 1 } // Project only the matched address
        )
        address = address.addresses[0]

        orderId = req.body.orderID
      }
      //User Id
      const userId = new ObjectId(req.session.userId)

      //date
      const currentDate = new Date()

      const startDate = dateConvert(currentDate) //Start Date

      const estimatedDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const dueDate = dateConvert(estimatedDate)//End date


      //Find if user already have a orders
      let orderExist = await Orders.findOne({ userId })

      //User doesn't have already an order
      if (!orderExist) {

        orderExist = new Orders({
          userId,
          orders: []
        })

        //Create order for each product
        products.forEach(async (product) => {
          orderExist.orders.push({

            orderId,
            addressId: address._id,
            product: product.productId,
            quantity: product.quantity,
            location: `${address.post}, ${address.state}`,
            operator: admin.firstName + ' ' + admin.lastName,
            location: address.post,
            paymentMethod: req.body.type,
            start_date: startDate,
            estDeliverydue: dueDate

          })
        })
        await orderExist.save()

      } else {
        //If order exist push the order details to orders
        products.forEach(async (product) => {
          orderExist.orders.push({

            orderId,
            addressId: address._id,
            product: product.productId,
            quantity: product.quantity,
            location: `${address.post, address.state}`,
            operator: admin.firstName + ' ' + admin.lastName,
            location: address.post,
            start_date: startDate,
            estDeliverydue: dueDate

          })
        })
        await orderExist.save()
      }


      //Delete the products from cart
      const productIds = products.map(product => product.productId); //Extracting only the product ids from the product 

      await Cart.findOneAndUpdate(
        { userId: userId },
        {
          $pull: {
            products: { productId: { $in: productIds } }//removing products from cart
          }
        }
      )

      //decreasing the stock as per the quantity
      product.forEach(async (product) => {
        await Product.findOneAndUpdate({
          _id: new ObjectId(product.productId)
        }, {
          $inc: { stock: -product.quantity } //decrement the value of stock
        })
      })

      res.status(200).json({ success: true })

    } catch (error) {

      console.log(error)//catching the error
    }

  },

  //Order listing 
  getOrdersList: async (req, res) => {

    try {
      //userId
      const userId = new ObjectId(req.session.userId)

      // Find the user document by userId
      const orders = await Orders.findOne({ userId }).populate({
        path: 'orders',
        populate: {
          path: 'product',
          model: 'products'
        }
      })

      res.render('user/html/orders', { orders: orders?.orders || '' })
    } catch (error) {
      console.log(error)
    }


  },

  //function to show details of product
  OrderDetailsPage: async (req, res) => {
    const userId = new ObjectId(req.session.userId)
    //Order id from params
    const orderId = new ObjectId(req.params.orderId);


    const orders = await Orders.findOne(
      { "orders._id": orderId },// Match the document containing the desired order
      { "orders.$": 1 }// Project only the matched order
    )

    console.log(orders)

    let orderPro = orders.orders[0];

    const address = await Addresses.findOne(
      {
        userId,
        "addresses._id": orderPro.addressId // Match the document containing the desired address ID
      },
      { "addresses.$": 1 } // Project only the matched address
    );

    //fetching address
    console.log(address)

    const productDetails = await Products.findOne({ _id: orderPro.product })


    res.render('user/html/order-details', {
      product: productDetails,
      address,
      orderPro,
    })
  },

  //function if user cancelled an order
  orderCancel: async (req, res) => {
    const userId = new ObjectId(req.session.userId)

    const orderId = req.params.orderId //orderId
    const productId = new ObjectId(req.query.product)//product id
    console.log(productId)

    // Find the orders that match the specified userId and orderId
    const orders = await Orders.findOne({ userId, "orders.orderId": orderId });

    const currentDate = new Date()

    const estimatedDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const cancellDate = dateConvert(estimatedDate)//End date
    // Update the status of the specific order
    orders.orders.forEach(order => {
      if (order.product.toString() === productId.toString()) {
        order.status = 'Cancelled';
        order.cancelledDate = cancellDate
      }
    });
    await orders.save()

    res.redirect('/user/account/orders/order-details/' + orderId + '?product=' + productId.toString());
  },

}