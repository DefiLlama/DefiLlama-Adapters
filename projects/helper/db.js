var mysql      = require('mysql');



var getSQL = () => {
  return mysql.createPool({
    host     : 'yogaandme-main-do-user-2347162-0.db.ondigitalocean.com',
    user     : 'doadmin',
    password : 'd5livek1rastxnua',
    database: 'defillama',
    port: '25060',
    insecureAuth : true
  });

}


var pool = getSQL();

var make_query = async function (tvl, volume, id) {

    if (tvl > 0) {
      var query = `SELECT * FROM tvl WHERE pid = ${id} AND DATE(ts) = '${new Date().toISOString().split('T')[0]}'`;
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
             var query = `INSERT INTO tvl (volume,TVL,pid) VALUES ('${volume}','${tvl}', ${id})`
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
  make_query
}
