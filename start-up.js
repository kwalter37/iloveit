const http = require('http');

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  //res.setHeader('Content-Type', 'text/plain');
  //res.end('Hello Ku!\n');
  var products = [
  	{brand: "Ragu", name: "Chunky Tomato and Onion", rating: 9},
  	{brand: "X", name: "Mushroom", rating: 1},
  	{brand: "Y", name: "Tomato and Basil", rating: 2}
  ];
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(products));
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});