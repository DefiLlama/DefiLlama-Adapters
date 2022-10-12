const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");

async function getTokenDecimalsAndValue1e18(normalResults) {
  let tokenDecimals = {};
  let tokenValuePer1e18 = {};

  await Promise.all(
    normalResults.map(async (normalResult) => {
      const decimals = (
        await sdk.api.erc20.decimals(normalResult.token, "avax")
      ).output;
      tokenDecimals[normalResult.token] = decimals;
      tokenValuePer1e18[normalResult.token] = normalResult.valuePer1e18;
    })
  );

  return { tokenDecimals, tokenValuePer1e18 };
}
module.exports = {
  getTokenDecimalsAndValue1e18: getTokenDecimalsAndValue1e18,
};
