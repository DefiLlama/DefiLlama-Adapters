const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const TRICRYPTO_VAULT = "0x1d42783E7eeacae12EbC315D1D2D0E3C6230a068";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const abi = require('./tricrypto-vault.json');

const arbitrumTvl = async (timestamp, ethBlock, { arbitrum: block }) => {
  const balances = {};
  const transform = await transformArbitrumAddress();

  const collateralBalance = (
    await sdk.api.abi.call({
      abi,
      chain: "arbitrum",
      target: TRICRYPTO_VAULT,
      params: [],
      block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, transform(USDC), collateralBalance);
  return balances;
};

module.exports = {
  arbitrum: {
    tvl: arbitrumTvl,
  },
};
