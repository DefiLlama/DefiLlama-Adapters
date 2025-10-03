const { sumTokens2 } = require('@defillama/sdk/build/generalUtil')


const CHAIN = 'hemi'
const HEMI_TOKEN = '0x99e3dE3817F6081B2568208337ef83295b7f591D'
const VE_ESCROW  = '0x371d3718D5b7F75EAb050FAe6Da7DF3092031c89'

async function staking(_timestamp, _ethBlock, _chainBlocks, { api }) {
  // Sum the HEMI balance(s) custodied by the ve escrow
  return sumTokens2({
    api,
    owner: VE_ESCROW,
    tokens: [HEMI_TOKEN],
  })
}

module.exports = {
  methodology:
    "Staking TVL = amount of HEMI locked in veHEMI (VotingEscrow). We sum the escrow’s HEMI balance.",
  misrepresentedTokens: false,
  timetravel: true,
  hallmarks: [
    // [unixTimestamp, "Event description"],
  ],
  [CHAIN]: { staking },
}