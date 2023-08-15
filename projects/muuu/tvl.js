const ADDRESSES = require("../helper/coreAssets.json");
const ABI = require("./abi.json");
const { staking } = require('../helper/staking')

const ZERO_ADDRESS = ADDRESSES.null;
const REGISTRY_ADDRESS = "0xDA820e20A89928e43794645B9A9770057D65738B";
const BOOSTER_ADDRESS = "0x6d12e3dE6dAcDBa2779C4947c0F718E13b78cfF4";
const MUKGL_ADDRESS = "0x5eaAe8435B178d4677904430BAc5079e73aFa56e";
const MULAY_ADDRESS = "0xDDF2ad1d9bFA208228166311FC22e76Ea7a4C44D";
const MUU_TOKEN = "0xc5BcAC31cf55806646017395AD119aF2441Aee37";
const MUUU_REWARDS_ADDRESS = "0xB2ae0CF4819f2BE89574D3dc46D481cf80C7a255";

async function tvl(timestamp, block, chainBlocks, { api }) {
  const [veKGL, veLAY] = await api.multiCall({ abi: 'erc20:totalSupply', calls: [MUKGL_ADDRESS, MULAY_ADDRESS] })
  api.add(ADDRESSES.astar.KGL, veKGL)
  api.add(ADDRESSES.astar.LAY, veLAY)
  const pools = await api.fetchList({ lengthAbi: ABI.poolLength, itemAbi: ABI.poolInfo, target: BOOSTER_ADDRESS })
  const supply = await api.multiCall({ abi: 'erc20:totalSupply', calls: pools.map(i => i.token) })
  let i = 0
  for (const pool of pools) await addTokensInPool(api, pool.lptoken, supply[i++])
}

module.exports = {
  tvl,
  staking: staking(MUUU_REWARDS_ADDRESS, MUU_TOKEN),
};

const poolMapping = {
  '0x5c71534db6e54322943ad429209d97fa25bbfcd2': { pool:'0x4fD9011F0867e7e8AF7608Ad1BB969Da8b0aBa9B', tokenCount: 2 },
  '0xe12332a6118832cbafc1913ec5d8c3a05e6fd880': { pool:'0xe12332a6118832cbafc1913ec5d8c3a05e6fd880', tokenCount: 2 },
  '0xb91e7abcbf38d0cac1f99b062b75ae0c18e169d1': { pool:'0x578AA1be6D258677e80c9067711861dd981a663E', tokenCount: 2 },
  '0xdc1c5babb4dad3117fd46d542f3b356d171417fa': { pool:'0xdc1c5babb4dad3117fd46d542f3b356d171417fa', tokenCount: 2 },
}

async function addTokensInPool(api, lpToken, tokenBal) {
  let pool = await api.call({ target: REGISTRY_ADDRESS, abi: ABI.get_pool_from_lp_token, params: lpToken, })
  let tokens = []
  let bals = []
  const mappingPool = poolMapping[lpToken.toLowerCase()]
  const supply = await api.call({ abi: 'erc20:totalSupply', target: lpToken })
  if (pool === ZERO_ADDRESS && !mappingPool) {
    api.add(lpToken, tokenBal)
    return;
  } 
  
  if (mappingPool){
    const { pool , tokenCount } = mappingPool
    bals = await api.multiCall({ abi: "function balances(uint256) view returns (uint256)", target: pool, calls: Array(tokenCount).fill(0).map((_, i) => i)})
    tokens = await api.multiCall({ abi: ABI.coins, target: pool, calls: Array(tokenCount).fill(0).map((_, i) => i)})
    console.log(bals, tokens)
  } else {
    tokens = await api.call({  abi: ABI.get_coins, target: REGISTRY_ADDRESS, params: pool })
    bals = await api.call({  abi: ABI.get_balances, target: REGISTRY_ADDRESS, params: pool })
  }
  const ratio = tokenBal / supply
  for (const t of tokens) {
    if (t === ZERO_ADDRESS) continue;
    const name = await api.call({  abi: 'string:name', target: t })
    if (name.includes('Kagla.fi')) await addTokensInPool(api, t, bals[tokens.indexOf(t)] * ratio)
    else api.add(t, bals[tokens.indexOf(t)] * ratio)
  }
}