const retry = require('async-retry')
const axios = require("axios");

async function fetch() {

  var seen = [];
  var tvl = 0;
  return '1';
  var response = await retry(async bail => await axios.get('https://serum-api.bonfida.com/pools'))
  await Promise.all(
    response.data.data.map(async pool => {

        var poolL = pool.liquidityAinUsd + pool.liquidityBinUsd;
        if (!seen.includes(pool.pool_identifier)) {
          seen.push(pool.pool_identifier)
          tvl += pool.liquidityAinUsd;
          tvl += pool.liquidityBinUsd;
        }
    })
  )

  return tvl;

}

module.exports = {
  fetch
}
