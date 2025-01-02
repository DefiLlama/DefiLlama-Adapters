const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require("../helper/staking")
const sdk = require("@defillama/sdk")
const iceBoxABI = require("./iceBoxABI.json");
const iceVaultABI = require("./icevaultABI.json");

const WAVAX = ADDRESSES.avax.WAVAX
//const WTLOS = ADDRESSES.telos.WTLOS

const contracts = {
  avax: {
    factory: "0x9c60c867ce07a3c403e2598388673c10259ec768",
    pops: "0x240248628B7B6850352764C5dFa50D1592A033A8",
    usdc: ADDRESSES.avax.USDC,
    stakingContract_sPOPS: "0x5108176bC1B7e72440e6B48862c51d7eB0AEd5c4",
    stakingContract_IB: "0x6aA10ead8531504a8A3B04a9BfCFd18108F2d2c2",
    stakingContract_IB2: "0x737CAE995aCec229a6958B49f6d3eB9F383480Ab",
    stakingContract_IV: "0x2626658BB9186B22C798Ea85A4623C2c1eBa2901",
  },
  polygon: {
    factory: "0x735ab9808d792B5c8B54e31196c011c26C08b4ce"
  },
  bsc: {
    factory: "0xEe673452BD981966d4799c865a96e0b92A8d0E45"
  },
  fantom: {
    factory: "0x98F23162E3a7FE610aC89C88E4217a599A15858F"
  },
  arbitrum: {
    factory: "0x2f0c7c98462651bb2102f6cd05acdad333e031b0"
  },
  ethereum: {
    factory: "0x2f0c7c98462651bb2102f6cd05acdad333e031b0"
  },
  optimism: {
    factory: "0x2f0c7c98462651bb2102f6cd05acdad333e031b0"
  },
  telos: {
    factory: "0xB630F53DF13645BFF0Ef55eB44a8a490a7DD4514",
    stakingContract_sPOPS: "0x14e374cef17d800109710aa2c2d73e50db76d367",
    stakingContract_IB: '0xac448d75e945923b176ebca4ff2b5a82de73f812',
    stakingContract_IB2: '0x08010b76d4b03cabcfb0f6ba9db7de8336c715fe',
    stakingContract_NFT: '0x552fd5743432eC2dAe222531e8b88bf7d2410FBc',
    pops: "0x173fd7434b8b50df08e3298f173487ebdb35fd14",
    stlos: ADDRESSES.telos.STLOS
  }
}

function getAVAXAddress(address) {
  return `avax:${address}`;
}

function getTLOSAddress(address) {
  return `telos:${address}`;
}

// AVAX (ETH) staking product
async function iceBox(contract, block, chain) {
  let balances = {
    [ADDRESSES.null]: (
      await sdk.api.eth.getBalance({ target: contract, block, chain: chain })
    ).output,
  };
  return balances;
}

// Avalanche - IceVault Staking (USDC)
async function stakedUSDC(timestamp, _, { avax: block }) {
  const balances = {};

  const tokenBalance = await sdk.api.abi.call({
    target: contracts.avax.stakingContract_IV,
    abi: iceVaultABI.totalStaked,
    chain: "avax", block,
  });

  balances[getAVAXAddress(contracts.avax.usdc)] = tokenBalance.output;

  return balances;
}

async function stakedAVAXIceBox(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks.avax;

  const ibBalance = await iceBox(contracts.avax.stakingContract_IB, block, 'avax');
  balances[getAVAXAddress(WAVAX)] = ibBalance[ADDRESSES.null];

  return balances;
}

async function stakedAVAXIceBox2(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks.avax;

  const ibBalance2 = await iceBox(contracts.avax.stakingContract_IB2, block, 'avax');
  balances[getAVAXAddress(WAVAX)] = ibBalance2[ADDRESSES.null]

  return balances;
}

async function stakedTLOSIceBox(timestamp, _, { telos: block }) {
  const balances = {};
  const stakedSTLOS = await sdk.api.abi.call({
      target: contracts.telos.stakingContract_IB2,
      abi: iceBoxABI.totalPrimaryStaked,
      chain: "telos", block,
  });

  balances[getTLOSAddress(contracts.telos.stlos)] = stakedSTLOS.output;
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "",
  avax: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.avax.factory }),
    staking: sdk.util.sumChainTvls([
      // Ice Cream Van
      stakingPricedLP(contracts.telos.stakingContract_sPOPS, contracts.avax.pops,'avax','0x7E454625e4bD0CFdC27e752B46bF35C6343D9A78',"wrapped-avax",true), 
      // Ice Box
      stakedAVAXIceBox,
      stakedAVAXIceBox2,
      // IceVault
      stakedUSDC,
      stakingPricedLP(contracts.avax.stakingContract_IV, contracts.avax.pops,'avax','0x7E454625e4bD0CFdC27e752B46bF35C6343D9A78',"wrapped-avax",true)
    ])
  },
  polygon: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.polygon.factory }),
  },
  bsc: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.bsc.factory }),
  },
  fantom: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.fantom.factory }),
  },
  arbitrum: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.arbitrum.factory }),
  },
  ethereum: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.ethereum.factory }),
  },
  optimism: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.optimism.factory }),
  },
  telos: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.telos.factory }),
    staking: sdk.util.sumChainTvls([
      // Ice Cream Van
      stakingPricedLP(contracts.telos.stakingContract_sPOPS, contracts.telos.pops,'telos','0x6dee26f527adb0c24fef704228d8e458b46f9f5f',"wrapped-telos",true), 
      // NFT's
      stakingPricedLP(contracts.telos.stakingContract_NFT, contracts.telos.pops,'telos','0x6dee26f527adb0c24fef704228d8e458b46f9f5f',"wrapped-telos",true), 
      // Ice Box
      stakedTLOSIceBox
   ])
  },
}
