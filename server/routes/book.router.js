const { response } = require('express');
const express = require('express');
const router = express.Router();

const pool = require('../modules/pool');

// Get all books sorted by title
router.get('/', (req, res) => {
  let queryText = 'SELECT * FROM "books" ORDER BY "title";';
  pool.query(queryText).then(result => {
    // Sends back the results in an object
    res.send(result.rows);
  })
  .catch(error => {
    console.log('error getting books', error);
    res.sendStatus(500);
  });
});

// Get all books sorted by author
router.get('/authorsort', (req, res) => {
  let queryText = 'SELECT * FROM "books" ORDER BY "author";';
  pool.query(queryText).then(result => {
    // Sends back the results in an object
    res.send(result.rows);
  })
  .catch(error => {
    console.log('error getting books', error);
    res.sendStatus(500);
  });
});

// Get all books sorted by author
router.get('/readsort', (req, res) => {
  let queryText = 'SELECT * FROM "books" ORDER BY "isRead" DESC, "title";';
  pool.query(queryText).then(result => {
    // Sends back the results in an object
    res.send(result.rows);
  })
  .catch(error => {
    console.log('error getting books', error);
    res.sendStatus(500);
  });
});

// Adds a new book to the list of awesome reads
// Request body must be a book object with a title and author.
router.post('/',  (req, res) => {
  let newBook = req.body;
  console.log(`Adding book`, newBook);
  if (!req.body.title || !req.body.author) {
    res.sendStatus(400);
  }

  let queryText = `INSERT INTO "books" ("author", "title")
                   VALUES ($1, $2);`;
  pool.query(queryText, [newBook.author, newBook.title])
    .then(result => {
      res.sendStatus(201);
    })
    .catch(error => {
      console.log(`Error adding new book`, error);
      res.sendStatus(500);
    });
});

// TODO - PUT
// Updates a book to show that it has been read
// Request must include a parameter indicating what book to update - the id
// Request body must include the content to update - the status
router.put('/:bookid', (req, res) => {
  console.log('req params: ', req.params);
  const bookid = req.params.bookid;
  let isRead = req.body.isRead;
  console.log("this is isRead on server", isRead);
  if (isRead === 'true') {
    isRead = false;
  } else if (isRead === 'false') {
    isRead = true;
  }
  const query = `UPDATE "books" SET "isRead"=$1 WHERE id=$2`;
  pool.query(query, [isRead, bookid]).then((response) => {
    res.sendStatus(200);
  });
});

router.put('/:bookid/edit', (req, res) => {
  console.log('req params: ',req.params);
  console.log('req.body: ', req.body);
  const title = req.body.title;
  const author = req.body.author;
  const bookid = req.params.bookid;
  const query = `UPDATE "books" SET "title"=$1, "author"=$2 WHERE id=$3`
  pool.query(query, [title, author, bookid]).then((response) => {
    res.sendStatus(200);
  });
});

// function editBook(){
//   headingChange();
//   $.ajax({
//     type: 'PUT',
//     url: `/books/${bookToEdit}/edit`
//   }).then(function() {
//     refreshBooks();
//   }).catch(function(error){
//     console.log('error in PUT', error);
//   });
// }

// TODO - DELETE 
// Removes a book to show that it has been read
// Request must include a parameter indicating what book to update - the id

router.delete('/:bookid', (req, res) => {
  console.log('req params: ', req.params);
  const bookid = req.params.bookid;
  const query = `DELETE FROM "books" WHERE id=$1`;
  pool.query(query, [bookid]).then((response) => {
    res.sendStatus(204);
  });
});

module.exports = router;
