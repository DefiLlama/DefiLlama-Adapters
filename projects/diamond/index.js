const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const ethVault = "0xad48a8261b0690c71b70115035eb14afd9a43242";
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

async function ethTvl(block) {
  return {
    [weth]: (
      (await
        await sdk.api.abi.call({
          target: ethVault,
          block,
          abi: abi.totalAsset,
          chain: "ethereum",
        })
      ).output
    )
  }
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
};