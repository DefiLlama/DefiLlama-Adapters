const { sumTokens2, sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const MONSTRO = '0x1d3bE1CC80cA89DDbabe5b5C254AF63200e708f7'
const ALB = '0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4'
const ES_ALB = '0x365c6d588e8611125De3bEA5B9280C304FA54113'

const TREASURY = '0x4713b3ab36C9759043694757E6Cb8123915a8dd0'
const DAO_STAKE = '0xA6Cd9800EfF0994B3f64c330de4E55925d5404DC'
const POL = '0xCb7c195De077B9CADBC5c086Ba7932149B9f4391'
const EMISSIONS = '0xce45B2ae92c9dc7E39EbB9d9dB6920897A6F6b4a'

const allDaoWallets = [TREASURY, DAO_STAKE, POL, EMISSIONS]

const treasuryTokens = [
  ADDRESSES.base.USDC,
  ADDRESSES.base.WETH,
  ADDRESSES.null,
  ALB,
]

async function tvl(api) {
  await sumTokens2({
    api,
    owners: allDaoWallets,
    tokens: treasuryTokens,
    blacklistedTokens: [MONSTRO],
    resolveUniV3: true,
    resolveSlipstream: true,
  })

  const esAlbBalance = await api.call({
    target: ES_ALB,
    abi: 'function esTokenBalances(address) view returns (uint256)',
    params: [TREASURY],
  })
  api.add(ALB, esAlbBalance)
}

module.exports = {
  base: {
    tvl,
    ownTokens: sumTokensExport({ owners: allDaoWallets, tokens: [MONSTRO] }),
  },
}
