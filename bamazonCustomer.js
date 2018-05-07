// required variables
var Table = require('cli-table');
var mysql = require('mysql');
var inquirer = require('inquirer');

// connect to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
    start();
});

// begin customer interaction
function start() {

    inquirer.prompt([{

        type: "confirm",
        name: "confirm",
        message: "Welcome to Bamazon! Would you like to check out our products?",
        default: true

    }]).then(function(user) {
        if (user.confirm === true) {
            products();
        } else {
            console.log("Thanks for visiting!");
            return false
        }
    });
}

// display products
function products() {

    // create table to display products
    var table = new Table({
        head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
        colWidths: [10, 30, 30, 30, 30]
    });

    pullProducts();

    //pull products from database
    function pullProducts() {

        connection.query("SELECT * FROM products", function(err, res) {
            for (var i = 0; i < res.length; i++) {

                var id = res[i].id,
                    product = res[i].product,
                    department = res[i].department,
                    price = res[i].price,
                    stock = res[i].stock;

              table.push(
                  [id, product, department, price, stock]
            );
          }
            console.log("");
            console.log("------------------------------------------ Our Products ------------------------------------------");
            console.log("");
            console.log(table.toString());
            console.log("");
            buyItem();
        });
    }
}

// ask customer if they would like to purchase a product
function buyItem() {

    inquirer.prompt([{

        type: "confirm",
        name: "continue",
        message: "Would you like to buy an item?",
        default: true

    }]).then(function(user) {
        if (user.continue === true) {
            itemSelect();
        } else {
            console.log("Thanks for stopping in!");
        }
    });
}

// ask customer which product they want to purchase and in what quantity
function itemSelect() {

    inquirer.prompt([{

            type: "input",
            name: "inputId",
            message: "Please enter the ID number of the product.",
        },
        {
            type: "input",
            name: "inputQuantity",
            message: "How many would you like?",

        }
    ]).then(function(userPurchase) {

        // check database to see if product is in stock
        connection.query("SELECT * FROM products WHERE id=?", userPurchase.inputId, function(err, res) {
            for (var i = 0; i < res.length; i++) {

                if (userPurchase.inputQuantity > res[i].stock) {

                    console.log("------------------------------------------");
                    console.log("Sorry, we are currently out of stock of this item.");
                    console.log("------------------------------------------");
                    start();

                } else {
                    console.log("------------------------------------------");
                    console.log("Purchase added to cart.");
                    console.log("------------------------------------------");
                    console.log("Your cart:");
                    console.log("------------------------------------------");
                    console.log("Item: " + res[i].product);
                    console.log("Department: " + res[i].department);
                    console.log("Price: " + res[i].price);
                    console.log("Quantity: " + userPurchase.inputQuantity);
                    console.log("------------------------------------------");
                    console.log("Total: " + res[i].price * userPurchase.inputQuantity);
                    console.log("------------------------------------------");

                    var stockUpdate = (res[i].stock - userPurchase.inputQuantity);
                    var purchase = (userPurchase.inputId);
                    confirmPurchase(stockUpdate, purchase);
                }
            }
        });
    });
}

// have customer confirm their purchase
function confirmPurchase(stockUpdate, purchase) {

    inquirer.prompt([{

        type: "confirm",
        name: "confirmPurchase",
        message: "Is your cart correct?",
        default: true

    }]).then(function(confirm) {
        if (confirm.confirmPurchase === true) {

            // update database to reflect new stock
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: stockUpdate
            }, {
                item_id: purchase
            }], function(err, res) {});

            console.log("------------------------------------------");
            console.log("Purchase succesful.");
            console.log("------------------------------------------");
            start();
        } else {
            console.log("------------------------------------------");
            console.log("Transaction cancelled.");
            console.log("------------------------------------------");
            start();
        }
    });
}