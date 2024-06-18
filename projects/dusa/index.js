const {
  sumTokens2,
  formatBalances,
  getPairAddressTokens,
  getPairAddress
  } = require('../helper/chain/massa.js');


const factoryAddress='AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX'

async function tvl(api){
  const pools = await getPairAddress(factoryAddress);
  const toa = [];

  for (let i = 0; i < pools.length; i++) {
    const tokens = await getPairAddressTokens(pools[i]);
     
    toa.push([tokens[1], pools[i]]);
    toa.push([tokens[0], pools[i]]);
  }
  const sum = await sumTokens2(toa, api);
  const formattedBalances = await formatBalances(sum, api);

  console.log('formattedBalances', formattedBalances, 'api',api);
  return formattedBalances;
}

module.exports = {
  methodology: 'counts the tvl in the protocol',
  massa: {
    tvl: tvl,
  }
};

