const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require("../helper/staking");

const stakingContract = "0x9154c2684aeF8d106babcB19Aa81d4FabF7581ec";
const BURGER = "0xae9269f27437f0fcbc232d39ec814844a51d6b8f";

const Factory = "0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256";
const shackChef = "0x07dE034A0Fc0DA7a0bf703F6DcA7025bcD61BA3e";

async function bscShackTvl(api) { // excluding this because it is not clear where the staked tokens are kept
  const poolInfos = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: shackChef})
  const bals = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.getDepositTokenSupply, target: shackChef})
  const tokens = poolInfos.map(i => i.depositToken)
  api.add(tokens, bals)
  return api.getBalances()
}

const bscDexTvl = getUniTVL({ factory: Factory, useDefaultCoreAssets: true, })

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([, bscDexTvl]),
    staking: staking(stakingContract, BURGER),
  },
  methodology:
    "TVL is equal to AMMs liquidity plus the Assets deposited on Burger Shack",
};
