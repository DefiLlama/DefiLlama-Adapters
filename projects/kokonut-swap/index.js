const abi = {
    "getPoolPriceInfo": "function getPoolPriceInfo(address swap) view returns (address[] tokens, uint256[] balances, uint256[] prices)",
    "getStakedEyePriceInfo": "function getStakedEyePriceInfo() view returns (uint256 balance, uint256 price)",
    "getRegisteredPools": "function getRegisteredPools() view returns (tuple(address addr,string name,string symbol,address lpTokenAddress,uint256 lpTokenVirtualPrice,uint256 lpTokenTotalSupply,uint256 adminFee,tuple(address addr,string name,string symbol,uint8 decimals,uint256 balance,uint256 nativeBalance,uint256 allowance,bool isLpToken)[] liquidity,uint256 xcpProfit,uint256 priceScale,uint256 priceOracle)[])",
    "getPoolList": "address[]:getPoolList"
  };
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL, } = require("../helper/unknownTokens");
const { getConfig } = require("../helper/cache");
const { staking } = require('../helper/staking')

async function klaytn_tvl(api) {
  const { pools } = await getConfig('kokonut-swap', 'https://prod.kokonut-api.com/pools')
  const ownerTokens = [];
  const blacklistedTokens = []
  for (const pool of pools) {
    const { address, coins, lpTokenAddress } = pool
    ownerTokens.push([coins, address])
    blacklistedTokens.push(lpTokenAddress)
  }
  return sumTokens2({ api, ownerTokens, blacklistedTokens, })
}

async function polygon_zkevm_tvl(api) {
  const ownerTokens = [];
  const poolList = await api.call({ target: "0x677bBBAd41D784a4731d902c613f8af43AAb4feb", abi: abi.getRegisteredPools, })
  for (const pool of poolList) {
    ownerTokens.push([pool.liquidity.map(t => t.addr), pool.addr]);
  }
  return sumTokens2({ api, ownerTokens });
}

const uniV2TVL = getUniTVL({ factory: '0x4Cf1284dcf30345232D5BfD8a8AAd6734b6941c4', useDefaultCoreAssets: true });

async function base_tvl(api) {
  const ownerTokens = [];
  const poolList = await api.call({ target: "0x03173F638B3046e463Ab6966107534f56E82E1F3", abi: abi.getRegisteredPools, })
  for (const pool of poolList) {
    ownerTokens.push([pool.liquidity.map(t => t.addr), pool.addr]);
  }
  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  klaytn: {
    staking: staking('0xc75456755D68058BF182BCd41c6d9650DB4ce89E', '0xcd670d77f3dcab82d43dff9bd2c4b87339fb3560'),
    tvl: klaytn_tvl
  },
  polygon_zkevm: {
    tvl: polygon_zkevm_tvl
  },
  base: {
    tvl: sdk.util.sumChainTvls([base_tvl, uniV2TVL])
  },
  methodology:
    "tvl is calculated using the total value of protocol's liquidity pool. Staked tokens include staked EYE values. Pool2 includes staked lp tokens eligible for KOKOS emissions"
};