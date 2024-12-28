const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require("../helper/staking");

const stakingContract = "0x9154c2684aeF8d106babcB19Aa81d4FabF7581ec";
const BURGER = "0xae9269f27437f0fcbc232d39ec814844a51d6b8f";

const Factory = "0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256";
const WBNB = ADDRESSES.bsc.WBNB;

const shackChef = "0x07dE034A0Fc0DA7a0bf703F6DcA7025bcD61BA3e";

async function bscShackTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: shackChef,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  for (let i = 0; i <= poolLength; i++) {
    const tokenDeposited = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: shackChef,
        params: i,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output.depositToken;

    const balanceDeposited = (
      await sdk.api.abi.call({
        abi: abi.getDepositTokenSupply,
        target: shackChef,
        params: i,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    sdk.util.sumSingleBalance(
      balances,
      `bsc:${tokenDeposited}`,
      balanceDeposited
    );
  }

  return balances;
}

const bscDexTvl = getUniTVL({ factory: Factory, useDefaultCoreAssets: true, })

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([bscDexTvl, bscShackTvl]),
    staking: staking(stakingContract, BURGER),
  },
  methodology:
    "TVL is equal to AMMs liquidity plus the Assets deposited on Burger Shack",
};
