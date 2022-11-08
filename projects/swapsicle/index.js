const { staking } = require("../helper/staking");
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
    stakingContract_sPOPS: "0x5108176bC1B7e72440e6B48862c51d7eB0AEd5c4",
    stakingContract_IB: "0x6aA10ead8531504a8A3B04a9BfCFd18108F2d2c2",
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

async function stakedAVAX(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks.avax;

  const avaxBalance = await iceBox(stakingContract_IB, block);
  balances[getAVAXAddress("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7")] = avaxBalance["0x0000000000000000000000000000000000000000"];
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  methodology: "",
  avax: {
    tvl: getUniTVL({ chain: 'avax', useDefaultCoreAssets: false, factory: contracts.avax.factory }),
    staking: sdk.util.sumChainTvls([
      stakingPricedLP(contracts.avax.stakingContract_sPOPS, contracts.avax.pops,'avax','0x7E454625e4bD0CFdC27e752B46bF35C6343D9A78',"wrapped-avax",true), 
      stakedAVAX
      
    ])
  },
  start: 15434772,
};
