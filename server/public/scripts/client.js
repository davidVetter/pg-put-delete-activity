let addEditToggle = true;
let bookToEdit;
let sortTitle = true;
let sortAuthor = false;
let sortRead = false;

$(document).ready(function(){
  console.log('jQuery sourced.');
  refreshBooks();
  addClickHandlers();
  $('#cancelBtn').hide();
  $('#cancelBtn').on('click', cancelEdit);
});

function addClickHandlers() {
  $('#submitBtn').on('click', handleSubmit);

  // TODO - Add code for edit & delete buttons
  $('#bookShelf').on('click', '.deleteBtn', removeBook);
  $('#bookShelf').on('click', '.updateBtn', markRead);
  $('#bookShelf').on('click', '.editBtn', editBookClick);
  $('#authorHeadSort').on('click', refreshBooksAuthorSort);
  $('#titleHeadSort').on('click', refreshBooks);
  $('#readSort').on('click', refreshBookReadSort);
}

function handleSubmit() {
  headingChange();
  $('#cancelBtn').hide();
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
    checkSortStatus();
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
    checkSortStatus();
  })
}

// This function will put the project in an edit mode to edit a specific books entry in the database
function editBookClick(event){
  bookToEdit = $(event.target).data('bookid');
  let title = $(event.target).data('booktitle');
  let author = $(event.target).data('bookauthor');
  addEditToggle = false;
  $('#cancelBtn').show();
  headingChange();
  setSubmitBtnTxt();
  infoToChange(title, author);
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
    checkSortStatus();
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
    titleSortSet();
  }).catch(function(error){
    console.log('error in GET', error);
  });
}

function refreshBooksAuthorSort() {
  $.ajax({
    type: 'GET',
    url: '/books/authorsort'
  }).then(function(response) {
    console.log(response);
    renderBooks(response);
    clearInputs();
    setSubmitBtnTxt();
    authorSortSet();
  }).catch(function(error){
    console.log('error in GET', error);
  });
}

function refreshBookReadSort() {
  $.ajax({
    type: 'GET',
    url: '/books/readsort'
  }).then(function(response) {
    console.log(response);
    renderBooks(response);
    clearInputs();
    setSubmitBtnTxt();
    readSortSet();
  }).catch(function(error){
    console.log('error in GET', error);
  });
}


// Displays an array of books to the DOM
function renderBooks(books) {
  $('#bookShelf').empty();

  for(let i = 0; i < books.length; i += 1) {
    let book = books[i];
    console.log('This is book.isRead', book.isRead);
    let updateBtnLink = `../../img/icons8-read-64.png`
    let classColor = 'red';
    let readText = 'Nope';
    if (book.isRead) {
      updateBtnLink = `../../img/icons8-open-book-64.png`;
      classColor = 'green';
      readText = 'Yep';
    };
    // For each book, append a new row to our table
    $('#bookShelf').append(`
      <tr class="bookRows">
        <td class="wordColumns">${book.title}</td>
        <td class="wordColumns">${book.author}</td>
        <td class="isReadTxt">${readText}</td>
        <div class="buttonsDiv">
        <td class="buttonsTD">
          <button class="editBtn">
            <img class="editBtn" 
            data-bookid="${book.id}" 
            data-booktitle="${book.title}" 
            data-bookauthor="${book.author}" 
            src="../../img/icons8-edit-64.png">
          </button>
          <button class="deleteBtn">
              <img class="deleteBtn" data-bookid="${book.id}" 
                src="../../img/icons8-trash-can-64.png">
            </button>
            <button class="updateBtn ${classColor}" data-bookid="${book.id}" 
            data-isbookread="${book.isRead}">
              <img class="updateBtn" data-bookid="${book.id}" 
              data-isbookread="${book.isRead}" src="${updateBtnLink}">
            </button>
        </td>
        
        </div>
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
  if (obj.title === 'A title is required!' || obj.author === 'An author is required!') {
    return false;
  }
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

function infoToChange(title, author) {
  $('#title').val(title);
  $('#author').val(author);
}

function checkSortStatus() {
  if (sortTitle) {
    refreshBooks();
  } else if (sortAuthor) {
    refreshBooksAuthorSort();
  } else if (sortRead)  {
    refreshBookReadSort();
  };
}

function titleSortSet() {
  sortTitle = true;
  sortAuthor = false;
  sortRead = false;
}

function authorSortSet() {
  sortTitle = false;
  sortAuthor = true;
  sortRead = false;
}

function readSortSet() {
  sortTitle = false;
  sortAuthor = false;
  sortRead = true;
}

function cancelEdit() {
  $('#cancelBtn').hide();
  clearInputs();
  addEditToggle = true;
  checkSortStatus();
  headingChange();
}