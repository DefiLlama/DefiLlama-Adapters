const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const {
  transformFantomAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens");
const VAULT_CONTRACT_FANTOM = "0x4e332D616b5bA1eDFd87c899E534D996c336a2FC";
const DAI_ADDRSSS_FANTOM = ADDRESSES.fantom.DAI;
const VAULT_CONTRACT_POLYGON = "0x6C89E1cD0aa5F62cA2260709BC3895A4Cb735f6c";
const DAI_ADDRESS_POLYGON = ADDRESSES.polygon.DAI;

async function tvlFantom(timestamp, block, chainBlocks) {
  const balances = {};

  const transform = await transformFantomAddress();

  const balanceWithInvested = (
    await sdk.api.abi.call({
      abi: abi.balanceWithInvested,
      chain: "fantom",
      target: VAULT_CONTRACT_FANTOM,
      params: [],
      block: chainBlocks["fantom"],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    transform(DAI_ADDRSSS_FANTOM),
    balanceWithInvested
  );

  return balances;
}

async function tvlPolygon(timestamp, block, chainBlocks) {
  const balances = {};

  const transform = await transformPolygonAddress();

  const balanceWithInvested = (
    await sdk.api.abi.call({
      abi: abi.balanceWithInvested,
      chain: "polygon",
      target: VAULT_CONTRACT_POLYGON,
      params: [],
      block: chainBlocks["polygon"],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    transform(DAI_ADDRESS_POLYGON),
    balanceWithInvested
  );

  return balances;
}

module.exports = {
  hallmarks: [
    [1647907200, "Rug Pull"]
  ],
  fantom: {
    tvl: tvlFantom,
  },
  polygon: {
    tvl: tvlPolygon,
  },
};
