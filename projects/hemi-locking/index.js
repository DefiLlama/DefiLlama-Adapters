const { sumTokensExport } = require('../helper/unwrapLPs')

const HEMI_TOKEN = '0x99e3dE3817F6081B2568208337ef83295b7f591D'
const VE_ESCROW  = '0x371d3718D5b7F75EAb050FAe6Da7DF3092031c89'

module.exports = {
  methodology:
    "Staking TVL = amount of HEMI locked in veHEMI (VotingEscrow). We sum the escrow’s HEMI balance.",
  hemi: { tvl: () => ({}), staking: sumTokensExport({owner: VE_ESCROW, token: HEMI_TOKEN }) },
}
