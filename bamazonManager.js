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
			newProduct();
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

        connection.query('SELECT * FROM products WHERE stock < 50', function(err, res) {
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

// allows user to add inventory
function addInventory() {

	// user selects product and chooses quantity to add to stock
	inquirer.prompt([
		{
			type: 'input',
			name: 'id',
			message: 'Please enter the Item ID for stock_count update.',
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many would you like to add?',
			filter: Number
		}
	]).then(function(input) {

		var product = input.id;
		var newStock = input.quantity;

        // checks database for product
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query('SELECT * FROM products WHERE ?', {id: product}, function(err, data) {
			if (err) throw err;

			if (data.length === 0) {
				console.log('Invalid ID. Please try again.');
				addInventory();

			} else {
				var productDetails = data[0];

				console.log('Adding to inventory');

				var query = 'UPDATE products SET stock = ' + (productDetails.stock + newStock) + ' WHERE id = ' + product;

				// updates inventory in database
				connection.query(query, function(err, data) {
					if (err) throw err;

					console.log('Stock count has been updated to ' + (productDetails.stock + newStock) + '.');
					console.log("------------------------------------------");

				newTask()
				})
			}
		})
	})
}

// allows user to add new products to the database
function newProduct() {

	inquirer.prompt([
		{
			type: 'input',
			name: 'product',
			message: 'Enter new product name.',
		},
		{
			type: 'input',
			name: 'department',
			message: 'Enter department for new product.',
		},
		{
			type: 'input',
			name: 'price',
			message: 'Enter Price.',
		},
		{
			type: 'input',
			name: 'stock',
			message: 'Enter current stock.',
        }
        
	]).then(function(input) {

		// new product is added to the database
		connection.query('INSERT INTO products SET ?', input, function (error, results, fields) {
			if (error) throw error;

            console.log('The new product has been added')

        newTask()
		});
	})
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