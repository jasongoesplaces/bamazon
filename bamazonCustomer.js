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

// display products
function start() {

    // create table to display products
    var table = new Table({
        head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
        colWidths: [10, 30, 30, 30, 30]
    });

    products();

    //pull products from database
    function products() {

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
            console.log("--------------------------------------- Welcome to Bamazon ---------------------------------------");
            console.log("------------------------------------------ Our Products ------------------------------------------");
            console.log("");
            console.log(table.toString());
            console.log("");
            itemSelect();
        });
    }
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
                stock: stockUpdate
            }, {
                id: purchase
            }], function(err, res) {});

            console.log("------------------------------------------");
            console.log("Purchase succesful.");
            console.log("------------------------------------------");
            continueShopping();
        } else {
            console.log("------------------------------------------");
            console.log("Transaction cancelled.");
            console.log("------------------------------------------");
            continueShopping();
        }
    });
}

// ask customer if they wish to continue shopping
function continueShopping() {

    inquirer.prompt([{

        type: "confirm",
        name: "continue",
        message: "Would you like to continue shopping?",
        default: true

    }]).then(function(user) {
        if (user.continue === true) {
            start();
        } else {
            console.log("Thanks for visiting!");
            connection.end()
        }
    });
}