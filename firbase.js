/**
 * define require module
 */
var firebase = require("firebase"),
  config = {
    apiKey: "AIzaSyA7i2CFeB3Lv_CFv38ExAuEY7cREaHcmeM",
    authDomain: "project--2325634527987921250.firebaseapp.com",
    databaseURL: "https://project--2325634527987921250.firebaseio.com",
    storageBucket: "project--2325634527987921250.appspot.com",
    messagingSenderId: "134132655789"
  };
firebase.initializeApp(config);
module.exports = firebase;