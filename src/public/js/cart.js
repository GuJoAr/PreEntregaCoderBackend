const socket = io.connect('http://localhost:8080')
const token = localStorage.getItem("token")
const userId = localStorage.getItem("userId")

async function deleteProductFromCart(cid, pid) {
    console.log("id del carrito:", cid)
    console.log("id del producto:", pid)
    try {
        const response = await fetch(`http://localhost:8080/api/carts/${cid}/products/${pid}`, {
            method: 'DELETE',
            headers: {
                "authorization": `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if (response.ok) {
            console.log(`Producto con ID ${pid} eliminado del carrito ${cid}`)
        } else {
            console.error(`Error al eliminar el producto con el ID ${pid} del carrito`)
        }
    } catch (error) {
        console.error('Error de red:', error)
    }
}

function handleDeleteProductCart(event) {
    if (!event.target.classList.contains('delete-btn')) {
        return
    }
    const productId = event.target.getAttribute('data-product-id')
    socket.emit('deleteProductCart', productId)
}
document.getElementById('cartList').addEventListener('click', handleDeleteProductCart)

socket.on('deleteProductCart', (deleteProductCartId) => {
    const cartElement = document.querySelector(`[data-product-id="${deleteProductCartId}"]`)
    if (cartElement) {
        cartElement.parentElement.parentElement.remove()
        console.log(`Producto con el ID ${deleteProductCartId} eliminado`)
    } else {
        console.log(`No se encontró el producto con su ID ${deleteProductCartId}`)
    }
})