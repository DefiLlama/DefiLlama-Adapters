const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking");

const eth = {
  // tokens
  dai: ADDRESSES.ethereum.DAI,
  maha: "0x745407c86df8db893011912d3ab28e68b62e49b0",
  usdc: ADDRESSES.ethereum.USDC,
  usdt: ADDRESSES.ethereum.USDT,
  weth: ADDRESSES.ethereum.WETH,
  zai: "0x69000405f9dce69bd4cbf4f2865b79144a69bfe0",

  // pools
  zaiFraxBPCurve: "0x057c658dfbbcbb96c361fb4e66b86cca081b6c6a",
  mahaEthCurve: "0x6b7127a638edc7db04bede220c7c49930fdb4160",

  // staking contracts
  psmUSDC: '0x69000052a82e218ccb61fe6e9d7e3f87b9c5916f',
  stakedZai: '0x69000e468f7f6d6f4ed00cf46f368acdac252553',
  zaiFraxBPStaked: "0x6900066d9f8df0bfaf1e25ef89c0453e8e12373d",

};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

const collaterals = [eth.usdc, eth.usdt, eth.dai];
const pegStabilityModules = [eth.psmUSDC]

module.exports = {
  ethereum: {
    // todo add pool2
    // pool2: genericUnwrapCvxDeposit({
    //   tokensAndOwners: [
    //     [eth.zaiFraxBP, eth.zaiFraxBPStaked],
    //   ]
    // }),
    // staking: staking(eth.stakedZai, eth.zai),  // we dont staking for CDP as tokens backing the minted token is already counted towards tvl
    tvl: () => sumTokens2({ owners: pegStabilityModules, tokens: collaterals}),
  }
};
