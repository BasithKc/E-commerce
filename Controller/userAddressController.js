//Importing models
const Users = require('../model/users')
const Addresses = require('../model/address')

//ObjectID
const { ObjectId } = require('mongodb');

module.exports = {
  //address listing page
  getUserAddress: async (req, res) => {

    //nav
    const nav = req.query.nav
    //UserId
    const userId = new ObjectId(req.session.userId)

    //User
    const user = await Users.findById(userId)

    //Addressess fetching
    const address = await Addresses.findOne({ userId })

    res.render('user/html/account-addres', { address: address?.addresses, nav, user })
  },

  //Address adding
  addAddressPost: async (req, res) => {
    //Userid
    const userId = new ObjectId(req.session.userId)
    //req.body
    const { name, number, zip_code, post, address, country, state, addressType } = req.body
    const addresstoAdd = {
      name,
      number,
      address,
      country,
      state,
      post,
      zip_code,
      addressType
    }

    //checking if already any address is creted for this user
    let addressExist = await Addresses.findOne({ userId })

    if (!addressExist) {

      //new instance creation for address
      addressExist = new Addresses({
        userId,
        addresses: [addresstoAdd]
      })
      await addressExist.save()
    }
    else {
      //if address already exist for an user push the new address to the addresses field
      await Addresses.findOneAndUpdate(
        { userId },
        { $push: { addresses: addresstoAdd } },
        { new: true }
      )
    }

    res.redirect('/user/account/address?nav=Manage Addresses');
  },

  //Address Editing
  editAddressPost: async (req, res) => {
    //Userid
    const userId = new ObjectId(req.session.userId)
    //req.body
    const { name, number, zip_code, post, address, country, state, addressType } = req.body

    const addresstoUpdate = {
      name,
      number,
      address,
      country,
      state,
      post,
      zip_code,
      addressType
    }

    const addressId = new ObjectId(req.params.addressId)//addressId

    await Addresses.findOneAndUpdate(
      { userId, "addresses._id": addressId },
      {
        $set: {
          "addresses.$": addresstoUpdate
        }
      }
    )
    res.redirect('/user/account/address?nav=Manage Addresses');

  },

  //Address deleting
  deleteAddress: async (req, res) => {

    const userId = new ObjectId(req.session.userId)

    //addressid from req.params
    const addressId = new ObjectId(req.params.addressId)

    try {
      //Find by userid and delete the selected address  from array of addresses
      await Addresses.findOneAndUpdate(
        { userId },
        { $pull: { addresses: { _id: addressId } } },
        { new: true }
      )
      res.redirect('/user/account/address?nav=Manage Addresses')

    } catch (error) {
      console.log(error)
    }


  },
}