

const confirmPassword = document.getElementById('confirmPassword').value

const phoneInputField = document.getElementById('numb')
    const phoneInput = window.intlTelInput(phoneInputField, {
        prefferredCountries:[ 'in'],
        initialCountry: 'in',
        utilsScript:
            "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.13/build/js/utils.js"
    })

			async function sendOtp(event) {

                const lname = document.getElementById('lname').value
                const fname =document.getElementById('fname').value
                const email = document.getElementById('email').value
                const password = document.getElementById('password').value
                const confirmPassword = document.getElementById('confirmPassword').value

                console.log(phoneInput);
				event.preventDefault()

                console.log(lname);
				const to=phoneInput.getNumber()
				const channel = 'sms'


				console.log(to);
				const data = new URLSearchParams()

				data.append('to', to)
				data.append('channel', channel)
                data.append('lname',lname)
                data.append('fname', fname)
                data.append('email', email)
                data.append('password', password)
                


                  fetch('/send-otp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: data,
                    }).then((response) => {
                        window.location.href = '/send-otp'
                    })
            
				
			} 

			document.getElementById('send-code').addEventListener('click', (event) => sendOtp(event))