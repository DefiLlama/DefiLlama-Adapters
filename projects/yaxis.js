const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { unwrapCrv, unwrapUniswapLPs } = require("./helper/unwrapLPs");
const { abi } = require("./yaxis/abi.js");
const constants = require("./yaxis/constants.js");

async function tvl(timestamp, block) {
  const balances = {};

  // 1. MetaVault (LEGACY v2) - LP-3POOL-CURVE
  const metaVault = (
    await sdk.api.abi.call({
      target: constants.METAVAULT,
      abi: abi.yAxisMetaVault,
      block: block,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    constants.CURRENCIES["LP-3POOL-CURVE"],
    metaVault
  );

  // 3. VAULTS

  const vaults = (
    await sdk.api.abi.multiCall({
      calls: constants.VAULTS.map(({ vaultTokenContract }) => ({
        target: vaultTokenContract,
      })),
      abi: "erc20:totalSupply",
      block: block,
    })
  ).output.map((val) => val.output);

  await Promise.all(
    constants.VAULTS.map(async (vault, index) => {
      await unwrapCrv(balances, vault.tokenContract, vaults[index]);
    })
  );

  // Add ALETH eth balance

  const alethVault = (
    await sdk.api.erc20.totalSupply({
      target: "0xeF84fAc432846Ad5f6f1bD4caCcF2849e2818e66",
      block,
    })
  ).output;

  const crvTotalSupply = (
    await sdk.api.erc20.totalSupply({
      target: "0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e",
      block,
    })
  ).output;

  const eth = (
    await sdk.api.eth.getBalance({
      target: "0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e",
      block,
    })
  ).output;

  balances["0x0000000000000000000000000000000000000000"] = BigNumber(alethVault)
    .multipliedBy(eth)
    .dividedBy(crvTotalSupply)
    .toFixed(0);

  return balances;
}

async function pool2(time, block){
  const balances = {};
    // 4. LPs
    const uniswapLPs = (
      await sdk.api.abi.multiCall({
        calls: constants.UNISWAP_LPS.map((lp) => ({
          target: lp.address,
          params: [lp.staking]
        })),
        abi: "erc20:balanceOf",
        block: block,
      })
    ).output.map((val) => val.output);
  
    const lpPositions = [];
  
    constants.UNISWAP_LPS.forEach((lp, index) => {
      lpPositions.push({
        balance: uniswapLPs[index],
        token: lp.address,
      });
    });
  
    await unwrapUniswapLPs(balances, lpPositions, block);

    return balances
}

async function staking(time, block){
  const balances = {};

    // 2. sYAX (LEGACY v1) - YAXIS
    const sYAX = (
      await sdk.api.abi.call({
        target: constants.BAR,
        abi: abi.yAxisBar,
        block: block,
      })
    ).output;
  
    sdk.util.sumSingleBalance(balances, constants.CURRENCIES["YAXIS"], sYAX);
  
    // sYAXIS (LEGACY v2) - YAXIS
    const sYAXIS = (
      await sdk.api.erc20.totalSupply({
        target: constants.STAKING.YAXIS,
        block,
      })
    ).output;
  
    sdk.util.sumSingleBalance(balances, constants.CURRENCIES["YAXIS"], sYAXIS);
  
    //  Voting Escrow (v3) - YAXIS
    const veYAXIS = (
      await sdk.api.abi.call({
        target: constants.VOTING_ESCROW,
        abi: abi.votingEscrow,
        block,
      })
    ).output;
  
    sdk.util.sumSingleBalance(balances, constants.CURRENCIES["YAXIS"], veYAXIS);

      // Add YAXIS vault
  const yaxisVault = (
    await sdk.api.erc20.totalSupply({
      target: constants.YAXIS_GAUGE,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    constants.CURRENCIES["YAXIS"],
    yaxisVault
  );

  return balances
}

module.exports = {
  ethereum: {
    tvl,
    staking,
    pool2
  },
  start: 1600185600, // 09/16/2020 @ 12:00am (UTC+8)
};
