var request = require('request');
request('https://my.ergoport.dev/cgi-bin/aneta/c_neta_TVL.pl', function (error, response, body) {
methodology: `cNETA TVL is achieved by making a call to anetaBTC's API: https://my.ergoport.dev/cgi-bin/aneta/c_neta_TVL.pl and consists of all staked NETA.`
module.exports = body

    if (!error && response.statusCode === 200) {
        console.log(body) // console output.
     }

})