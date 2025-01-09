const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");
const { sumTokens2 } = require("../helper/unwrapLPs");

// sonic
const sonicVault = "0xe9263682E837eFabb145f8C632B9d2c518D90652";
const sonicStaking = "0xEF8770E9506a8D1aAE3D599327a39Cf14B6B3dc4";
const sonicNAVI = "0x6881B80ea7C858E4aEEf63893e18a8A36f3682f3";

// sonicV2
const sonicV2Vault = "0x41cD8CaFc24A771031B9eB9C57cFC94D86045eB6";
const sonicV2Assets = ["0x29219dd400f2bf60e5a23d13be72b486d4038894"]

const tvl = async (api) => {
  await Promise.all([
    gmxExports({ vault: sonicVault })(api),
    sumTokens2({ api, tokens: sonicV2Assets, owner: sonicV2Vault })])
};

module.exports = {
  sonic: { 
    tvl,
    staking: staking(sonicStaking, sonicNAVI)
   }
}
