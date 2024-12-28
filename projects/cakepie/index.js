const ADDRESSES = require('../helper/coreAssets.json')
const CakepieReaderAbi = require("./abis/CakepieReader.json");
const MasterCakepieAbi = require("./abis/MasterCakepie.json");
const config = require("./config")
const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking');


async function tvl(api) {
  const { PancakeStaking, CakepieReader, MasterCakepieAddress, CakeAddress, } = config[api.chain];

  function transformToken(token) {
    token = token.toLowerCase()
    switch (token) {
      case '0x581fa684d0ec11ccb46b1d92f1f24c8a3f95c0ca': return CakeAddress // mcake -> cake
      case '0x7dc91cbd6cb5a3e6a95eed713aa6bf1d987146c8': return ADDRESSES.bsc.ETH // mwbeth -> eth
      default: return token
    }
  }
  const masterChefV3 = await api.call({ abi: CakepieReaderAbi.masterChefv3, target: CakepieReader })
  const mCake = await api.call({ abi: CakepieReaderAbi.mCake, target: CakepieReader })
  const mCakeSV = await api.call({ abi: CakepieReaderAbi.mCakeSV, target: CakepieReader })
  await sumTokens2({ api, uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, PancakeStaking]], uniV3ExtraConfig: { nftIdFetcher: masterChefV3 } })
  const mCakePool = await api.call({ abi: MasterCakepieAbi.tokenToPoolInfo, target: MasterCakepieAddress, params: [mCake] })
  const mCakeSVPool = await api.call({ abi: MasterCakepieAbi.tokenToPoolInfo, target: MasterCakepieAddress, params: [mCakeSV] })
  const poolAddress = await api.fetchList({ lengthAbi: 'poolLength', itemAbi: 'poolList', target: PancakeStaking })
  //getting all pool address: 2-v2 pancakeswap, 0-stableswap pancakeswap pools
  let poolinfo = await api.multiCall({ abi: 'function pools(address) view returns(address poolAddress,address depositToken, address rewarder , address receiptToken, uint256 lastHarvestTime, uint256 poolType, uint256 v3Liquidity, bool isAmount0, bool isNative, bool isActive)', calls: poolAddress, target: PancakeStaking, })
  const sstokens = [];
  const v2tokens = [];
  const v2pools = [];
  const sspools = []
  for (let i = 0; i < poolinfo.length; i++) {
    if (poolinfo[i].poolType == 0) {
      sstokens.push(poolinfo[i].depositToken);
      sspools.push(poolinfo[i].poolAddress)
    }
    if (poolinfo[i].poolType == 2) {
      v2tokens.push(poolinfo[i].depositToken);
      v2pools.push(poolinfo[i].poolAddress)
    }
  }
  //adding tvl for stable swap pools
  for (let i = 0; i < sspools.length; i++) {
    const balance = await api.call({ abi: 'function tokenToPoolInfo(address) view returns (address stakingToken, address receiptToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accCakepiePerShare, uint256 totalStaked, address rewarder, bool isActive)', target: MasterCakepieAddress, params: sspools[i] })
    let minter = await api.call({ abi: 'address:minter', target: sstokens[i], })
    let totalsupply = await api.call({ abi: 'uint256:totalSupply', target: sstokens[i], })
    let token = await api.multiCall({ abi: 'function coins(uint256) view returns(address)', calls: [0, 1], target: minter })
    let token_balances = await api.multiCall({ abi: 'function balances(uint256) view returns(uint256)', calls: [0, 1], target: minter })
    let lp = balance.totalStaked / totalsupply

    api.add(transformToken(token[0]), lp * token_balances[0])
    api.add(transformToken(token[1]), lp * token_balances[1])
  }
  //adding tvl for v2pools of pancakeswap
  for (let i = 0; i < sspools.length; i++) {
    const balance = await api.call({ abi: 'function tokenToPoolInfo(address) view returns (address stakingToken, address receiptToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accCakepiePerShare, uint256 totalStaked, address rewarder, bool isActive)', target: MasterCakepieAddress, params: v2pools[i] })
    const totalsupply = await api.call({ abi: 'uint256:totalSupply', target: v2tokens[i], })
    let token0 = await api.call({ abi: 'address:token0', target: v2tokens[i], })
    let token1 = await api.call({ abi: 'address:token1', target: v2tokens[i], })
    const balances = await api.call({ abi: 'function getReserves() view returns(uint112 _reserve0 ,uint112 _reserve1,uint32 _blockTimestampLast)', target: v2tokens[i], })
    let lp = balance.totalStaked / totalsupply

    api.add(transformToken(token0), lp * balances._reserve0)
    api.add(transformToken(token1), lp * balances._reserve1)
  }

  api.add(CakeAddress, mCakePool.totalStaked)
  api.add(CakeAddress, mCakeSVPool.totalStaked)
}

Object.keys(config).forEach((chain) => {
  const { vlCKPAddress, CKPAddress } = config[chain];
  module.exports[chain] = {
    tvl,
  }
  if (vlCKPAddress && CKPAddress) {
    module.exports[chain].staking = staking(vlCKPAddress, CKPAddress)
  }
})