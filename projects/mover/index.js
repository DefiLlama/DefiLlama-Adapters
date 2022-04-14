const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { ethereum } = require("../snowswap");

const treasuryContract = "0x94F748BfD1483750a7dF01aCD993213Ab64C960F";
const MOVER = "0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C";
const MOVER_WETH_SLP = "0x87b918e76c92818DB0c76a4E174447aeE6E6D23f";

const contractVaultAddresses = "0x541d78076352a884C8358a2ac3f36408b99a18dB";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const baseLedgerPool = '0x1f15F293C1Cd3d05d58d3EdeAf0C72c5A2dfeaFf';
const UBT = '0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e';

async function ethTvl(timestamp, block) {
  const balances = {};

  const lp_usdcPrice = (
    await sdk.api.abi.call({
      abi: abi.inceptionLPPriceUSDC,
      target: contractVaultAddresses,
      block
    })
  ).output;

  const lp_balance = (
    await sdk.api.abi.call({
      abi: abi.lpTokensBalance,
      target: contractVaultAddresses,
      block
    })
  ).output;

  const lpBalance_toUsdc = Number((lp_balance * lp_usdcPrice) / 1e6).toFixed(0);

  sdk.util.sumSingleBalance(balances, USDC, lpBalance_toUsdc);


  let stakedUBT = (await sdk.api.erc20.balanceOf({
    owner: baseLedgerPool,
    target: UBT,
    block
  })).output;

  sdk.util.sumSingleBalance(balances, UBT, stakedUBT);

  return balances;
}

module.exports = {
  ethereum: {
    staking: staking(treasuryContract, MOVER),
    pool2: pool2(treasuryContract, MOVER_WETH_SLP),
    tvl: ethTvl,
  },
  methodology:
    "Counts tvl of the Assets deposited through Vault Contract; also the Staking and Pool2 parts through Treasury Contract",
};
