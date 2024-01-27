



const phoneInputField = document.getElementById('numb')
    const phoneInput = window.intlTelInput(phoneInputField, {
        prefferredCountries:[ 'in'],
        initialCountry: 'in',
        utilsScript:
            "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.13/build/js/utils.js"
    })

			async function sendOtp(event) {

                event.preventDefault()

                const lname = document.getElementById('lname').value
                const fname =document.getElementById('fname').value
                const email = document.getElementById('email').value
                const password = document.getElementById('password').value

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
            


                 const response = await fetch('/send-otp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: data,
                    })
                    const json =await response.json()
                    if(json.success){
                        window.location.href='/send-otp'
                    }else {
                        console.log('error');
                        window.location.href='/signup'
                    }
				
			} 

			document.getElementById('send-code').addEventListener('submit', (event) => sendOtp(event))

            const password = document.getElementById('password')
            const confirmPassword = document.getElementById('confirmPassword')
            const showMessage = document.getElementById('show-error')
            const showError = document.getElementById('show-confirm')

            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[a-zA-Z\d!@#$%^&*()_+]{8,}$/

            password.addEventListener('input', (event) => {
                if(!passRegex.test(event.target.value)){
                    showMessage.innerHTML = 'Password should contain atleast one lowercase one uppercase, one special charecter and length of 8 '
                }else {
                    showMessage.innerHTML = ''
                }
            })

            confirmPassword.addEventListener('input', (event) => {
                if(password.value != event.target.value){
                    showError.innerHTML = 'Password do not match'
                    document.getElementById('send_otp_button').disabled = true;
                }
                else if(password.value === event.target.value){
                    showError.innerHTML = ''
                    document.getElementById('send_otp_button').disabled = false;
                }
            })

          
