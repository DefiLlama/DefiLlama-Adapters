const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const BRIDGE_ADDRESS = "0x0b8c93c6aaeabfdf7845786188727aa04100cb61";

function chainTvl(chain) {
  return async (timestamp, block, chainBlocks) => {
    const collateralBalance = (
      await sdk.api.abi.call({
        abi: abi["getAllWhitelistedTokenNames"],
        chain: "ethereum",
        target: CONTRACT_ADDRESS,
        params: [],
        block: chainBlocks["ethereum"],
      })
    ).output;

    console.log(collateralBalance);

    return 0.1;
  };
}

module.exports = {
  ethereum: {
    tvl: chainTvl("ethereum"),
  },
};
