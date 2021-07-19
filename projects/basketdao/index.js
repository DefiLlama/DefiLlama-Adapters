const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");

const bdiEthSLP = "0x8d782C5806607E9AAFB2AC38c1DA3838Edf8BD03";
const bdiToken = "0x0309c98B1bffA350bcb3F9fB9780970CA32a5060";
const bmiToken = "0x0aC00355F80E289f53BF368C9Bdb70f5c114C44B";

const bdiEthStaking = "0x2cfDBa69464acae0087476ca78B6b0025E9fc0DD";

const daiToken = '0x6b175474e89094c44da98b954eedeac495271d0f'

async function tvl(timestamp, block) {
  let balances = {};

  const dpiEthSLPLocked = sdk.api.erc20.balanceOf({
    target: bdiEthSLP,
    owner: bdiEthStaking,
    block,
  });
  const bdiSupply = sdk.api.erc20.totalSupply({
    target: bdiToken,
    block,
  });
  const bmiSupply = sdk.api.erc20.totalSupply({
    target: bmiToken,
    block,
  });

  await unwrapUniswapLPs(
    balances,
    [
      {
        token: bdiEthSLP,
        balance: (await dpiEthSLPLocked).output,
      },
    ],
    block
  );
  sdk.util.sumSingleBalance(balances, bdiToken, (await bdiSupply).output);
  sdk.util.sumSingleBalance(balances, daiToken, (await bmiSupply).output);

  return balances;
}

module.exports = {
  tvl,
};
