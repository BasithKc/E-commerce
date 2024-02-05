
const phoneInputField = document.getElementById('numb');
if(phoneInputField){

    var phoneInput = window.intlTelInput(phoneInputField, {
        prefferredCountries: ['in'],
        initialCountry: 'in',
        utilsScript:
            'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.13/build/js/utils.js',
    });
}


        const inputs = document.querySelectorAll("input[type='text']"),
            verifyButton = document.getElementById("verify-button");
        console.log(inputs);

        // iterate over all inputs
        inputs.forEach((input, index1) => {
            input.addEventListener("keyup", (e) => {
                const currentInput = input,
                    nextInput = input.nextElementSibling,
                    prevInput = input.previousElementSibling

                if (currentInput.value.length > 1) {
                    currentInput.value = "";
                    return;
                }

                if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
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
                    console.log('hai');
                    verifyButton.classList.add("active");
                    console.log(verifyButton.classList);
                    return;
                }
                verifyButton.classList.remove('active')
            });
        });

        //focus the first input which index is 0 on window load
        if(inputs.length > 0){
            window.addEventListener("load", () => inputs[0].focus());
        }

        async function sendOtp(event) {
            event.preventDefault()

            const channel = 'sms'

            const to = phoneInput.getNumber();
            const data = new URLSearchParams()
            console.log(to);

            data.append('to', to)
            data.append('channel', channel)

            const response = await fetch('/forgotten-send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded",
                },
                body: data
            })
            const json = await response.json();
            if (json.success) {
                const lastThreeDigit = to.slice(-3);
                const maskedNumber = 'xxxxxxx' + lastThreeDigit;
                const message = `Otp number has been sent to ${maskedNumber}`;

                window.location.href =
                    '/forgotten-password?message=' + message;
            } else {
                const error = json.message
                window.location.href = '/forgotten-password?error=' + error
                console.log(error);
            }
        }

        async function verifyOTP (){
            event.preventDefault()

            console.log('start');
            const digit1 = document.getElementById('digit1').value;
            const digit2 = document.getElementById('digit2').value;
            const digit3 = document.getElementById('digit3').value;
            const digit4 = document.getElementById('digit4').value;
            const digit5 = document.getElementById('digit5').value;
            const digit6 = document.getElementById('digit6').value;

            const otp = `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`;
            

            const response =  await fetch('/forgotten-verify-otp', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({otp})
               })
               const json = await response.json();
            if(json.success){
                window.location.replace("/reset-password");
            }else {
                const error = json.message
                window.location.href = '/forgotten-password?message=hai&error='+error 
            }
        }
        const otpSentForm = document.getElementById('otp-form')
        if(otpSentForm){
            otpSentForm.addEventListener('submit', (event) => sendOtp(event));
        }

            
        // const verifyForm = document.getElementById('verify-form')
        if(verifyButton){    
            console.log('hello');
            console.log(verifyOTP);
       
            verifyButton.addEventListener('click', (event) => verifyOTP(event))
        }