const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress, transformArbitrumAddress } = require("../helper/portedTokens");
const { getBlock } = require('../helper/getBlock');

const vaultsUrl = {
  "polygon": "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json",
  "arbitrum": "https://raw.githubusercontent.com/eepdev/vaults/main/arbitrum_vaults.json"
};
const current_vaults_url = "https://raw.githubusercontent.com/eepdev/vaults/main/current_vaults.json"
const polygonTvl3 = async (timestamp, block, chainBlocks) => {
  const balances = {};

  let vaults = (await utils.fetchURL(current_vaults_url)).data.filter(vault=>vault.token0!==vault.token1).map((vault) => ({
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
async function polygonTvl(timestamp, block, chainBlocks) {
  const transformAddress = await transformPolygonAddress();
  return await tvl(timestamp, 'polygon', chainBlocks, transformAddress);
};
async function arbitrumTvl(timestamp, block, chainBlocks) {
  const transformAddress = await transformArbitrumAddress();
  return await tvl(timestamp, 'arbitrum', chainBlocks, transformAddress);
}
const tvl = async (timestamp, chain, chainBlocks, transformAddress=a=>a) => {
  const block = await getBlock(timestamp, chain, chainBlocks);
  const balances = {};

  let vaults = (await utils.fetchURL(vaultsUrl[chain])).data.filter(vault=>vault.token0!==vault.token1).map((vault) => ({
    vaultAddress: vault.vaultAddress,
    lpAddress: vault.lpAddress,
  }));

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: chain,
      block: block,
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

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    transformAddress
  );

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),//, arbitrumTvl]),
  methodology: 'The current vaults on Adamant Finance are found on the Github. Once we have the vaults, we filter out the LP addresses of each vault and unwrap the LPs so that each token can be accounted for. Coingecko is used to price the tokens and the sum of all tokens is provided as the TVL'
};
// node test.js projects/adamantfinance/index.js