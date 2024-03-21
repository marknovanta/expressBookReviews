const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the users array or your database
  if (isValid(username)) {
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  }
  
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  const bookList = JSON.stringify(books);
  return res.status(200).json({books: bookList});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn]
  
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: 'Book not found' });
  }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const authorBooks = Object.values(books).filter(book => book.author === author)

  if (authorBooks.length > 0) {
    return res.status(200).json(authorBooks)
  } else {
    return res.status(404).json({ message: 'No book found for this author' })
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const titleBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
  
  if (titleBooks.length > 0) {
    return res.status(200).json(titleBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn]
  
  if (book && book.reviews && book.reviews.length > 0) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: 'No reviews found for this book' });
  }
});

module.exports.general = public_users;
