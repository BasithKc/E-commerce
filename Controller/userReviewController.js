//Importing models
const Products = require('../model/product')
const Users = require('../model/users')
const Reviews = require('../model/reviews')

//ObjectID
const { ObjectId } = require('mongodb');


module.exports = {
  //render review page for a product
  reviewProductPage: async (req, res) => {

    const message = req.query.message
    const productId = new ObjectId(req.params.productId)

    const product = await Products.findById(productId)//fetch product from db

    res.render('user/html/review', {
      product,
      message,
    })
  },

  //function to render the page to edit a review
  reviewProductEdit: async (req, res) => {
    const message = req.query.message
    const productId = new ObjectId(req.params.productId)

    //if user clicks on edit button of a review which has has submitted
    if (req.query.revId) {
      const reviewId = new ObjectId(req.query.revId);

      //review
      var review = await Reviews.findOne({ "reviews._id": reviewId })
      console.log(review)
    }
    const product = await Products.findById(productId)//fetch product from db

    res.render('user/html/review-edit', {
      product,
      message,
      review: review || ''
    })
  },

  //function to edit a review posting
  reveiwEditPost: async (req, res) => {
    let { rating, review } = req.body;
    console.log(req.body)

    //reviewId
    const reviewId = new ObjectId(req.body.reviewId)

    console.log(reviewId)

    //manipulating the rating  and review to make them safe for database
    if (rating === 'Very Bad') {
      rating = 1
    } else if (rating === 'Bad') {
      rating = 2
    } else if (rating === 'Good') {
      rating = 3
    } else if (rating === 'Very Good') {
      rating = 4
    } else if (rating === 'Excellent') {
      rating = 5
    }

    const date = new Date(); // Your date object

    const day = date.getDate();
    const month = date.getMonth() + 1; // Adding 1 because getMonth() returns 0-based index
    const year = date.getFullYear();

    const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;

    try {
      let reviews = await Reviews.findOneAndUpdate(
        {
          "reviews._id": reviewId
        },
        {
          $set: {

            "reviews.$.review": review,
            "reviews.$.rating": rating,
            "reviews.$.time": formattedDate
          }
        },
        {
          new: true, // return updated document instead of original one
        }
      )

      res.status(200).json({ success: true })
    } catch (error) {
      console.log(error)
    }
  },

  //delte a specific review from the database by its id
  deleteReview: async (req, res) => {
    const reviewId = new ObjectId(req.params.reviewId)

    try {
      await Reviews.findOneAndDelete({ "reviews._id": reviewId })
      res.redirect('/user/review-preview')
    } catch (error) {
      console.log(error)
    }
  },

  //Function after submitting  the form in add review page to save the data into the database
  submitReview: async (req, res) => {
    let { rating, review, productId } = req.body;
    const userId = new ObjectId(req.session.userId);


    //manipulating the rating  and review to make them safe for database
    if (rating === 'Very Bad') {
      rating = 1
    } else if (rating === 'Bad') {
      rating = 2
    } else if (rating === 'Good') {
      rating = 3
    } else if (rating === 'Very Good') {
      rating = 4
    } else if (rating === 'Excellent') {
      rating = 5
    }

    const date = new Date(); // Your date object

    const day = date.getDate();
    const month = date.getMonth() + 1; // Adding 1 because getMonth() returns 0-based index
    const year = date.getFullYear();

    const formattedDate = `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;

    try {
      let reviews = await Reviews.findOne({ productId })

      if (!reviews) {

        reviews = new Reviews({
          productId: new ObjectId(productId),
          reviews: [{
            userId,
            review,
            rating,
            time: formattedDate
          }]
        })
        await reviews.save()
      } else {
        reviews.reviews.push({
          userId,
          review,
          rating,
          time: formattedDate
        })
        await reviews.save()

      }
      res.status(200).json({ success: true })
    } catch (error) {
      console.log(error)
    }

  },

  //review Preview
  reviewPagePreview: async (req, res) => {
    const userId = req.session.userId

    const nav = req.query.nav//nav

    //user
    const user = await Users.findById(userId)

    //fetching review for each userId
    const reviews = await Reviews.find({ "reviews.userId": userId }).populate('productId',).populate({
      path: 'reviews.userId',
      model: 'User'
    });

    res.render('user/html/review-preview-page', {
      user,
      reviews,
      nav,
      reviews
    })
  },
}