var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "./db/schedules.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE if not EXISTS Schedule 
        (
          id text NOT NULL,
          guestUrl text,
          title text,
          rangeStart date,
          rangeEnd date,
          PRIMARY KEY (id)
        );`,
        (err) => {
            if (err) {
                console.log(err)
            }
        });

        db.run(`
        CREATE TABLE if not EXISTS GuestSchedule 
        (
          url text NOT NULL,
          reserved date,
          FOREIGN KEY (url) REFERENCES Schedule(guestUrl)
        );`,
        (err) => {
            if (err) {
                console.log(err)
            }
        });
    }
});


module.exports = db