const sdk = require("@defillama/sdk");

const INDEX = "0xF17A3fE536F8F7847F1385ec1bC967b2Ca9caE8D";

async function tvl(_, block, _cb) {
  const balances = {}
  const supply = await sdk.api2.abi.call({ abi: 'uint256:totalSupply', target: INDEX, block })
  sdk.util.sumSingleBalance(balances, INDEX, supply, 'ethereum')
  return balances
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology:
    "Data is retrieved from calculation of market price and total supply",
  ethereum: {
    tvl,
  },
};
