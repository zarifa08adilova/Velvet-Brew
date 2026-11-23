let cart = [];
let total = 0;

function addToCart(item, price) {
    cart.push(item);
    total += price;

    document.getElementById("cart").innerHTML = cart.join("<br>");
    document.getElementById("total").innerText = "Total: $" + total.toFixed(2);
}

const nameInput = document.getElementById("nameInput");
const sendBtn = document.getElementById("sendBtn");

nameInput.addEventListener("input", function () {
    const length = nameInput.value.length;

    if (length === 0) {
        sendBtn.disabled = true;
        sendBtn.classList.remove("valid", "invalid");
    }
    else if (length >= 10 && length <= 20) {
        sendBtn.classList.remove("invalid");
        sendBtn.classList.add("valid");
        sendBtn.disabled = false;
    }
    else {
        sendBtn.classList.remove("valid");
        sendBtn.classList.add("invalid");
        sendBtn.disabled = false;
    }
});

function submitReview(event) {
    event.preventDefault();

    const name = document.getElementById("review-name").value;
    const text = document.getElementById("review-text").value;
    const rating = document.getElementById("review-rating").value;

    const reviewsSection = document.getElementById("reviews");

    const newReview = document.createElement("p");
    newReview.innerHTML = `"${text}" - ${name} ` + "⭐".repeat(rating);

    reviewsSection.appendChild(newReview);

    event.target.reset();
}

const form = document.getElementById('orderForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const coffee = document.getElementById('coffee').value;
    const customer = document.getElementById('customer').value;
    const quantity = document.getElementById('quantity').value;

    const response = await fetch('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            coffee: coffee,
            customer: customer,
            quantity: quantity
        })
    });

    const data = await response.json();
    console.log(data);

    alert("Order is sent ☕");
document.addEventListener('DOMContentLoaded', loadOrders);
});

async function loadOrders() {
    const response = await fetch('http://localhost:3000/api/v1/orders');
    const data = await response.json();

    const tbody = document.getElementById('ordersBody');
    tbody.innerHTML = '';

    data.data.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.coffee}</td>
            <td>${order.customer}</td>
            <td>${order.quantity}</td>
            <td>
                <button onclick="editOrder(${order.id}, '${order.coffee}', '${order.customer}', ${order.quantity})">Edit</button>
                <button onclick="deleteOrder(${order.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function deleteOrder(id) {
    if (!confirm("Are you sure you want to delete this order?")) return;

    await fetch(`http://localhost:3000/api/v1/orders/${id}`, {
        method: 'DELETE'
    });

    loadOrders();
}

function editOrder(id, coffee, customer, quantity) {
    const newCoffee = prompt("Coffee name:", coffee);
    const newCustomer = prompt("Customer name:", customer);
    const newQuantity = prompt("Quantity:", quantity);

    if (!newCoffee || !newCustomer || !newQuantity) return;

    fetch(`http://localhost:3000/api/v1/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            coffee: newCoffee,
            customer: newCustomer,
            quantity: parseInt(newQuantity)
        })
    }).then(() => loadOrders());
}

loadOrders();