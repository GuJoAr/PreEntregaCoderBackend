
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm')
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault()
            const formData = new FormData(loginForm)
            const obj = {}
            formData.forEach((val, key) => obj[key]=val)
            const errorMessage = document.getElementById('errorMessage')
            fetch('http://localhost:8080/api/sessions/login', {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*"
                }
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    errorMessage.textContent = 'Algunos de los datos es incorrectos. Por favor, inténtalo de nuevo.'
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
                console.log("Token: ", token)
                console.log("userId: ", userId)
                console.log("user rol: ", userRole)
                if (userRole === 'admin') {
                    window.location.href = `http://localhost:8080/api/sessions/dashboard/${userId}`
                }
                else {
                    window.location.href = "http://localhost:8080/api/products"
                }
            })
            .catch(error => {
                console.error('Error en el inicio de sesión:', error)
            })
        })
    }
})
// login de GitHub
document.addEventListener('DOMContentLoaded', function() {
    const githubButton = document.getElementById('github')
    if(githubButton) {
        githubButton.addEventListener("click", function(event) {
            event.preventDefault()
            const errorMessage = document.getElementById('errorMessage')
            fetch('http://localhost:8080/api/sessions/github', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' 
                }
            }) 
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    errorMessage.textContent = 'GitHub invalido.'
                    errorMessage.style.display = 'block'
                    throw new Error('Credenciales incorrectas')
                }
            })
            .then(data => {
                const token = localStorage.setItem('token', data.access_token)
                console.log("Token:", token)
                window.location.href = "http://localhost:8080/api/products/"
            })
            .catch(error => {
                console.error('Error en el inicio de sesión con GitHub:', error)
            })
        })
    }
})
