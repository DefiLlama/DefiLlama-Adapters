const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')
const { covalentGetTokens } = require('./http')
const axios = require("axios")

const ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548";

function treasuryExports(config) {
  const chains = Object.keys(config)
  const exportObj = {  }
  chains.forEach(chain => {
    let { ownTokenOwners = [], ownTokens = [], owners = [], fetchTokens = false, tokens = [], blacklistedTokens = [] } = config[chain]
    if (chain === 'solana')  config[chain].solOwners = owners
    if (chain === 'solana')  config[chain].solOwners = owners
    const tvlConfig = { ...config[chain] }
    tvlConfig.blacklistedTokens = [...ownTokens, ...blacklistedTokens]
    if(fetchTokens === true){
      exportObj[chain] = { tvl: async (_, _b, _cb, { api }) => {
        const tokens = await Promise.all(owners.map(address=>covalentGetTokens(address, chain)))
        const uniqueTokens = new Set([...config[chain].tokens, ...tokens.flat()])
        tvlConfig.tokens = Array.from(uniqueTokens)
        return sumTokensExport(tvlConfig)(_, _b, _cb, api)
      }}
    } else {
      if (chain === 'arbitrum')  {
        tvlConfig.tokens = [...tokens, ARB]
      }
      exportObj[chain] = { tvl: sumTokensExport(tvlConfig) }
    }

    if (ownTokens.length > 0) {
      const { solOwners, ...otherOptions } = config[chain]
      const options = { ...otherOptions, owners: [...owners, ...ownTokenOwners], tokens: ownTokens, chain, uniV3WhitelistedTokens: ownTokens}
      exportObj[chain].ownTokens = sumTokensExport(options)
    }
  })
  return exportObj
}

async function getComplexTreasury(owners){
  const networks = ["ethereum", "polygon", "optimism", "gnosis", "binance-smart-chain", "fantom", "avalanche", "arbitrum",
    "celo", "harmony", "moonriver", "bitcoin", "cronos", "aurora", "evmos"]
  const data = await axios.get(`https://api.zapper.xyz/v2/balances/apps?${owners.map(a=>`addresses=${a}`).join("&")}&${networks.map(a=>`networks=${a}`).join("&")}`, {
    headers:{
      Authorization: `Basic ${btoa(process.env.ZAPPER_API_KEY)}`
    }
  })
  let sum = 0
  data.data.forEach(d=>{
    sum+=d.balanceUSD
  })
  return sum
}

function ohmStaking(exports) {
  const dummyTvl = () => ({})
  const newExports = {}
  Object.entries(exports).forEach(([chain, value]) => {
    if (typeof value === 'object' && typeof value.tvl === 'function') {
      newExports[chain] = { ...value, tvl: dummyTvl}
    } else {
      newExports[chain] = value
    }
  })
  return newExports
}

function ohmTreasury(exports) {
  const dummyTvl = () => ({})
  const newExports = {}
  Object.entries(exports).forEach(([chain, value]) => {
    if (typeof value === 'object' && typeof value.staking === 'function') {
      newExports[chain] = { ...value,}
      delete newExports[chain].staking
    } else {
      newExports[chain] = value
    }
  })
  return newExports
}

module.exports = {
  nullAddress,
  treasuryExports,
  getComplexTreasury,
  ohmTreasury,
  ohmStaking,
}
