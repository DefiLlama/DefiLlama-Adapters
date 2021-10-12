const sdk = require("@defillama/sdk");

const dpiAddress = "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b";
const ethFliAddress = "0xaa6e8127831c9de45ae56bb1b0d4d4da6e5665bd";
const mviAddress = "0x72e364f2abdc788b7e918bc238b21f109cd634d7";
const cgiAddress = "0xada0a1202462085999652dc5310a7a9e2bf3ed42";
const btcFliAddress = "0x0b498ff89709d3838a063f1dfa463091f9801c2b";
const bedAddress = "0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6";
const dataAddress = "0x33d63Ba1E57E54779F7dDAeaA7109349344cf5F1";
const tokens = [
  dpiAddress,
  ethFliAddress,
  mviAddress,
  cgiAddress,
  btcFliAddress,
  bedAddress,
  dataAddress,
];

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
