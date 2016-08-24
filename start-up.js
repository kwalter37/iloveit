var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var _ = require("underscore");

var PRODUCTS_COLLECTION = 'products';
var PRODUCTS_FILTERS = {category: 'string', rating: 'int'};

var app = express();
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

// from queryParams, return only valid ones
function getFilterParams(queryParams) {
  var filterKeys = _.keys(PRODUCTS_FILTERS);
  var validFilters = _.pick(queryParams, filterKeys);

  //we will get numbers as strings, so need to convert
  return _.mapObject(validFilters, function (val, key) {
      if (PRODUCTS_FILTERS[key] === 'int') {
        return parseInt(val, 10);
      }
      else {
        return val;
      }
  });
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
  var filter = getFilterParams(req.query);

  db.collection(PRODUCTS_COLLECTION).find(filter).toArray(function(err, docs) {
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
