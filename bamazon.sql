CREATE database bamazonDB;
USE bamazonDB;
CREATE TABLE products (
  id INT(10) AUTO_INCREMENT NOT NULL,
  product VARCHAR(200) NOT NULL,
  department VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT (10) NOT NULL,
  PRIMARY KEY (id)
)

Select * from products;

INSERT INTO products (product, department, price, stock)
VALUES ("iPhone 8", "Electronics", 800.00, 50),
("Digital Camera", "Electronics", 1000.00, 30),
("Flat Screen TV", "Electronics", 2000.00, 50),
("Hockey Puck", "Sports", 10.98, 10),
("Baseball Bat", "Sports", 45.00, 5),
("Soccer Ball", "Sports", 25.00, 70),
("Camping Stove", "Outdoors", 300.00, 10),
("Tent", "Outdoors", 190.00, 10),
("Sleeping Bag", "Outdoors", 70.00, 65);