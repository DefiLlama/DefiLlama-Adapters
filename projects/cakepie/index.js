const ADDRESSES = require('../helper/coreAssets.json')
const CakepieReaderAbi = require("./abis/CakepieReader.json");
const MasterCakepieAbi = require("./abis/MasterCakepie.json");
const config = {
    bsc: {
        MasterCakepieAddress: "0x74165b89fd8E9b91A109a4e71662f27EeBA61E98",
        // VlMGPAddress: "0x9B69b06272980FA6BAd9D88680a71e3c3BeB32c6",
        MCakeSVAddress: "0x1d7928452009e03aF2E3a2B5931d5d5876Cb0C21",
        CKPAddress: "0x2B5D9ADea07B590b638FFc165792b2C610EdA649",
        CakeAddress: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        MCakeAddress: "0x581FA684D0Ec11ccb46B1d92F1F24C8A3F95C0CA",
        PancakeStaking: "0xb47b790076050423888cde9EBB2D5Cb86544F327",
        CakepieReader: "0xc1cc256846224e8c0bA530692c338a99FbC27cB5",
        vlCKPAddress: "0x232594e7F0096ba7DDAbcD8689cB0D994694eb26"
    },
  };
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