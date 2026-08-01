const sdk = require("@defillama/sdk");
const { masterChefExports } = require("../helper/masterchef");
const { stakings } = require("../helper/staking");

const token = "0x5CA42204cDaa70d5c773946e69dE942b85CA6706";
const masterchef = "0x0C54B0b7d61De871dB47c3aD3F69FEB0F2C8db0B";
const treasuryAddress = "0xF7224c91BaF653ef46F498a92E2FFF35Ad0588a2";
const nftMiningProxy = "0x0Fb07a8527f45d7625Ab6486718910ce44a608b5";
const newNftMintingProxy = "0xd8b6E267a0A46E13047056F105787dB9aFFb4b9a"

const {bsc: chefExport} = (masterChefExports(masterchef, 'bsc', token, true))

module.exports = {
  methodology: "TVL in Binance Smart Chain is calculated by value locked in the MasterChef contract, cast NFT and treasury value is the POSI in the treasury contract.",
  bsc: {
    tvl: chefExport.tvl,
    pool2: chefExport.pool2,
    staking: sdk.util.sumChainTvls([chefExport.staking, stakings([nftMiningProxy,newNftMintingProxy], token)])
  }
};

