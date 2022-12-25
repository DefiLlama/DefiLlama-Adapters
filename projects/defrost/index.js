const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');


async function tvl(_, _b, _cb, { api, }) {
  const balances = await tvlV1(api)
  return tvlV2(api, balances)
}

async function tvlV1(api, balances = {}) {
  const vaults = await api.call({ abi: 'function getAllVaults() view returns (address[])', target: '0xbaa97b771260cf74b52e721ffe0d461512199cf1' })
  const collateralTokens = await api.multiCall({
    abi: 'address:collateralToken',
    calls: vaults,
  })
  return sumTokens2({ balances, tokensAndOwners: collateralTokens.map((t, i) => ([t, vaults[i]])), ...api})
}

async function tvlV2(api, balances = {}) {
  const vaults = await api.call({ abi: 'function getAllLeveragePool() view returns (address[])', target: '0xdc8c63dfc31325aea8cb37ecec1a760bbb5b43e7' })
  const collateralTokens = await api.multiCall({
    abi: 'address:underlying',
    calls: vaults,
  })
  return sumTokens2({ balances, tokensAndOwners: collateralTokens.map((t, i) => ([t, vaults[i]])), ...api})
}

async function staking(_, _b, _cb, { api, }){
  const stk = await api.call({
    target: "0x1e93b54AC156Ac2FC9714B91Fa10f1b65e2daFD9",
    abi: "uint256:totalStaked"
  })
  return {
    "avax:0x47eb6f7525c1aa999fbc9ee92715f5231eb1241d": stk
  }
}


module.exports = {
  doublecounted: true,
  start: 6965653, 
  avax:{
    tvl,
    staking
  },
  hallmarks: [
    [Math.floor(new Date('2022-12-24')/1e3), 'Both v1 & v2 exploited'],
  ],
};
