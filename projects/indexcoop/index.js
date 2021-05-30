const sdk = require("@defillama/sdk");

const dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b";
const ethFliAddress = "0xaa6e8127831c9de45ae56bb1b0d4d4da6e5665bd";
const mviAddress = "0x72e364f2abdc788b7e918bc238b21f109cd634d7";
const btcFliAddress = "0x0b498ff89709d3838a063f1dfa463091f9801c2b";
const tokens = [dpiAddress, ethFliAddress, mviAddress, btcFliAddress];

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
  tvl,
};
