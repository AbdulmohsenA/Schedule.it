let createError = require('http-errors');
let express = require('express');
let path = require('path');
let sqlite3 = require("sqlite3");
let db = require("./models/database.js")
let makeId = require('./models/randomId.js')
let encoder = require('./models/encoder.js')
let favicon = require('serve-favicon')
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index');
});

app.post("/", (req, res) => {
  let id = makeId(10)
  let guestUrl = encoder(id)

  let title = req.body.title
  let dateStart = req.body.dateStart
  let dateEnd = req.body.dateEnd


  let insert = 'INSERT INTO Schedule (id, guestUrl, title, rangeStart, rangeEnd) VALUES (?,?,?,?,?)'
  db.all(insert, [id, guestUrl, title, dateStart, dateEnd])
  res.redirect(`/${id}`)
})


app.get('/thanks', (req, res, next) => {
  res.render('thanks')
})

app.get("/:id", async (req, res) => {
  const id = req.params.id
  let query = 'SELECT * FROM Schedule WHERE id = ?'
  db.all(query, id, (err, rs) => {
    if (rs.length == 0) {
      res.render('error', {error: err, message: 'No such site!'})
    } else {
      rs = rs[0]
      let dates = []
      db.all('SELECT * FROM GuestSchedule WHERE url = ?', rs.id, (error, guestRS) => {

        res.render('schedule', {guestUrl: rs.guestUrl, title: rs.title, startDate: rs.rangeStart, endDate: rs.rangeEnd, dates: guestRS})
        
      })
    }
  })
})

app.get("/insert/:id", async (req, res) => {
  const id = req.params.id
  let query = 'SELECT * FROM Schedule WHERE guestUrl = ?'
  db.all(query, id, (err, rs) => {
    if (rs.length == 0) {
      res.render('error', {error: err, message: 'No such site!'})
    } else {
      rs = rs[0]
      res.render('insert', {title: rs.title, startDate: rs.rangeStart, endDate: rs.rangeEnd})
    }
  })
})

app.post("/insert/:id", async (req, res) => {
  const id = encoder(req.params.id)
  let query = 'INSERT INTO GuestSchedule (url, reserved) VALUES (?, ?)'
  let dates = req.body.dates.split(",")
  dates.forEach(date => {
    db.all(query, [id, date])
  });

  res.redirect('/thanks')
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
