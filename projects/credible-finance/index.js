const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const credibleContract = "0x907F40d1D6649810E0C6C2Af5e0d42c7C10ad295";

const supportedTokens = [
  "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e",
  "0x9cc1d782e6dfe5936204c3295cb430e641dcf300",
  ADDRESSES.sseed.oUSDT,
  "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
];

async function tvl(api) {
  return sumTokens2({ tokens: supportedTokens, owner: credibleContract, api });
}

module.exports = {
  methodology: "TVL is calculated as all token balances held in Credible Finance's lending contract on 0G Chain, representing all deposits available for lending.",
  "0g": {
    tvl,
  },
};
