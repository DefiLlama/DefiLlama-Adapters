const axios = require("axios");
const sdk = require('@defillama/sdk');

const { addFraxVaultToTVL } = require("./fraxVault");
const { staking } = require("../helper/staking");

const getVaultsAbi = 'address[]:getRegisteredAddresses';
const getAssetAbi = 'address:asset';
const getTotalAssets = 'uint256:totalAssets';

// these vaults were not added to the registry.
// So we add them manually to the list of frax lock vaults
const fraxLockVaultsNotRegistered = [
  "0x44a7b29335cfc61C2bEA1c48710A1fE11f4aFBa9",
  "0x1F0a3bF1e4Ea8f27449AFa0a3A27eFc3817431fc",
  "0xDc5Ed7b972710594082479AF498B1dA02d03a273",
];

function getTVL(chain = undefined) {
  return async (timestamp, block, chainBlocks, { api }) => {
    let balances = {};
    const { data } = await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/${CHAIN_TO_ID[chain]}.json`);
    let vaultAddresses = Object.keys(data);
    if (chain === "arbitrum") {
      let fraxLockVaults = await api.call({ target: "0x25172C73958064f9ABc757ffc63EB859D7dc2219", abi: getVaultsAbi });
      fraxLockVaults = fraxLockVaults.concat(fraxLockVaultsNotRegistered);
      vaultAddresses = vaultAddresses.filter((address) => !fraxLockVaults.includes(address));
      await addFraxVaultToTVL(balances, api);
    }
    const assets = await api.multiCall({ abi: getAssetAbi, calls: vaultAddresses, });
    const totalAssets = await api.multiCall({ abi: getTotalAssets, calls: vaultAddresses, });

    assets.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, totalAssets[i], api.chain))



    return balances;
  }
}

const CHAIN_TO_ID = {
  "ethereum": 1,
  "optimism": 10,
  "polygon": 137,
  "arbitrum": 42161,
  "bsc": 56,
};

const veVCX = "0x0aB4bC35Ef33089B9082Ca7BB8657D7c4E819a1A";
const WETH_VCX_BAL_LP_TOKEN = "0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920";

module.exports = {
  timetravel: true,
  methodology: ``,
  ethereum: {
    start: 12237585,
    staking: staking(veVCX, WETH_VCX_BAL_LP_TOKEN),
    tvl: getTVL('ethereum'),
  },
  bsc: {
    tvl: getTVL('bsc'),
  },
  polygon: {
    tvl: getTVL('polygon'),
  },
  arbitrum: {
    tvl: getTVL('arbitrum'),
  },
  optimism: {
    tvl: getTVL('optimism'),
  }
};