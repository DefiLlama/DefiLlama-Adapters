// sumToken2 will be from the massa helper 
const {
  getPairAddress,
  fetchTVL,
  baseClient,
  fetchPairInformation,
  getPairAddressTokens, } = require('../helper/chain/massa.js');
const { get } = require('../helper/http.js');

const factoryAddress = {
  massa: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX',
}

async function tvl() {
  const pools = await getPairAddress(factoryAddress.massa);
  console.log('pools', pools)

  const tvl = await fetchTVL(pools)
  return tvl;

}

tvl().then(console.log)


module.exports = {
  methodology: 'counts the token balances in different liquidity book contracts',
  start: 1713170000,
  massa: {
    tvl,
  }
}; 