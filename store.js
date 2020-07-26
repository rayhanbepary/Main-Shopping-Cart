//variables
 const cartBtn       = document.querySelector ('.cart-btn');
 const closeCartBtn  = document.querySelector ('.close-cart');
 const clearCartBtn  = document.querySelector ('.clear-cart');
 const cartDOM       = document.querySelector ('.cart');
 const cartOverlay   = document.querySelector ('.cart-overlay');
 const cartItems     = document.querySelector ('.cart-items');
 const cartTotal     = document.querySelector ('.cart-total');
 const cartContent   = document.querySelector ('.cart-content');
 const productsDOM   = document.querySelector ('.products-center');
 

 //cart
let cart = [];

//buttons
let buttonsDOM = [];

//getting the products
class products {
    async getProducts(){
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let product =  data.items;
            product = product.map(item => {
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image};
            })
            return product;
        } catch (error) {
            console.log(error);
        }
    }
}

//display products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            
            <!---single product-->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <ion-icon name="cart"></ion-icon>add to cart         
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!---single product end-->

        `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        const buttons = [ ...document.querySelectorAll ('.bag-btn') ];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
               button.innerText = 'In Cart';
               button.disabled = true;
            }
                button.addEventListener('click', event => {
                    event.target.innerText = 'In Cart';
                    event.target.disabled = true;
                    //get product from products
                        let cartItem = { ...storage.getProduct(id), amount: 1 };
                    //add product to the cart
                        cart = [ ...cart, cartItem];
                    //save cart in local storage
                    storage.saveCart(cart);
                    //set cart values
                    this.setCartValues (cart);
                    //display cart item
                    this.addCartItem(cartItem);
                    //show the cart
                    this.showCart();
                })
            
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        
            <img src=${item.image} alt="">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <ion-icon class="increase" name="arrow-dropup" data-id=${item.id}></ion-icon>
                <p class="item-amount">${item.amount}</p>
                <ion-icon class="decrease" name="arrow-dropdown" data-id=${item.id}></ion-icon>
            </div> `;
        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP(){
        cart = storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item))
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //clear cart
        clearCartBtn.addEventListener('click', () =>{
            this.clearCart();
        });

        //cart functionality
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }else if(event.target.classList.contains('increase')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(event.target.classList.contains('decrease')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }              
            }
        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML =`<ion-icon name="cart"></ion-icon>add to cart`;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class storage{
    static saveProducts (products){
        localStorage.setItem('Product',JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('Product'));
        return products.find( product => product.id === id )
    }
    static saveCart (cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

//DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const proDucts = new products();

    //setup app
    ui.setupAPP();

    //getting all products
    proDucts.getProducts().then(products => {
        ui.displayProducts (products);
        storage.saveProducts (products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
})
