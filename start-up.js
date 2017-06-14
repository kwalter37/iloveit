var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var cors = require('cors');
var ObjectID = mongodb.ObjectID;

var utils = require("./utils.js");

var PRODUCTS_COLLECTION = 'products';
var PRODUCTS_FILTERS = {category: 'string', rating: 'int'};

var app = express();
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log('Database connection ready');

  // Initialize the app.
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log('App now running on port', port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log('ERROR: ' + reason);
  res.status(code || 500).json({'error': message});
}

/*  "/products"
 *    GET: finds all products
 *    POST: creates a new contact
 */

app.get('/products', function(req, res) {
  console.log(req.query);
  //var filter = {};
  //set any filters as appropriate
  //TODO: Allow for other filters as well
  //if (req.query.category) {
  // filter = {"category": req.query.category};
  //}
  var filter = utils.getFilterParams(req.query, PRODUCTS_FILTERS);
  var options = {sort: [['brand','asc'], ['name', 'asc']]};

  db.collection(PRODUCTS_COLLECTION).find(filter, options).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, 'Failed to get contacts.');
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post('/products', function(req, res) {
  var newProduct = req.body;
  newProduct.createDate = new Date();

  //if (!(req.body.firstName || req.body.lastName)) {
  //  handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  //}

  db.collection(PRODUCTS_COLLECTION).insertOne(newProduct, function(err, doc) {
    if (err) {
      handleError(res, err.message, 'Failed to create new product.');
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/products/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get('/products/:id', function(req, res) {
  db.collection(PRODUCTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, 'Failed to get product');
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put('/products/:id', function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(PRODUCTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, 'Failed to update contact');
    } else {
      res.status(204).end();
    }
  });
});

app.delete('/products/:id', function(req, res) {
  db.collection(PRODUCTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, 'Failed to delete contact');
    } else {
      res.status(204).end();
    }
  });
});

/*  "/products/categories"
 *    GET: finds all distinct product categories
 */

app.get('/categories', function(req, res) {
  console.log(req.query);
  db.collection(PRODUCTS_COLLECTION).distinct("category",(function(err, docs){
    if (err) {
      handleError(res, err.message, 'Failed to get categories.');
    } else {
      console.log(docs);
      res.status(200).json(docs.sort());
    }
  }));

});

app.get('/chatmessages', function(req, res) {
  var hardCodedJson = [
    { delta: 1000, payload: { type: 'message', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' }, message: { id: 1, text: "Hello!" } }},
    { delta: 2000, payload: { type: 'message', user: { id: 2, user_name: 'chorizo', display_name: 'Chorizo' }, message: { id: 2, text: "Hi Taco!" } }},
    { delta: 2100, payload: { type: 'connect', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' } }},
    { delta: 3000, payload: { type: 'message', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 3, text: "Hi Taco!" } }},
    { delta: 4000, payload: { type: 'message', user: { id: 1, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 4, text: "What's going on in here?" } }},
    { delta: 5000, payload: { type: 'message', user: { id: 2, user_name: 'chorizo', display_name: 'Chorizo' }, message: { id: 5, text: "We're testing this chat replay app" } }},
    { delta: 6000, payload: { type: 'message', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 6, text: "Seems like it's working fine … in the *simple* case :)" } }},
    { delta: 6500, payload: { type: 'message', user: { id: 2, user_name: 'chorizo', display_name: 'Chorizo' }, message: { id: 7, text: "Cool!" } }},
    { delta: 6600, payload: { type: 'update', user: { id: 2, username: 'chorizothecat', display_name: 'Chorizo the Cat' }}},
    { delta: 7000, payload: { type: 'update', message: { id: 6, text: "Seems like it's working find … for *edits* also" }}},
    { delta: 8000, payload: { type: 'message', user: { id: 2, username: 'chorizothecat', display_name: 'Chorizo the Cat' }, message: { id: 8, text: "Just following @pete's lead…" }}},
    { delta: 8250, payload: { type: 'message', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' }, message: { id: 9, text: "We _know_ you're a cat @chorizothecat :facepalm:" }}},
    { delta: 10000, payload: { type: 'update', user: { id: 2, username: 'chorizo', display_name: 'Chorizo' }}},
    { delta: 11000, payload: { type: 'message', user: { id: 2, user_name: 'chorizo', display_name: 'Chorizo' }, message: { id: 10, text: "Oh fine … I mostly just wanted to see what happened when I changed my profile.  Sorry @taco :scream_cat:" } }},
    { delta: 12000, payload: { type: 'delete', message: { id: 9 }}},
    { delta: 14000, payload: { type: 'delete', message: { id: 10 }}},
    { delta: 15000, payload: { type: 'message', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 11, text: "Well, _that_ was fun.  Changing the subject … have you seen https://en.wikipedia.org/wiki/Market_share_of_personal_computer_vendors?" } }},
    { delta: 20000, payload: { type: 'message', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 12, text: "_I_ thought it was pretty interesting.\n\nReally makes you *think*." } }},
    { delta: 30000, payload: { type: 'message', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 13, text: "Anyone…?  @taco?  @chorizo?" } }},
    { delta: 31000, payload: { type: 'disconnect', user: { id: 2, user_name: 'chorizo', display_name: 'Chorizo' } }},
    { delta: 31002, payload: { type: 'disconnect', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' } }},
    { delta: 32000, payload: { type: 'message', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' }, message: { id: 14, text: "Aww :sob:" } }},
    { delta: 33100, payload: { type: 'connect', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' } }},
    { delta: 33150, payload: { type: 'disconnect', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' } }},
    { delta: 34000, payload: { type: 'connect', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' } }},
    { delta: 36000, payload: { type: 'message', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' }, message: { id: 15, text: "Whoops, I'm back.  Flaky wireless connection :ghost:…"} }},
    { delta: 36100, payload: { type: 'disconnect', user: { id: 1, user_name: 'taco', display_name: 'Taco Spolsky' } }},
    { delta: 66000, payload: { type: 'disconnect', user: { id: 3, user_name: 'pete', display_name: 'Pete the Computer' } }}
  ];
  res.status(200).json(hardCodedJson);
});

