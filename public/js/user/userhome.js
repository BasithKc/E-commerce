"use strict"

//Wish list buttons
const wishlistButtons = document.querySelectorAll('.wishlist-button');

//Wishlist length to display on the wishlist icon
const wishlistLength = document.querySelector('.wishlist-length')


//Cart lenght display on cart icon
const cartLength = document.querySelector('.cart-length')

//remove product from  user's wishlist page
const removeFromWishlistButtons = document.querySelectorAll('.remove-from-wishlist');


let wishlistLengthValue = 0;
let cartLengthValue = 0



// Loop through each wishlist button
wishlistButtons.forEach(button => {
  // Add click event listener to each button
  button.addEventListener('click', async function (event) {
    event.preventDefault()
    console.log(button)
    // Extract product ID from data attribute 
    const productId = this.dataset.productId

    try {
      //Heart icon on each button
      const heartIcon = this.querySelector('.heart-icon');

      //Checking if the product already added to wishlist 
      if (heartIcon.classList.contains('ri-heart-fill')) {

        //Calling the delete function
        const response = await fetchDeleteWishlist(productId);

        //ok
        if (response.status === 200) {

          //Decreace the length
          wishlistLength.innerHTML = --wishlistLengthValue

          //removing the filled heart and adding lined heart after deleting from the wishlist
          heartIcon.classList.remove('ri-heart-fill');
          heartIcon.classList.toggle('ri-heart-line');
        } else {
          const data = response.data
          console.log(data.message)
        }

      } else {
        // Make an AJAX request to add the product to the database
        const response = await fetch('/user/add-to-wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId: productId })

        })

        if (response.ok) {

          const data = await response.json()

          if (data.success) {

            //Incrementing wishlist length 
            wishlistLength.innerHTML = ++wishlistLengthValue

            //Removing heart-line and toggle heart-fill classes    
            heartIcon.classList.remove('ri-heart-line')
            heartIcon.classList.toggle('ri-heart-fill');

          } else {
            // Handle errors or failed requests
            console.error('Failed to add product to wishlist');
          }
        }

      }
    } catch (error) {

      console.log(error)
    }
  })
});

// When the page loads
document.addEventListener('DOMContentLoaded', async () => {

  try {
    // Fetch the user's wishlist from the database
    const wishlist = await fetchUserWishlist();

    // Fetch the user's Cart from the database
    const cart = await fetchCart()

    //wishlist length
    wishlistLengthValue = wishlist.length

    // Calculate the sum of quantities using reduce
    cartLengthValue = cart.reduce((total, current) => {
      return total + current.quantity
    }, 0)
    //assinginig wishlist length to span element of wishlist
    wishlistLength.innerHTML = wishlistLengthValue

    //assigning cart length to span element of cart
    cartLength.innerHTML = cartLengthValue

    wishlistButtons.forEach(button => {

      const productId = button.dataset.productId // Get the product ID
      const heartIcon = button.querySelector('.heart-icon')

      // Check if the product is in the wishlist
      if (wishlist.includes(productId)) {

        // Product is in the wishlist, set heart icon to filled state
        heartIcon.classList.remove('ri-heart-line');
        heartIcon.classList.add('ri-heart-fill');
      }
    })
  } catch (error) {
    console.log(error)
  }
});

async function fetchUserWishlist() {
  try {
    const response = await fetch('/user/fetch-wishlist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.wishlist; // Assuming the response contains a wishlist property
    }
    console.log('failed')
    throw new Error('Failed to fetch wishlist');


  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    throw error;
  }
}

async function fetchCart() {
  try {
    const response = await fetch('/user/fetch-cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Cart');
    }

    const data = await response.json();
    return data.cart; // Assuming the response contains a cart property
  } catch (error) {
    console.error('Error fetching Cart:', error.message);
    throw error;
  }
}



// Add click event listener to each button
removeFromWishlistButtons.forEach(button => {

  button.addEventListener('click', async function (event) {
    event.preventDefault();

    // Extract product ID from data attribute 
    const productId = this.dataset.productId
    console.log(productId)
    const response = await fetchDeleteWishlist(productId);

    //ok
    if (response.status === 200) {
      //Decreace the length
      wishlistLength.innerHTML = --wishlistLengthValue
      window.location.href = '/user/wishlist'
    } else {
      const data = response.data
      console.log(data.message)
    }
  })
})

async function fetchDeleteWishlist(productId) {
  const response = await axios.get(`/user/remove-from-wishlist/${productId}`);
  return response
}


//Function for ADD TO CART

const addtoCartButtons = document.querySelectorAll('.qucik-add-button')

//looping
addtoCartButtons.forEach(button => {
  button.addEventListener('click', async function (event) {

    event.preventDefault()

    //get the quantity which was selected by user
    const quantitySelect = this.closest('.card').querySelector('select[name="quantity"]');
    const quantity = quantitySelect.value
    console.log(quantity)
    //Get the productID
    const productId = this.dataset.productId

    const response = await axios.get(`/user/add-to-cart/${productId}?quantity=${quantity}`)

    if (response.status === 200) {
      const data = response.data
      if (data.success) {
        cartLength.innerHTML = Number(cartLengthValue) + Number(quantity)
        const messageBox = this.closest('.card').querySelector('.message-box')

        if (messageBox) {

          messageBox.innerHTML = '<i class="ri-check-line"></i>' + ' ' + 'Product Added'
        }

        setTimeout(function () {
          messageBox.innerHTML = ''
        }, 3000);
      }
    }

  })
})




