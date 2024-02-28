
const inputs = document.querySelectorAll("input"),
  verifyButton = document.getElementById("verify-button");

// iterate over all inputs
inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {

    const currentInput = input,
      nextInput = input.nextElementSibling,
      prevInput = input.previousElementSibling;

    // if the value has more than one character then clear it
    if (currentInput.value.length > 1) {
      currentInput.value = "";
      return;
    }
    // if the next input is disabled and the current value is not empty 
    //  enable the next input and focus on it
    if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
      console.log('hello');
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }

    // if the backspace key is pressed
    if (e.key === "Backspace") {
      // iterate over all inputs again
      inputs.forEach((input, index2) => {
        // if the index1 of the current input is less than or equal to the index2 of the input in the outer loop
        // and the previous element exists, set the disabled attribute on the input and focus on the previous element
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled", true);
          input.value = "";
          prevInput.focus();
        }
      });
    }
    //if the fourth input( which index number is 3) is not empty and has not disable attribute then
    //add active class if not then remove the active class.
    if (!inputs[5].disabled && inputs[5].value !== "") {
      verifyButton.classList.add("active");
      return;
    }
    verifyButton.classList.remove('active')
  });
});

//focus the first input which index is 0 on window load
window.addEventListener("load", () => inputs[0].focus());

document.addEventListener('DOMContentLoaded', function () {
  // Disable the resend button initially
  document.getElementById('resend_otp_button').disabled = true;

  document.getElementById('resend_otp_button').style.pointerEvents = 'none'
  // Start countdown timer
  startCountdown();
});

var timer;
var countdown = 30; // Countdown duration in seconds
var resendButtonEnabled = false;


function startCountdown() {
  timer = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  var countdownDisplay = document.getElementById('countdown_timer');

  if (countdown > 0) {
    countdown--;
    var minutes = Math.floor(countdown / 60);
    var seconds = countdown % 60;
    countdownDisplay.innerHTML = 'Resend OTP in: ' + minutes + ':' + seconds + 's';
  } else {
    clearInterval(timer);
    countdownDisplay.innerHTML = '';
    document.getElementById('resend_otp_button').style.pointerEvents = 'auto'
    if (!resendButtonEnabled) {
      enableResendButton();
    }
  }
}

function enableResendButton() {
  document.getElementById('resend_otp_button').disabled = false;
  resendButtonEnabled = true;
}

function resendOTP() {
  document.getElementById('resend_otp_button').disabled = true;

  // Start the countdown timer again
  countdown = 30;
  startCountdown();
  resendButtonEnabled = false;
}



const container = document.querySelector('.container')
const container2 = document.querySelector('.container2')

async function verifyOTP(event) {
  event.preventDefault();

  const digit1 = document.getElementById('digit1').value;
  const digit2 = document.getElementById('digit2').value;
  const digit3 = document.getElementById('digit3').value;
  const digit4 = document.getElementById('digit4').value;
  const digit5 = document.getElementById('digit5').value;
  const digit6 = document.getElementById('digit6').value;


  const otp = `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`;

  const response = await fetch('/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ otp })
  })


  const json = await response.json()
  if (json.success) {
    // Display SweetAlert notification without an OK button
    Swal.fire({
      title: 'Verification Successful!',
      text: 'You have successfully verified your account.',
      icon: 'success',
      showConfirmButton: false
    });

    // Redirect to login page after 5 seconds
    setTimeout(() => {
      window.location.href = '/'; // Redirect to login page
    }, 5000); // 5000 milliseconds = 5 seconds

  } else {
    document.getElementById('error').innerHTML = 'Invalid OTP'
  }



}


document.getElementById('otpForm').addEventListener('submit', (event) => verifyOTP(event))