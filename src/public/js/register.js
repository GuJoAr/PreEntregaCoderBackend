document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm') 

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault() 

            const formData = new FormData(registerForm) 
            const errorMessage = document.getElementById('errorMessage') 

            fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    if (response.ok) {
                        console.log("Registro de exitoso!")
                    } else {
                        errorMessage.textContent = 'Email ya esta en uso.' 
                        errorMessage.style.display = 'block' 
                    }
                })
                .catch(error => {
                    console.error('Error en el registro:', error) 
                }) 
        }) 
    }
}) 

