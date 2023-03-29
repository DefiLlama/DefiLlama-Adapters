const sdk = require("@defillama/sdk");

const ponyAddress = "0x0D97Fee619d955509e54B046c9992B6E9F5B0630";
const tokens = [ponyAddress];

async function tvl(timestamp, block) {
  const calls = tokens.map((token) => ({
    target: token,
  }));
  const totalSupplies = await sdk.api.abi.multiCall({
    block,
    calls,
    abi: "erc20:totalSupply",
  });
  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, totalSupplies);
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};
