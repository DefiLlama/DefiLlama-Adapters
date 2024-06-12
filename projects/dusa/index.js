// sumToken2 will be from the massa helper 
const {
  fetchTVL, 
  poolsInformation,
  symbolAndPrices,
  getPairAddress, 
  decodePairInformation,
  getPairInformation
  } = require('../helper/chain/massa.js');

const factoryAddress = {
  massa: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX',
}

async function tvl() {

  const tokenSymbolPool = await poolsInformation(factoryAddress.massa);
  const symbolAndPricesArray = await symbolAndPrices(tokenSymbolPool);
  const poolAddresses = await getPairAddress(factoryAddress.massa);

  if (poolAddresses[0].startsWith(":")) {
    poolAddresses[0] = poolAddresses[0].substring(1);
  }

  const pools = poolAddresses[0].split(":");
  let i = 0;
  let tvl = 0;
  for (const pool of pools) {
 
    const info = await getPairInformation(pool);
    let poolInfo = await decodePairInformation(info);

    poolInfo = {
      reserveX: Number(poolInfo.reserveX),
      reserveY: Number(poolInfo.reserveY),
      symbolX: tokenSymbolPool[i].symbolX,
      symbolY: tokenSymbolPool[i].symbolY,
      decimalsX: tokenSymbolPool[i].decimalsX,
      decimalsY: tokenSymbolPool[i].decimalsY,
    };
    const tvlInPool = await fetchTVL(poolInfo, symbolAndPricesArray);

  
    tvl += (tvlInPool);
    console.log('tvl at each tour ', tvl); 
    i += 1;
  }

  return tvl;
}

tvl().then(totalValueLocked => {
  console.log("Total Value Locked: ", totalValueLocked);
}).catch(error => {
  console.error("An error occurred: ", error);
});


module.exports = {
  methodology: 'counts the token balances in different liquidity book contracts',
  massa: 
  {
    tvl: tvl
  },
}; 

