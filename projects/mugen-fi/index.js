const { staking } = require('../helper/staking')

async function tvl(api) {
  const reserveBalance = await api.call({  abi: 'uint256:reserveBalance', target:  '0xf7be8476ae27d27ebc236e33020150b23a86f3dd'}) 
  return {
    tether: reserveBalance / 1e18
  }
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  arbitrum: {
    tvl,
    staking: staking('0x25b9f82d1f1549f97b86bd0873738e30f23d15ea', '0xfc77b86f3ade71793e1eec1e7944db074922856e')
  }
}