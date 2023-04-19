const sdk = require("@defillama/sdk");
const get_virtual_price = "function get_virtual_price() view returns (uint256)";
const { ZERO } = require("../helper/ankr/utils");
const { default: BigNumber } = require("bignumber.js");

const getPrice = async (tokenAddress, block) => {
  try {
    const priceLpWei = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: get_virtual_price,
        block: block,
        chain: "arbitrum",
      })
    ).output;

    const decimals = (
      await sdk.api.abi.call({
        target: tokenAddress,
        abi: "erc20:decimals",
        chain: "arbitrum",
        block,
      })
    ).output;

    const tokenPrice = new BigNumber(priceLpWei).div(`1e${decimals}`);

    return {
      price: tokenPrice,
      decimals,
    };
  } catch (e) {
    return {
      price: ZERO,
      decimals: 0,
    };
  }
};

module.exports = {
  getPrice,
};
