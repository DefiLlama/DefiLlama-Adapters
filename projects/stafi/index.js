const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const {chainExports} = require('../helper/exports')
const {usdtAddress} = require('../helper/balances')
const {getApiTvl} = require('../helper/historicalApi');
const { fetchURL } = require('../helper/utils');

const wethAddress = ADDRESSES.ethereum.WETH

async function ethereum(api) {
  const totalSupply = await api.call({ target: '0x9559Aaa82d9649C7A7b220E7c461d2E74c9a3593', abi: 'uint256:totalSupply'});
  const rate = await api.call({ target: '0x9559Aaa82d9649C7A7b220E7c461d2E74c9a3593', abi: 'uint256:getExchangeRate'});
  return {
    [wethAddress]: (totalSupply * rate)/1e18
  }
}

const chainToParams={
  bsc: ["RBNB", "binancecoin"],
  polygon: ["RMATIC", "matic-network"],
  polkadot: ["RDOT", "polkadot"],
  kusama: ["RKSM", "kusama"],
  solana: ["RSOL", "solana"],
  cosmos: ["RATOM", "cosmos"],
  carbon: ["RSWTH", "switcheo"],
  chihuahua: ["RHUAHUA", "chihuahua-token"],
  irisnet:["RIRIS","iris-network"]
}

function getTvlFunction(token, cgId){
  return async timestamp=>{
    const bal = await getApiTvl(timestamp, async()=>{
      const data = await fetchURL(API)
      return Number(data.data.data.currentStake.find(r=>r.rsymbol ===token).stakeAmount)
    }, async()=>{
      const data = await fetchURL(API)
      return data.data.data.historyStake[token].map(p=>({
        date: p.timestamp,
        totalLiquidityUSD: Number(p.stakeAmount)
      }))
    })
    return {
      [cgId]: Number(bal[usdtAddress])/(10**6)
    }
  }
}

const API = "https://partner-api.stafi.io/stafi/v1/partnerapi/rtoken/getstakelist"
function chainTvl(chain){
  const [token, cgId] = chainToParams[chain]
  return getTvlFunction(token, cgId)
}

module.exports = {
    ethereum: {
    tvl: sdk.util.sumChainTvls([chainTvl('polygon'), ethereum]),
    staking:  getTvlFunction("RFIS", "stafi")
  },
  bsc: {
    tvl: chainTvl('bsc')
  },/*
  polygon: {
    tvl: chainTvl('polygon') //exported along with ethereum tvl since MATIC's are staked on the Ethereum Mainnet
  },*/
  cosmos: {
    tvl: sdk.util.sumChainTvls([chainTvl('cosmos'), chainTvl('carbon'), chainTvl('chihuahua'), chainTvl('irisnet')])
  },
  solana: {
    tvl: chainTvl('solana')
  },
  stafi: {
    tvl: sdk.util.sumChainTvls([chainTvl('polkadot'), chainTvl('kusama')])
  }
}
