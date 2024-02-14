"use strict"
const wishlistButtons = document.querySelectorAll('.wishlist-button');
let wishlistLengthValue = 0;

// Loop through each wishlist button
wishlistButtons.forEach(button => {
  // Add click event listener to each button
  button.addEventListener('click', async function (event) {
    event.preventDefault()

    // Extract product ID from data attribute 
    const productId = this.dataset.productId

    try {
      //Heart icon on each button
      const heartIcon = this.querySelector('.heart-icon');

      //Wishlist length to display on the wishlist icon
      const wishlistLength = document.querySelector('.wishlist-length')

      //Checking if the product already added to wishlist 
      if (heartIcon.classList.contains('ri-heart-fill')) {
        const response = await axios.get(`/user/remove-from-wishlist/${productId}`);
        if (response.status === 200) {
          wishlistLength.innerHTML = --wishlistLengthValue
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

    const wishlistLength = document.querySelector('.wishlist-length')

    //this variable is used for accessing everywhere in this script
    wishlistLengthValue = wishlist.length

    wishlistLength.innerHTML = wishlistLengthValue

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

    if (!response.ok) {
      console.log('failed')
      throw new Error('Failed to fetch wishlist');
    }

    const data = await response.json();
    return data.wishlist; // Assuming the response contains a wishlist property
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    throw error;
  }
}