const sdk = require("@defillama/sdk");
const abi = require("./abis/brahmafi-aastra.json");

const AASTRA = "0xc10d2e42de16719523aaa9277d1b9290aa6c3ad5";

const getTotalAmounts = async (block) => {
  const totalAmounts = await sdk.api.abi.call({
    target: AASTRA,
    abi: abi["getTotalAmounts"],
    block: block
  });

  return totalAmounts.output;
};

module.exports = {
  getTotalAmounts
};
