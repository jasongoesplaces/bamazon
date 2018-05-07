// required variables
var Table = require('cli-table');
var inquirer = require('inquirer');
var mysql = require('mysql');

// connect database
var connection = mysql.createConnection({
	host: 'localhost',
	port: 8889,
	user: 'root',
	password: 'root',
	database: 'bamazonDB'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
    managerMode();
});

// prompts manager to choose a task to complete
function managerMode() {

	inquirer.prompt([
		{
			type: 'list',
			name: 'option',
			message: 'Select a task:',
			choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
			filter: function (val) {
				if (val === 'View Products for Sale') {
					return 'sale';
				} else if (val === 'View Low Inventory') {
					return 'lowInventory';
				} else if (val === 'Add to Inventory') {
					return 'addInventory';
				} else if (val === 'Add New Product') {
					return 'newProduct';
				} 
			}
		}
	]).then(function(input) {

		// calls function based on user selection
		if (input.option ==='sale') {
			inventory();
		} else if (input.option === 'lowInventory') {
			lowInventory();
		} else if (input.option === 'addInventory') {
			addInventory();
		} else if (input.option === 'newProduct') {
			createNewProduct();
		} 
	})
}

// display products
function inventory() {

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
            console.log("------------------------------------------ Products & Inventory ------------------------------------------");
            console.log("");
            console.log(table.toString());
            console.log("");
            newTask();
        });
    }
}

// shows products with less than 50 units in stock
function lowInventory() {
     // create table to display products
     var table = new Table({
        head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
        colWidths: [10, 30, 30, 30, 30]
    });

    lowInventoryList();

    //pull products from database
    function lowInventoryList() {

        connection.query('SELECT * FROM products WHERE stock_quantity < 50', function(err, res) {
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
            console.log("------------------------------------------ Low Inventory Products ------------------------------------------");
            console.log("");
            console.log(table.toString());
            console.log("");
            newTask();
        });
    }
}

// check if user wishes to complete another task
function newTask() {

    inquirer.prompt([{

        type: "confirm",
        name: "continue",
        message: "Would you like to complete another task?",
        default: true

    }]).then(function(user) {
        if (user.continue === true) {
            managerMode();
        } else {
            console.log("Logging Out...");
            connection.end()
        }
    });
}