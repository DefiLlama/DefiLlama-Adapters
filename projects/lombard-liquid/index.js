const sdk = require("@defillama/sdk");

async function tvl(timestamp, block) {
  const lbtcAddress = "0x8236a87084f8B84306f72007F36F2618A5634494";

  const totalSupply = await sdk.api.erc20.totalSupply({
    target: lbtcAddress,
    block
  });

  return {
    bitcoin: totalSupply.output / 1e8
  };
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
  methodology: `TVL for LBTC consists of the total supply of the LBTC ERC-20 token on Ethereum, backed by locked Bitcoin`,
};