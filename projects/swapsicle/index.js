const { staking } = require("../helper/staking");
const { ethers } = require("ethers");
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require("../helper/staking")
const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js");

const stakingContract_IB = "0x6aA10ead8531504a8A3B04a9BfCFd18108F2d2c2";
const WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'

const contracts = {
  avax: {
    factory: "0x9c60c867ce07a3c403e2598388673c10259ec768",
    pops: "0x240248628B7B6850352764C5dFa50D1592A033A8",
    usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    stakingContract_sPOPS: "0x5108176bC1B7e72440e6B48862c51d7eB0AEd5c4",
    stakingContract_IB: "0x6aA10ead8531504a8A3B04a9BfCFd18108F2d2c2",
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
  }
};

function getAVAXAddress(address) {
  return `avax:${address}`;
}

// AVAX (ETH) staking product
async function iceBox(contract, block) {
  let balances = {
    "0x0000000000000000000000000000000000000000": (
      await sdk.api.eth.getBalance({ target: contract, block, chain: "avax" })
    ).output,
  };
  return balances;
};

// USDC + POPS staking product
async function stakedUSDC(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const tokenBalance = new BigNumber(
    (
      await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        chain: "avax",
        target: contracts.avax.usdc,
        params: [contracts.avax.stakingContract_IV],
        block: chainBlocks["avax"],
      })
    ).output
  );

  balances[getAVAXAddress(contracts.avax.usdc)] = tokenBalance;

  return balances;
}

async function stakedAVAX(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks.avax;

  const ibBalance = await iceBox(stakingContract_IB, block);
  balances[getAVAXAddress("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7")] = ibBalance["0x0000000000000000000000000000000000000000"];
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  methodology: "",
  avax: {
    tvl: getUniTVL({ chain: 'avax', useDefaultCoreAssets: true, factory: contracts.avax.factory }),
    staking: sdk.util.sumChainTvls([
      // Ice Cream Van
      stakingPricedLP(contracts.avax.stakingContract_sPOPS, contracts.avax.pops,'avax','0x7E454625e4bD0CFdC27e752B46bF35C6343D9A78',"wrapped-avax",true), 
      // Ice Box
      stakedAVAX,
      // IceVault
      stakedUSDC,
      stakingPricedLP(contracts.avax.stakingContract_IV, contracts.avax.pops,'avax','0x7E454625e4bD0CFdC27e752B46bF35C6343D9A78',"wrapped-avax",true)
    ])
  },
  polygon: {
    tvl: getUniTVL({ chain: 'polygon', useDefaultCoreAssets: true, factory: contracts.polygon.factory }),
  },
  bsc: {
    tvl: getUniTVL({ chain: 'bsc', useDefaultCoreAssets: true, factory: contracts.bsc.factory }),
  },
  fantom: {
    tvl: getUniTVL({ chain: 'fantom', useDefaultCoreAssets: true, factory: contracts.fantom.factory }),
  },
  arbitrum: {
    tvl: getUniTVL({ chain: 'arbitrum', useDefaultCoreAssets: true, factory: contracts.arbitrum.factory }),
  },
  ethereum: {
    tvl: getUniTVL({ chain: 'ethereum', useDefaultCoreAssets: true, factory: contracts.ethereum.factory }),
  },
  optimism: {
    tvl: getUniTVL({ chain: 'optimism', useDefaultCoreAssets: true, factory: contracts.optimism.factory }),
  },
  start: 15434772,
};
