const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

const current_vaults_url =
  "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json";

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  let vaults = (await utils.fetchURL(current_vaults_url)).data.filter(vault=>vault.token0!==vault.lpAddress).map((vault) => ({
    vaultAddress: vault.vaultAddress,
    lpAddress: vault.lpAddress,
  }));

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: "polygon",
      block: chainBlocks["polygon"],
      calls: vaults.map((vault) => ({
        target: vault.vaultAddress,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output);

  const lpPositions = [];

  vaults.forEach((v, idx) => {
    lpPositions.push({
      balance: vault_balances[idx],
      token: v.lpAddress,
    });
  });

  const transformAddress = await transformPolygonAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
};
