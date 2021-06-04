const sdk = require('@defillama/sdk');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

// Treasury TVL consists of DAI balance + Sushi SLP balance
async function tvl(timestamp, block) {
  const treasuryAddresses = ["0x886CE997aa9ee4F8c2282E182aB72A705762399D", "0x31F8Cc382c9898b273eff4e0b7626a6987C846E8"];
  const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const ohm = "0x383518188c0c6d7730d91b2c03a03c837814a899";
  const slp = "0x34d7d7aaf50ad4944b70b320acb24c95fa2def7c";
  const balances = {}

  for (const treasuryAddress of treasuryAddresses) {
    // Calculate how much DAI the treasury has.
    const treasuryDai = (
      await sdk.api.erc20.balanceOf({ target: dai, owner: treasuryAddress, block })
    ).output;
    sdk.util.sumSingleBalance(balances, dai, treasuryDai)

    // Calculate Protocol-owned liquidity from SLP.
    const treasurySlpBalance = (
      await sdk.api.erc20.balanceOf({ target: slp, owner: treasuryAddress, block })
    ).output;

    await unwrapUniswapLPs(balances, [{
      token: slp,
      balance: treasurySlpBalance
    }], block)
  }

  return balances
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  tvl
}
