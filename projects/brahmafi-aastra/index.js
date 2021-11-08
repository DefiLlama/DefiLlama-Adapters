const { getTotalAmounts } = require("../helper/brahmafi-aastra");

const TOKEN0 = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const TOKEN1 = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const tvl = async (timestamp, block) => {
  const totalAmounts = await getTotalAmounts(block);

  return {
    [TOKEN0]: totalAmounts[0],
    [TOKEN1]: totalAmounts[1]
  };
};

module.exports = {
  name: "Brahma.fi | Aastra",
  methodology:
    "Total amount of eth and usdc tokens in vault, total amount of these tokens present in uni v3 positions owned by the vault",
  ethereum: {
    tvl
  },
  tvl
};
