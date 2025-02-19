const sdk = require('@defillama/sdk');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');


async function tvl(api) {
  const balances = await tvlV1(api)
  return tvlV2(api, balances)
}

async function tvlV1(api, balances = {}) {
  let vaults = await api.call({ abi: 'address[]:getAllVaults', target: '0xbaa97b771260cf74b52e721ffe0d461512199cf1' })
  const tokensAndOwners = []
  let collateralTokens = await api.multiCall({ abi: 'address:collateralToken', calls: vaults, })
  const updatedData = collateralTokens.reduce((acc, token, i) => {
    if (token === nullAddress) tokensAndOwners.push([token, vaults[i]])
    else {
      acc.vaults.push(vaults[i])
      acc.tokens.push(token)
    }
    return acc
  }, { tokens: [], vaults: []})
  collateralTokens = updatedData.tokens
  vaults = updatedData.vaults
  const collateralNames = await api.multiCall({ abi: 'string:name', calls: collateralTokens, })
  const sTokens = []
  const sTokens2 = []
  collateralNames.forEach((name, i) => {
    if (name && name.startsWith('Super ')) {
      if (name.includes('Benqi'))
        sTokens.push(collateralTokens[i])
      else
        sTokens2.push(collateralTokens[i])
    }
    else
      tokensAndOwners.push([collateralTokens[i], vaults[i]])
  })
  const collateralTokens2 = await api.multiCall({ abi: 'address:underlying', calls: sTokens, })
  const collateralTokens3 = await api.multiCall({ abi: 'address:stakeToken', calls: sTokens2, })
  collateralTokens2.forEach((t, i) => tokensAndOwners.push([t, sTokens[i]]))
  collateralTokens3.forEach((t, i) => tokensAndOwners.push([t, sTokens2[i]]))
  return sumTokens2({ api, balances, tokensAndOwners, })
}

async function tvlV2(api, balances = {}) {
  const leveragePools = await api.call({ abi: 'function getAllLeveragePool() view returns (address[])', target: '0xdc8c63dfc31325aea8cb37ecec1a760bbb5b43e7' })
  const collateralTokens = await api.multiCall({ abi: 'address:underlying', calls: leveragePools, })
  return sumTokens2({ balances, tokensAndOwners: collateralTokens.map((t, i) => ([t, leveragePools[i]])), api })
}

async function staking(api) {
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
  avax: {
    tvl,
    staking
  },
  hallmarks: [
    [Math.floor(new Date('2022-12-24') / 1e3), 'Both v1 & v2 exploited'],
  ],
};
