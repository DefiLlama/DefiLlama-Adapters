const ADDRESSES = require('../helper/coreAssets.json')
const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'
const { sumTokens2 } = require('../helper/unwrapLPs')

async function bouncebitLSDTvl(api) {
  const BBBalance = await api.call({  abi: 'erc20:totalSupply', target: '0x22aAC17E571D6651880d057e310703fF4C7c3483'})  
  api.add(ADDRESSES.null, BBBalance)
  return sumTokens2({ owner: '0x7F150c293c97172C75983BD8ac084c187107eA19', tokens: [BBTC], api })
}

module.exports = {
  bouncebit: {
    tvl: bouncebitLSDTvl
  }
};
