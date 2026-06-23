const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const GATEWAY = "0x149c4DD9A1f2A4de605bE2b63d60540A8865a288"
const SVAULT = "0x305a2694dD75ecb7D6ACbf0Efcd55278c992eEB9"
const SYFManager = "0x92A9C92C215092720C731c96D4Ff508c831a714f"

const MorphoStrategy_ETH = "0x0E41e3Df9A6F6cB3fC81c8669e5AcA716EceB8D1"
const MorphoVault_WETH = "0x9a8bC3B04b7f3D87cfC09ba407dCED575f2d61D8"

const SUSDE = ADDRESSES.ethereum.sUSDe; // Ethena's sUSDe

const ETH = ADDRESSES.null
const USDT = ADDRESSES.ethereum.USDT
const USDC = ADDRESSES.ethereum.USDC

const owners = [GATEWAY, SVAULT, SYFManager, MorphoStrategy_ETH]
const tokens = [ETH, USDT, USDC]


async function getMorphoTvl(balances, owner, vault, underlyingAsset, chain, block) {
  await sumTokens2({
    balances,
    owner,
    tokens: [vault],
    chain,
    block,
  });
}

async function tvl(_, _1, _2, { chain, block }) {
  const balances = {};

  await sumTokens2({
    owners,
    tokens,
    chain,
    block,
    balances,
  });
  
  await getMorphoTvl(balances, MorphoStrategy_ETH, MorphoVault_WETH, ETH, chain, block);

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};