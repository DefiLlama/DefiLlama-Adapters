const sdk = require("@defillama/sdk");
const axios = require("axios");
const { default: BigNumber } = require("bignumber.js");
const { ethers } = require("ethers");

const optyfi_api = "https://api.opty.fi";
const get_vaults_api = `${optyfi_api}/v1/yield/vaults`;
const abi = {
  totalSupply: {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  getPricePerFullShare: {
    inputs: [],
    name: "getPricePerFullShare",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  decimals: {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
};

async function getTVL(chainName, tokenAddress, block, decimals) {
  const totalSupply = (
    await sdk.api.abi.call({
      target: tokenAddress,
      abi: abi.totalSupply,
      block,
      chain: chainName,
    })
  ).output;

  const pricePerFullShare = (
    await sdk.api.abi.call({
      target: tokenAddress,
      abi: abi.getPricePerFullShare,
      block,
      chain: chainName,
    })
  ).output;
  const convertedPricePerFullShare = ethers.utils.formatUnits(
    pricePerFullShare,
    18
  );
  const tvl = BigNumber(convertedPricePerFullShare)
    .multipliedBy(BigNumber(totalSupply))
    .toFixed(0);
  return Number(tvl);
}

async function ethereum_tvl(timestamp, block, chainBlocks) {
  const vaults = (await axios.get(get_vaults_api)).data.items;
  const balances = {};

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i];
    if (!vault.is_staging && vault.chain.chain_id === 1) {
      const tvl = await getTVL(
        vault.chain.chain_name,
        vault.vault_token.address,
        block,
        vault.vault_token.decimals
      );
      sdk.util.sumSingleBalance(
        balances,
        vault.vault_underlying_token.address,
        tvl
      );
    }
  }
  return balances;
}

async function polygon_tvl(timestamp, block, chainBlocks) {
  const vaults = (await axios.get(get_vaults_api)).data.items;
  block = chainBlocks.polygon;
  const balances = {};

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i];
    if (!vault.is_staging && vault.chain.chain_id === 137) {
      const tvl = await getTVL(
        vault.chain.chain_name,
        vault.vault_token.address,
        block,
        vault.vault_token.decimals
      );

      sdk.util.sumSingleBalance(
        balances,
        `polygon:${vault.vault_underlying_token.address}`,
        tvl
      );
    }
  }
  return balances;
}

module.exports = {
  methodology: `Users deposit into OptyFi vaults and receive vault shares. These vault shares have a price called pricePerShare. TVL is calculated as: Vault Token Supply * pricePerShare`,
  ethereum: { tvl: ethereum_tvl },
  polygon: { tvl: polygon_tvl },
};
