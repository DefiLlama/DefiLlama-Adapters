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
  const ssPoolInfo = await api.multiCall({ abi: 'function tokenToPoolInfo(address) view returns (address stakingToken, address receiptToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accCakepiePerShare, uint256 totalStaked, address rewarder, bool isActive)', target: MasterCakepieAddress, calls: sspools })
  const ssMinters = await api.multiCall({ abi: 'address:minter', calls: sstokens })
  const ssTotalSupply = await api.multiCall({ abi: 'uint256:totalSupply', calls: sstokens })
  const ssToken0 = await api.multiCall({ abi: 'function coins(uint256) view returns(address)', calls: ssMinters.map(target => ({ target, params: [0] })) })
  const ssToken1 = await api.multiCall({ abi: 'function coins(uint256) view returns(address)', calls: ssMinters.map(target => ({ target, params: [1] })) })
  const ssBalance0 = await api.multiCall({ abi: 'function balances(uint256) view returns(uint256)', calls: ssMinters.map(target => ({ target, params: [0] })) })
  const ssBalance1 = await api.multiCall({ abi: 'function balances(uint256) view returns(uint256)', calls: ssMinters.map(target => ({ target, params: [1] })) })
  for (let i = 0; i < sspools.length; i++) {
    let lp = ssPoolInfo[i].totalStaked / ssTotalSupply[i]
    api.add(transformToken(ssToken0[i]), lp * ssBalance0[i])
    api.add(transformToken(ssToken1[i]), lp * ssBalance1[i])
  }
  //adding tvl for v2pools of pancakeswap
  const v2PoolInfo = await api.multiCall({ abi: 'function tokenToPoolInfo(address) view returns (address stakingToken, address receiptToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accCakepiePerShare, uint256 totalStaked, address rewarder, bool isActive)', target: MasterCakepieAddress, calls: v2pools })
  const v2TotalSupply = await api.multiCall({ abi: 'uint256:totalSupply', calls: v2tokens })
  const v2Token0 = await api.multiCall({ abi: 'address:token0', calls: v2tokens })
  const v2Token1 = await api.multiCall({ abi: 'address:token1', calls: v2tokens })
  const v2Reserves = await api.multiCall({ abi: 'function getReserves() view returns(uint112 _reserve0 ,uint112 _reserve1,uint32 _blockTimestampLast)', calls: v2tokens })
  for (let i = 0; i < v2pools.length; i++) {
    let lp = v2PoolInfo[i].totalStaked / v2TotalSupply[i]
    api.add(transformToken(v2Token0[i]), lp * v2Reserves[i]._reserve0)
    api.add(transformToken(v2Token1[i]), lp * v2Reserves[i]._reserve1)
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