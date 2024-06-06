// sumToken2 will be from the massa helper 
const {
  RPC_ENDPOINT,
  getPairAddress,
  fetchTVL,
  baseClient,
  fetchPairInformation,
  getPairAddressTokens, } = require('../helper/chain/massa.js')

const factoryAddress = {
  massa: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX',
}

async function tvl() {
  // dans index on vas
// - 1 recupérer les pools de la factory
// - 2 pour chaque pool on recupere les tokens
// - 2 pour chaque pool on recupere les reserves
// -3 on construit une array de pools avec les reserves et les prix des tokens
// [{ token 1 : { reserve : .. , price : .. }, token 2 : { reserve : .. , price : .. }]

// -4 on calcule la tvl en sommant les reserves * les prix des tokens de l'array.
// -5 on retourne la tvl

}

tvl().then(console.log)


module.exports = {
  methodology: 'counts the token balances in different liquidity book contracts',
  start: 1713170000,
  massa: {
    tvl,
  }
}; 