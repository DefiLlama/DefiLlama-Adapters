const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const config = {
  bsc: {
    tvl: { tokensAndOwners: [[ADDRESSES.bsc.USDC, "0x99f29c537c70897f60c9774d3f13bd081D423467"]] },
    staking: { tokensAndOwners: [["0xcd40f2670cf58720b694968698a5514e924f742d", "0x636f9d2Bb973D2E54d2577b9976DedFDc21E6672",]] },
    pool2: { tokensAndOwners: [["0x3c2c77353E2F6AC1578807b6b2336Bf3a3CbB014", "0xA3Fc4F2D307d8202468a223f35Bba978114A994C",],], resolveLP: true },
  },
  avax: {
    tvl: { tokensAndOwners: [[ADDRESSES.avax.USDC_e, "0x6a165bA195D9d331b2A1C9648328d409aA599465"]] },
    staking: { tokensAndOwners: [["0xB0a6e056B587D0a85640b39b1cB44086F7a26A1E", "0xd0A145aF8F200Fc8e4d118c6e4d4a77eE1ba8E2e",]] },
    pool2: { tokensAndOwners: [["0xBAe8Ee2D95Aa5c68Fe8373Cd0208227E94075D5d", "0x8fD9f9AEd3a1a823693580CCcf482A04Db2Ad4f3",],], resolveLP: true },
  },
}

Object.keys(config).forEach(chain => {
  const _config = config[chain]
  module.exports[chain] = {}
  Object.keys(_config).forEach(key => module.exports[chain][key] = sumTokensExport(_config[key]))
})
