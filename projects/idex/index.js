/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const { getAssets } = require("./api");

const IDEX_CUSTODY_CONTRACT = "0xE5c405C5578d84c5231D3a9a29Ef4374423fA0c2";

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  const assets = await getAssets();

  const balances = {
    "0x0000000000000000000000000000000000000000": (
      await sdk.api.eth.getBalance({ target: IDEX_CUSTODY_CONTRACT, block })
    ).output
  };

  const assetBalancesResult = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    block,
    calls: assets.reduce((arr, asset) => {
      if (asset.symbol !== "ETH") {
        arr.push({
          target: asset.contractAddress,
          params: IDEX_CUSTODY_CONTRACT,
        });
      }
      return arr;
    }, []),
  });

  sdk.util.sumMultiBalanceOf(balances, assetBalancesResult);

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  start: 1603166400, // unix timestamp (utc 0) specifying when the project began, 10-20-2020 UTC 0:00:00
  tvl, // tvl adapter
};
