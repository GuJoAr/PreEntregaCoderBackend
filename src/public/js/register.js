
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm')
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault()
            const formData = new FormData(registerForm)
            const obj = {}
            formData.forEach((val, key) => obj[key]=val)
            const errorMessage = document.getElementById('errorMessage')
            fetch('http://localhost:8080/api/sessions/register', {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-Type': 'application/json' 
                }
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    errorMessage.textContent = 'Este email ya es un usuario.'
                    errorMessage.style.display = 'block'
                    throw new Error('Credenciales incorrectas')
                }
            })
            .then(data => {
                const token = data.access_token
                const userId = data.userId
                const userRole = data.userRole
                localStorage.setItem('token', token)
                localStorage.setItem('userId', userId)
                localStorage.setItem('userRole', userRole)
                console.log("Token:", token)
                console.log("User Id:", userId)
                console.log("user rol:", userRole)
                window.location.href = "http://localhost:8080/api/products/"
            })
            .catch(error => {
                console.error('Error en el inicio de sesión:', error)
            })
        })
    }
})
