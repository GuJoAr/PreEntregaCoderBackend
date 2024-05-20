const token = localStorage.getItem('token')
const userId = localStorage.getItem('userId')

document.addEventListener("DOMContentLoaded", () => {
    const purchaseForm = document.getElementById("purchaseForm")
    const errorMessage = document.getElementById("errorMessage")
    const cartId = purchaseForm.getAttribute("data-cart-id")
    console.log("cartId:", cartId)
    purchaseForm.addEventListener("submit", async (event) => {
        event.preventDefault()
        const country = document.getElementById("country").value
        const state = document.getElementById("state").value
        const city = document.getElementById("city").value
        const street = document.getElementById("street").value
        const postal_code = document.getElementById("postal_code").value
        const phone = document.getElementById("phone").value
        const card_bank = document.getElementById("card_bank").value
        const security_number = document.getElementById("security_number").value
        try {
            const response = await fetch(`http://localhost:8080/api/carts/${cartId}/purchase`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ country, state, city, street, postal_code, phone, card_bank, security_number, userId }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || "Error al realizar la compra")
            }
            console.log('Compra Realizada Exitosamente')
            console.log(`Código de Ticket: ${data.ticket.code}`)
            console.log(`Fecha de Compra: ${new Date(data.ticket.purchase_datetime).toLocaleString()}`)
            console.log(`Monto Total: $${data.ticket.amount}`)
            console.log('Productos:')
            data.ticket.products.forEach(product => {
                console.log(`${product.product} - Cantidad: ${product.productQuantity} - Total: $${product.productTotal}`)
            })
            window.location.href = "http://localhost:8080/api/products/"
        } catch (error) {
            console.error('Error:', error.message)
        }
    })
})
