const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{username: 'customer', password: 'password'}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    if (!username || username.length < 3) {
        return false;
    }

    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const userExists = users.find(user => user.username === username && user.password === password);
    if (userExists) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userIndex = users.findIndex(user => user.username === username && user.password === password);
  if (userIndex === -1) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate and send token for successful login
  const token = jwt.sign({ username }, "secret_key");
  req.session.user = { username, token }; // Save user credentials for session
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.query;
  const { user } = req.session;

  // Check if user is logged in
  if (!user) {
    return res.status(401).json({ message: "Unauthorized: User must be logged in" });
  }

  // Extract username from the session
  const { username } = user;

  if (!review) return res.status(400).json({ message: "Review is required" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const existingReview = book.reviews.find(r => r.username === username);
  if (existingReview) {
    existingReview.review = review;
    return res.status(200).json({ message: "Review modified successfully" });
  } else {
    book.reviews.push({ username, review });
    return res.status(200).json({ message: "Review added successfully" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { user } = req.session;
  
    // Check if user is logged in
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User must be logged in" });
    }
  
    // Extract username from the session
    const { username } = user;
  
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: "Book not found" });
  
    const userReviewIndex = book.reviews.findIndex(r => r.username === username);
    if (userReviewIndex === -1) {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  
    // Delete the user's review
    book.reviews.splice(userReviewIndex, 1);
    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
