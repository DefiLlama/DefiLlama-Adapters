const sdk = require("@defillama/sdk");
const BigNumberJs = require("bignumber.js");
const REGISTRY_ABI = require("./abi/registry.json");

const REGISTRY_ADDRESS = "0xDA820e20A89928e43794645B9A9770057D65738B"
const POOLS = [
  {
    lptoken: "0x18BDb86E835E9952cFaA844EB923E470E832Ad58",
    kglRewards: "0xA4A8163D0C9C41a918E4218b70e7B0BE4ac81983",
  },
  {
    lptoken: "0x60811F3d54e860cDf01D72ED422a700e9cf010a9",
    kglRewards: "0x48611e9B924474F2a13b1C18E38B082099CBEF58",
  },
  {
    lptoken: "0x11baa439EFf75B80a72b889e171d6E95FB39ee11",
    kglRewards: "0x8B23ca8D0cE64e570781428a5BAb241911077934",
  },
  {
    lptoken: "0x00D41391B0d455fDAD49Bc6Fb8F590DB844403B6",
    kglRewards: "0xfe1Facac14b67685851FB5186B08d17108BC960b",
  }
];

BigNumberJs.config({ EXPONENTIAL_AT: 1e9 })

async function tvl(timestamp, block,chainBlocks) {
  let balances = {}
  for (let i=0; i < POOLS.length; i++) {
    console.log(POOLS[i])
    const { lptoken, kglRewards } = POOLS[i]
    const stakedLPTokenSupply = await sdk.api.erc20.totalSupply({
      target: kglRewards,
      block: chainBlocks['astar'],
      chain: 'astar'
    });
    console.log(stakedLPTokenSupply)
    const virtualPrice = (await sdk.api.abi.call({
      target: REGISTRY_ADDRESS, // registry address
      abi: REGISTRY_ABI["get_virtual_price_from_lp_token"],
      block: chainBlocks['astar'],
      params: lptoken,
      chain: 'astar'
    })).output
    console.log(virtualPrice)
    const balance = new BigNumberJs(stakedLPTokenSupply.output).multipliedBy(new BigNumberJs(virtualPrice))
    balances = Object.assign({ [lptoken]: balance.toString() }, balances)
  }
  // shift by decimals?
  console.log(balances)

  return balances
}

async function staking(timestamp, block, chainBlocks){
  const allCoins = {}
    const muuuStakedSupply = await sdk.api.erc20.totalSupply({
      target: "0xB2ae0CF4819f2BE89574D3dc46D481cf80C7a255", // muuuRewardsAddress,
      block: chainBlocks['astar'],
      chain: 'astar'
    });

    sdk.util.sumSingleBalance(allCoins, "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98", muuuStakedSupply.output)
    return allCoins
}

module.exports = {
  tvl,
  // staking
}
