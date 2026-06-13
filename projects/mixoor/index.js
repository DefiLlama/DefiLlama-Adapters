const { sumTokensExport } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Value of SOL, USDC and USD1 in mixoor pools.',
  solana: { tvl: sumTokensExport({
    owners: ['CS31stgBRPvPMBvRAYgsRTbogNkRdUNTsoyQQLcYp7ZD'],
    tokens: [ADDRESSES.solana.USDC, 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB'],
    solOwners: ['CS31stgBRPvPMBvRAYgsRTbogNkRdUNTsoyQQLcYp7ZD']
  })},
}
