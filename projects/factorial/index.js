const { affluentMarketList, affluentTokenList } = require("./affluentMarketAssets");
const { call, processTVMSliceReadAddress, getTokenRates } = require("../helper/chain/ton");
const { get } = require('../helper/http')
const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");

const factorial_ton = "EQDIKEz2BYLnTRWo5W5a6moZ9PXNtyOVOFF7noi8Ufv3axz_";

async function tvl(api) {
  const pools = Object.keys(affluentMarketList);

  for (const pool of pools) {
    await sdk.util.sleepRandom(2000, 3000);
    const pool_data = await call({ target: pool, abi: "get_pool_data" })

    const _kv = 1;
    const assetDicIdx = 13;
    const supplyAmountIdx = 4;
    const borrowAmountIdx = 5;
    const addressIdx = 15;

    const assets = pool_data[assetDicIdx][_kv]["elements"];

    for (const asset of assets) {
      const assetInfo = asset["tuple"]["elements"];
      const supplied = assetInfo[supplyAmountIdx]["number"]["number"];
      const borrowed = assetInfo[borrowAmountIdx]["number"]["number"];
      const address = assetInfo[addressIdx]["slice"]["bytes"];

      const assetAddress = processTVMSliceReadAddress(address);
      const addressToAdd = assetAddress === factorial_ton ? ADDRESSES.ton.TON : assetAddress;

      api.add(addressToAdd, supplied - borrowed);
    };
  }
}

async function borrowed(api) {
  const pools = Object.keys(affluentMarketList);

  for (const pool of pools) {
    await sdk.util.sleepRandom(2000, 3000);
    const pool_data = await call({ target: pool, abi: "get_pool_data" })

    const _kv = 1;
    const assetDicIdx = 13;
    const borrowAmountIdx = 5;
    const addressIdx = 15;

    const assets = pool_data[assetDicIdx][_kv]["elements"];

    assets.forEach((asset) => {
      const assetInfo = asset["tuple"]["elements"];
      const borrowed = assetInfo[borrowAmountIdx]["number"]["number"];
      const address = assetInfo[addressIdx]["slice"]["bytes"];

      const assetAddress = processTVMSliceReadAddress(address);
      const addressToAdd = assetAddress === factorial_ton ? ADDRESSES.ton.TON : assetAddress;

      api.add(addressToAdd, borrowed);
    });
  }
}

module.exports = {
  methodology: 'Total amount of assets locked in Affluent pool',
  ton: { tvl, borrowed }
}

