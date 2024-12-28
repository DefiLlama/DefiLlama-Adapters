const { sumTokensExport } = require('../helper/unknownTokens')

const vault = "0x7f9b09f4717072cf4dc18b95d1b09e2b30c76790"

const staking30days = "0x72f9244fe481761fa0e403e2614d487525f67375"
const staking60days = "0xf671d40a8011e7868c0a7e4ad2908bdc41c519cb"
const staking90days = "0xcD2d59d9597e782858483f3bC78FB7A9f47Df3ae"

module.exports = {
  ethereum: {    
    tvl: () => 0,
    staking: sumTokensExport({ owners: [staking30days, staking60days, staking90days], tokens: [vault] }),    
  },
  methodology:
    "Calculate the TVL of Vault-Tech staking protocol by getting the amount of $VAULT staked in the 3 pools",
};