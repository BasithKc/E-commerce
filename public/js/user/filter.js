//filter for color
const colorFilters = document.querySelectorAll('input[class=form-check-color-input]')
colorFilters.forEach((filter) => {
  filter.addEventListener('click', function (event) {
    let value = event.target.value;

    window.location.href = `/user/category?category=${category}&cf=${value}`;
  })
})

//filter for sizes
const sizeFilters = document.querySelectorAll('input[class=form-check-bg-input]')
sizeFilters.forEach((filter) => {
  filter.addEventListener('click', (event) => {
    let value = event.target.value

    window.location.href = `/user/category?category=${category}&sf=${value}`
  })
})