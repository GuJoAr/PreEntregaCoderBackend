const socket = io.connect('http://localhost:8080')

const token = localStorage.getItem("token")
const userId = localStorage.getItem("userId")
const userRole = localStorage.getItem("userRole")

if (userId && userRole === "admin") {
    document.getElementById('userId').value = userId
}
console.log("Token:", token)

function handleAddToCart(event) {
    if (!event.target.classList.contains('cart-btn')) {
        return
    }
    if (!token) {
        console.log("Usuario no logueado o registrado")
        window.location.href = "http://localhost:8080/api/sessions/login"
    }
    if (userRole === "admin") {
        alert("Usted es el administrador")
        window.location.href = "http://localhost:8080/api/sessions/login"
    }

    const productId = event.target.getAttribute('data-product-id')
    fetch("http://localhost:8080/api/carts/", {
        method: 'POST',
        headers: {
            "authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al agregar el producto al carrito')
            }
            return response.json()
        })
        .then(data => {
            console.log('Producto agregado al carrito:', data)
        })
        .catch(error => {
            console.error('Error al agregar el producto al carrito:', error)
        })
}

if (userRole === "user") {
    const goToCartBtn = document.getElementById('goToCartBtn')
    const cartForm = document.getElementById('cartForm')
    goToCartBtn.addEventListener('click', () => {
        const selectedCartId = document.getElementById('cart').value
        const cartUrl = `http://localhost:8080/api/carts/${selectedCartId}`
        const token = localStorage.getItem('token')
        if (!token) {
            console.log("Token no encontrado. Usuario no autenticado.")
            return
        }
        fetch(cartUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener el carrito')
                }
                window.location.href = cartUrl
            })
            .catch(error => {
                console.error('Error al obtener el carrito:', error)
            })
    })
}
document.getElementById('productList').addEventListener('click', handleAddToCart)

async function renderProducts(products) {
    if (!products || !products.image) {
        console.error('No se pudo renderizar el producto:', products)
        return
    }
    const productList = document.getElementById('productList')
    const productElement = document.createElement('div')
    productElement.classList.add('col-md-4', 'mb-4')
    productElement.innerHTML = `
        <div class="card">
            <img src="/img/${products.image}" class="card-img-top img-fluid" alt="${products.title}"
                style="max-height: 400px aspect-ratio: 3/2 object-fit: contain">
            <div class="card-body">
                <h5 class="card-title">${products.title}</h5>
                <p class="card-text">${products.brand}</p>
                <p class="card-text">${products.description}</p>
                <p class="card-text">Precio: $${products.price}</p>
                <p class="card-text">Stock: ${products.stock}</p>
                <p class="card-text">Categoría: ${products.category}</p>
                <a href="http://localhost:8080/api/products/{{this._id}}" class="btn btn-primary">Ver detalles</a>
                <button class="btn btn-danger delete-btn" data-product-id="{{this._id}}">Eliminar Producto</button>
                <button class="btn btn-success cart-btn" data-product-id="{{this._id}}">Agregar al carrito</button> 
            </div>
        </div>`
    productList.appendChild(productElement)
}
socket.on('addProduct', (addProduct) => {
    renderProducts(addProduct)
})

if (userRole === "admin") {
    document.getElementById('addProductForm').addEventListener('submit', async (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        try {
            const response = await fetch('http://localhost:8080/api/products/', {
                method: 'POST',
                body: formData,
                headers: {
                    "authorization": `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                throw new Error('Error al agregar el producto')
            }
            const data = await response.json()
            socket.emit("addProduct", data.Product)
            console.log('Producto agregado:', data.Product)
            event.target.reset()
        } catch (error) {
            console.error('Error al agregar el producto:', error)
        }
    })

    function handleDeleteProduct(event) {
        if (!event.target.classList.contains('delete-btn')) {
            return
        }
        const productId = event.target.getAttribute('data-product-id')
        fetch(`http://localhost:8080/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar el producto')
            }
            return response.json()
        })
        .then(data => {
            console.log('Producto eliminado:', data)
            socket.emit('deleteProduct', productId, userId)
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error)
        })
    }
    document.getElementById('productList').addEventListener('click', handleDeleteProduct)

    socket.on('deleteProduct', (deletedProductId) => {
        const productElement = document.querySelector(`[data-product-id="${deletedProductId}"]`)
        if (productElement) {
            productElement.parentElement.parentElement.remove()
            console.log(`Producto con ID ${deletedProductId} eliminado`)
        } else {
            console.log(`No se encontró el producto con ID ${deletedProductId}`)
        }
    })
}
