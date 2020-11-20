var mysql      = require('mysql');
const MOMENT= require( 'moment' );



var getSQL = () => {
  return mysql.createPool({
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout  : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host     : 'yogaandme-main-do-user-2347162-0.db.ondigitalocean.com',
    user     : 'doadmin',
    password : 'd5livek1rastxnua',
    database: 'defillama',
    port: '25060',
    insecureAuth : true
  });

}


var pool = getSQL();

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};



var make_query = async function (tvl, volume, id) {

    if (tvl > 0) {


      var query1 = `SELECT * FROM tvl2 WHERE pid = ${id} AND DATE(ts) = '${new Date().toISOString().split('T')[0]}'`;
      console.log(query1);
      pool.getConnection(function(err, connection) {
          if (err) {
            console.log(err);
          };
          connection.query(query1, function (error, results, fields) {
           if (error) {
             console.log(error);
           };
           connection.release();

           if (!results.length) {

             var query = `INSERT INTO tvl2 (volume,TVL,pid) VALUES ('${volume}','${tvl}', ${id})`
             console.log(query);

             pool.getConnection(function(err, connection) {
                 if (err) {
                   console.log(err);
                 };
                 connection.query(query, function (error, results, fields) {
                   connection.release();

                  if (error) {
                    console.log(error);
                  };
                })
             });
           } else {
           }
         })
      });

      var query = `INSERT INTO tvl (volume,TVL,pid) VALUES ('${volume}','${tvl}', ${id})`;
      console.log(query);

      pool.getConnection(function(err, connection) {
          if (err) {
            console.log(err);
          };
          connection.query(query, function (error, results, fields) {
           if (error) {
             console.log(error);
           };
           connection.release();
         })
      });

    }


}


var make_query_historical = async function (tvl, volume, id, date) {

    if (tvl > 0) {
      var query = `SELECT * FROM tvl WHERE pid = ${id} AND DATE(ts) = '${new Date(date).toISOString().split('T')[0]}'`;
      //console.log(query);
      pool.getConnection(function(err, connection) {
          if (err) {
            console.log(err);
          };
          connection.query(query, function (error, results, fields) {
           if (error) {
             console.log(error);
           };
           if (!results.length) {
             var query = `INSERT INTO tvl (volume,TVL,pid, ts) VALUES ('${volume}','${tvl}', ${id}, '${MOMENT(date).format( 'YYYY-MM-DD HH:mm:ss' )}')`
             pool.getConnection(function(err, connection) {
                 if (err) {
                   console.log(err);
                 };
                 connection.query(query, function (error, results, fields) {
                  if (error) {
                    console.log(error);
                  };
                  connection.release();
                })
             });
           }
           connection.release();
         })
      });
    }


}

// myuser
// myp--45DRGRD564654ggGG++ass**998

module.exports = {
  getSQL,
  getConnection,
  make_query,
  make_query_historical
}
