//cdn of country code
const phoneInputField = document.getElementById('numb');
const phoneInput = window.intlTelInput(phoneInputField, {
  prefferredCountries: ['in'],
  initialCountry: 'in',
  utilsScript:
    'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.13/build/js/utils.js',
});

//function for gettting the value of selected channel
function selectedChannel() {
  const checked = "input[name='channel']:checked";
  return document.querySelector(checked).value; //return the value
}

//input div of phone number
const phoneInputDiv = document.querySelector('.phone-input');
//input div of email
const emailInputDiv = document.querySelector('.email-input');

//function for showing email input field
function showEmailInput() {
  phoneInputDiv.style.display = 'none';
  emailInputDiv.style.display = 'block';
}

//function for showing phone number input field
function showPhoneNumberInput() {
  phoneInputDiv.style.display = 'block';
  emailInputDiv.style.display = 'none';
}

//function for sending otp
async function sendOtp(event) {
  event.preventDefault();

  //get the details of users
  const lname = document.getElementById('lname').value;
  const fname = document.getElementById('fname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  //selected channel by user
  const channel = selectedChannel();
  const to =
    channel === 'email'
      ? document.getElementById('email').value
      : phoneInput.getNumber();

  const data = new URLSearchParams();

  data.append('to', to);
  data.append('channel', channel);
  data.append('lname', lname);
  data.append('fname', fname);
  data.append('email', email);
  data.append('password', password);

  const response = await fetch('/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  });
  const json = await response.json();
  if (json.success) {

    // Check if 'to' is a valid email address
    if (isValidEmail(to)) {
      var message = `Otp number has been sent to ${to}`;
    } else {
      const lastThreeDigit = to.slice(-3);
      const maskedNumber = 'xxxxxxx' + lastThreeDigit;
      var message = `Otp number has been sent to ${maskedNumber}`;
    }

    window.location.href = '/send-otp?message=' + encodeURIComponent(message);
  } else {
    console.log('error');
    const errorMessage = json.message || '';
    window.location.href = '/signup?error=' + encodeURIComponent(errorMessage);
  }
}

document
  .getElementById('send-code')
  .addEventListener('submit', (event) => sendOtp(event));

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const showMessage = document.getElementById('show-error');
const showError = document.getElementById('show-confirm');

const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[a-zA-Z\d!@#$%^&*()_+]{8,}$/;

password.addEventListener('input', (event) => {
  if (!passRegex.test(event.target.value)) {
    showMessage.innerHTML =
      'Password should contain atleast one lowercase one uppercase, one special charecter and length of 8 ';
  } else {
    showMessage.innerHTML = '';
  }
});

confirmPassword.addEventListener('input', (event) => {
  if (password.value != event.target.value) {
    showError.innerHTML = 'Password do not match';
    document.getElementById('send_otp_button').disabled = true;
  } else if (password.value === event.target.value) {
    showError.innerHTML = '';
    document.getElementById('send_otp_button').disabled = false;
    document.getElementById('send_otp_button').style.pointerEvents = 'auto';
  }
});

window.onclick = function (event) {
  switch (event.target.id) {
    case 'channel-email':
      showEmailInput();
      break;
    case 'channel-sms':
      showPhoneNumberInput();
      break;
    case 'channel-whatsapp':
      showPhoneNumberInput();
      break;
    case 'channel-call':
      showPhoneNumberInput();
      break;
  }
};


function isValidEmail(email) {
  // Regular expression to validate email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}