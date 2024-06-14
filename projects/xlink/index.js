const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  methodology: "TVL of XLink is the sum of the tokens locked in its contracts",
  timetravel: false,
};

const config = {
  bitcoin: {
    owners:
      [
        'bc1q9hs56nskqsxmgend4w0823lmef33sux6p8rzlp',
        '32jbimS6dwSEebMb5RyjGxcmRoZEC5rFrS',
        'bc1qlhkfxlzzzcc25z95v7c0v7svlp5exegxn0tf58',
        '3MJ8mbu4sNseNeCprG85emwgG9G9SCort7'
      ],
  },
  bsc: { owners: ['0xFFda60ed91039Dd4dE20492934bC163e0F61e7f5',], tokens: [ADDRESSES.bsc.USDT] },
  ethereum: { owners: ['0x13b72A19e221275D3d18ed4D9235F8F859626673'], tokens: [ADDRESSES.ethereum.USDT] },
  stacks: { owners: ['SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.cross-bridge-registry-v2-01', 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.btc-peg-out-endpoint-v2-01'], blacklistedTokens: [
    'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc', // already counted as part of bitcoin?
    'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex', // project linked token
  ] },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})