var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var tools = require('./VS-API/basic');
const fetch = require('node-fetch');
const bodyParser = require("body-parser");
const fs = require('fs');
const pdf = require('html-pdf');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// set up bordy parser
/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.

app.use(bodyParser.json());
 */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//handle a post request
app.post('/',function(req,res){
  var email = req.body.email;
  var valid = tools.validateUser(email,'VeriSolutions');
  res.send(valid);
});

//handle a post request for a label
app.post('/labels',function(req,res){
  var text = req.body.html;
  var file_name = req.body.file_name;
  var options = {format:'Letter'};
  pdf.create(text, options).toFile('./'+file_name+'.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
