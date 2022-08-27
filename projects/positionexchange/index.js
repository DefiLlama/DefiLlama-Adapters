const sdk = require("@defillama/sdk");
const { masterChefExports } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const axios = require("axios");

const token = "0x5CA42204cDaa70d5c773946e69dE942b85CA6706";
const masterchef = "0x0C54B0b7d61De871dB47c3aD3F69FEB0F2C8db0B";
const treasuryAddress = "0xF7224c91BaF653ef46F498a92E2FFF35Ad0588a2";
const nftMiningProxy = "0xd8b6E267a0A46E13047056F105787dB9aFFb4b9a";

const {bsc: chefExport} = (masterChefExports(masterchef, 'bsc', token, true))

const client = axios.create({
  baseURL: "https://api.posichain.org/",
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

async function stakingPosiChain() {

  let balances = {};
  const response = await client.post('/', bodyParams("hmyv2_getAllValidatorInformation", 0));
  if (response === null || response.data === null || response.data.result === null) {
    return {output : 0}
  }

  let totalStaking = 0;
  for (let validator of response.data.result) {
    totalStaking += Number(validator["total-delegation"]);
  }

  sdk.util.sumSingleBalance(balances, `bsc:${token}`, totalStaking);
  return balances;

}
const bodyParams = (method, params) => `{
      "jsonrpc": "2.0",
      "method": "${method}",
      "params": ${params !== undefined ? `[${params}]` : '[]'},
      "id": 1
    }`;
module.exports = {
  methodology: "TVL in Binance Smart Chain is calculated by value locked in the MasterChef contract, cast NFT and treasury value is the POSI in the treasury contract. TVL in PosiChain is calculated by delegating into the validator node.",
  bsc: {
    tvl: chefExport.tvl,
    pool2: chefExport.pool2,
    staking: sdk.util.sumChainTvls([chefExport.staking, staking(nftMiningProxy, token, 'bsc')])
  },
  posichain: {
    staking: stakingPosiChain,
    tvl : stakingPosiChain
  }
};
