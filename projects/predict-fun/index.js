const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [
      '0xE1A2E68C401378050fdba9704FA8BCb1f72b98f4',
      '0x8F9C9f888A4268Ab0E2DDa03A291769479bAc285'
    ], tokens: [ADDRESSES.blast.USDB]})
  },
  bsc: {
    tvl: sumTokensExport({ owners: [
      '0x66239b70133773A72A0D589E5564E88a50Cd39e7',
      '0xCfb9beF5F7B748aC72311F057f3a888BC73334D9',
      '0x9400F8Ad57e9e0F352345935d6D3175975eb1d9F',
      '0x22DA1810B194ca018378464a58f6Ac2B10C9d244'
    ], tokens: [ADDRESSES.bsc.USDT, '0xfD5840Cd36d94D7229439859C0112a4185BC0255']})
  },
  methodology: `TVL is the total quantity of USDB (Blast) and USDT (BSC) held in the conditional tokens contracts as well as the wrapped collateral contracts. In the case of BSC, there are also additional YieldBearing contracts.`
}
