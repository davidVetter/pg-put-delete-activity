let addEditToggle = true;
let bookToEdit;

$(document).ready(function(){
  console.log('jQuery sourced.');
  refreshBooks();
  addClickHandlers();
});

function addClickHandlers() {
  $('#submitBtn').on('click', handleSubmit);

  // TODO - Add code for edit & delete buttons
  $('#bookShelf').on('click', '.deleteBtn', removeBook);
  $('#bookShelf').on('click', '.updateBtn', markRead);
  $('#bookShelf').on('click', '.editBtn', editBookClick);
}

function handleSubmit() {
  headingChange();
  console.log('Submit button clicked.');
  let book = {};
  book.author = $('#author').val();
  book.title = $('#title').val();
  let check = validateInputs(book);
  if (!check) {
    whichFieldMissing(book);
    return;
  }
  if (addEditToggle) {
  addBook(book);
  } else {
    editBook(book.title, book.author);
    addEditToggle = true;
  }
}

// adds a book to the database
function addBook(bookToAdd) {
  $.ajax({
    type: 'POST',
    url: '/books',
    data: bookToAdd,
    }).then(function(response) {
      console.log('Response from server.', response);
      refreshBooks();
    }).catch(function(error) {
      console.log('Error in POST', error)
      alert('Unable to add book at this time. Please try again later.');
    });
}

// This function removes a book from the table on the DOM and removes the book from the database
// when a delete button is clicked in the table
function removeBook(event){
  const bookId = $(event.target).data('bookid');
  $.ajax({
    type: 'DELETE',
    url: `/books/${bookId}`
  }).then(() => {
    refreshBooks();
  }).catch((err) => console.log(err));
}

function markRead(event){
  const bookId = $(event.target).data('bookid');
  const isRead = $(event.target).data('isbookread');
  console.log("this is isRead", isRead);
  $.ajax({
    type: 'PUT',
    url: `/books/${bookId}`,
    data: {
      isRead 
    }
  }).then(() => {
    refreshBooks();
  })
}

// This function will put the project in an edit mode to edit a specific books entry in the database
function editBookClick(event){
  bookToEdit = $(event.target).data('bookid');
  addEditToggle = false;
  headingChange();
  setSubmitBtnTxt();
  clearInputs();
}

function editBook(title, author){
  headingChange();
  $.ajax({
    type: 'PUT',
    url: `/books/${bookToEdit}/edit`,
    data: {
      title,
      author
    }
  }).then(function() {
    refreshBooks();
    addEditToggle = true;
    headingChange();
  }).catch(function(error){
    console.log('error in PUT', error);
  });
}

// refreshBooks will get all books from the server and render to page
function refreshBooks() {
  $.ajax({
    type: 'GET',
    url: '/books'
  }).then(function(response) {
    console.log(response);
    renderBooks(response);
    clearInputs();
    setSubmitBtnTxt();
  }).catch(function(error){
    console.log('error in GET', error);
  });
}


// Displays an array of books to the DOM
function renderBooks(books) {
  $('#bookShelf').empty();

  for(let i = 0; i < books.length; i += 1) {
    let book = books[i];
    // For each book, append a new row to our table
    $('#bookShelf').append(`
      <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td class="isReadTxt">${book.isRead}</td>
        <td><button class="editBtn" data-bookid="${book.id}">Edit</button</td>
        <td><button class="deleteBtn" data-bookid="${book.id}">Delete</button></td>
        <td><button class="updateBtn" data-bookid="${book.id}" data-isbookread="${book.isRead}">Mark Read</button></td>
      </tr>
    `);
  }
}

function headingChange() {
  if (addEditToggle) {
    $('#addEditHeading').text('Add New Book');
  } else {
  $('#addEditHeading').text('Edit Book');
  };
}

function clearInputs() {
  $('#title').val('');
  $('#author').val('');
}

function setSubmitBtnTxt() {
  if (addEditToggle) {
    $('#submitBtn').text('Add Book');
  } else {
    $('#submitBtn').text('Make Change');
  };
}

function validateInputs(obj) {
 if (!obj.title || !obj.author) {
  return false;
 }
 return true;
}

function whichFieldMissing(book) {
  if (!book.author && !book.title) {
    $('#title').val('A title is required!');
    $('#author').val('An author is required!');
  } else if (!book.author) {
    $('#author').val('An author is required!');
  } else if (!book.title) {
    $('#title').val('A title is required!');
  }
}