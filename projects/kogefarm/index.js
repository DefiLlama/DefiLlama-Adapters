const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");
const { transformAddressKF, getSinglePositions } = require("./helper.js");

const current_vaults_url = "https://raw.githubusercontent.com/kogecoin/vault-contracts/main/vaultaddresses";

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  let vaults = (await utils.fetchURL(current_vaults_url)).data;

  const lp_addresses = (
    await sdk.api.abi.multiCall({
      chain: "polygon",
      block: chainBlocks["polygon"],
      calls: vaults.map((vaultAddr) => ({
        target: vaultAddr,
      })),
      abi: abi.token,
    })
  ).output.map((val) => val.output);

  const lp_symbols = (
    await sdk.api.abi.multiCall({
      chain: "polygon",
      block: chainBlocks["polygon"],
      calls: lp_addresses.map((address) => ({
        target: address,
      })),
      abi: abi.symbol,
    })
  ).output.map((val) => val.output);

  const vault_balances = (
    await sdk.api.abi.multiCall({
      chain: "polygon",
      block: chainBlocks["polygon"],
      calls: vaults.map((vaultAddr) => ({
        target: vaultAddr,
      })),
      abi: abi.balance,
    })
  ).output.map((val) => val.output);

  const lpPositions = [];
  const singlePositions = [];

  vaults.forEach((v, idx) => {
    if (lp_symbols[idx]==='UNI-V2' || lp_symbols[idx]==='DFYNLP' | lp_symbols[idx]==='SLP'  | lp_symbols[idx]==='WLP' | lp_symbols[idx]==='pWINGS-LP' | lp_symbols[idx]==='APE-LP' | lp_symbols[idx]==='GLP' | lp_symbols[idx]==='Cafe-LP'){
      lpPositions.push({
        vaultAddr: vaults[idx],
        balance: vault_balances[idx],
        token: lp_addresses[idx],
      });
    } else if (vaults[idx] !== ''){
      singlePositions.push({
        vaultAddr: vaults[idx],
        balance: vault_balances[idx],
        token: lp_addresses[idx],
      });
    }
  });

  const transformAddress = transformAddressKF();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  );

  await getSinglePositions(
    balances,
    singlePositions,
    chainBlocks["polygon"],
    "polygon",
    transformAddress
  )

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([polygonTvl]),
};
