const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const {
  transformFantomAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens");
const VAULT_CONTRACT_FANTOM = "0x4e332D616b5bA1eDFd87c899E534D996c336a2FC";
const DAI_ADDRSSS_FANTOM = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E";
const VAULT_CONTRACT_POLYGON = "0x6C89E1cD0aa5F62cA2260709BC3895A4Cb735f6c";
const DAI_ADDRESS_POLYGON = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";

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
  fantom: {
    tvl: tvlFantom,
  },
  polygon: {
    tvl: tvlPolygon,
  },
};
