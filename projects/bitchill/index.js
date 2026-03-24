const { sumTokensExport } = require('../helper/unwrapLPs')

const tokensAndOwners = [
  ['0x544Eb90e766B405134b3B3F62b6b4C23Fcd5fDa2', '0xb60024d0030d7876f02BB766E18F0664e81B0856'], // kDOC held by TropykusDocHandler
  ['0xd8D25f03EBbA94E15Df2eD4d6D38276B595593c1', '0xA1A752784d4d43778ED23771777B18AE9cb66461'], // iSUSD held by SovrynDocHandler
  ['0xDdf3CE45fcf080DF61ee61dac5Ddefef7ED4F46C', '0xAfcD7A6F5165F09b049ded06EEC12F5A9E3D09A2'], // kUSDRIF held by TropykusUsdrifHandler
]

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the sum of lending token balances (kDOC, iSUSD, kUSDRIF) held by BitChill DCA handlers on Rootstock.',
  rsk: {
    tvl: sumTokensExport({ tokensAndOwners })
  }
};