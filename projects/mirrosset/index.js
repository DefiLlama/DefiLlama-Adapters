const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')
const USDC = ADDRESSES.telos.ETH
const mUSDC = "0x79568bEfa9bF339e76bE12813cf7430018E1AB58"
const MortgagePool = "0xA6d5df932FFE35810389e00D1A3a698a44A14E85"
const InsurancePool = "0x587Abb291379Ea84AcE583aB07A13109b9B3F347"

module.exports = {
    kava: {
      tvl: sumTokensExport({ tokensAndOwners: [
        [USDC, InsurancePool],
        // [mUSDC, InsurancePool], // you cant count your own tokens as your tvl
        [nullAddress, MortgagePool],
      ]}),
    },
  }