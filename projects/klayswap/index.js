const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens');
const kslp = require('../helper/abis/kslp');
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { uniV3Export } = require("../helper/uniswapV3");
const { getLogs } = require('../helper/cache/getLogs')

const singlePoolFactory = '0xD1890D8F02F4C63553658ba49C53A82eb84009e6'

async function singlePoolTvl(_, _b, _cb, { api, }) {
  const pools = await api.fetchList({ lengthAbi: 'uint8:getPoolCount', itemAbi: 'function getPoolAddressByIndex(uint idx) public view returns (address)', target: singlePoolFactory })
  const tokens = await api.multiCall({ abi: 'address:token', calls: pools })
  const toa = tokens.map((val, i) => ([val, pools[i]]))

  return sumTokens2({ api, tokensAndOwners: toa})
}

const dexTVL = getUniTVL({
  useDefaultCoreAssets: true,
  factory: ADDRESSES.klaytn.KSP,
  abis: {
    allPairsLength: kslp.getPoolCount,
    allPairs: kslp.pools,
    token0: kslp.tokenA,
    token1: kslp.tokenB,
    getReserves: kslp.getCurrentPool,
  },
  exports
})

async function v3Tvl(_, _b, _cb, { api, }){
  const factory= '0xA15Be7e90df29A4aeaD0C7Fc86f7a9fBe6502Ac9';
  const wklay = '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432';
  const klay = '0x0000000000000000000000000000000000000000';

  const fromBlock= 124342981;
  const eventAbi='event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool, uint256 exid)';
  const topics =[
    '0x20a108faf9dc51ca2b459a109d08568e65a9cb87569b6b3a334c275d504ff94f',
  ];

  const logs = await getLogs({
    api,
    target:factory,
    topics,
    fromBlock,
    eventAbi,
    onlyArgs: true,
  })

  return sumTokens2({ api, ownerTokens: logs.map(i =>{
    return [[(i.token0.toLowerCase()==wklay)?klay:i.token0, i.token1], i.pool]
  } ), })
}

module.exports = {
  methodology: 'TVL counts the liquidity of KlaySwap DEX and staking counts the KSP that has been staked',
  klaytn: {
    tvl: sdk.util.sumChainTvls([singlePoolTvl,dexTVL,v3Tvl]),
    staking: staking('0x2f3713f388bc4b8b364a7a2d8d57c5ff4e054830', ADDRESSES.klaytn.KSP)
  },
  misrepresentedTokens: true,
}
