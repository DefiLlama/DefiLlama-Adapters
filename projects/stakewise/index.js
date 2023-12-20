const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const axios = require("axios");

const wethAddress = ADDRESSES.ethereum.WETH;

async function ethereumTvl(timestamp, block, _1, _2) {
  const tvl = (await axios.get("https://mainnet-api.stakewise.io/api/tvl")).data;
  return {
    [wethAddress]: new BigNumber(tvl)
  };
}

async function gnoTvl(timestamp, ethBlock, { xdai: block }) {
  const chain = "xdai";
  const sGNO = await sdk.api.erc20.totalSupply({
    target: "0xA4eF9Da5BA71Cc0D2e5E877a910A37eC43420445",
    block,
    chain
  });

  const rGNO = await sdk.api.erc20.totalSupply({
    target: "0x6aC78efae880282396a335CA2F79863A1e6831D4",
    block,
    chain
  });

  return {
    [ADDRESSES.ethereum.GNO]: new BigNumber(sGNO.output).plus(new BigNumber(rGNO.output))
  };
}


module.exports = {
  methodology: "Counts ETH and GNO staked",
  ethereum: {
    tvl: ethereumTvl
  },
  xdai: {
    tvl: gnoTvl
  }
};
