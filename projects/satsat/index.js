const { configPost } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
const HOST='https://order.satsat.exchange'
const MarketContract = '0x56ed5Ad8DA3ed3b46aE3e6fb28eC653EB93b9436'

async function tvl(api) {
  let  { data } =  await configPost('satsat',`${HOST}/api/queryTokenInfo`, {"address":"","tokenSymbol":""})
  const tokens = data.map(v => v.address);
  return sumTokens2({ api, owner: MarketContract, tokens });
}

module.exports = {
  methodology: "All locked tokens includes stable and crypto assets in SatSat marketplace.",
  map: {
    tvl
  }
};
