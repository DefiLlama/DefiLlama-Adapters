const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

// Contract addresses on Base (8453)
const SNATCH_CONTRACT = '0x1Ef75dc4904b71021F308a8D276be346889fEe62';
const MINES_CONTRACT = '0x8536f84d0300Be2B6733B69Bcd48613a9E04E918';
const GLORB_TOKEN = '0xa26303226Baa2299adA8D573a6FcD792aB1CFB07';

module.exports = {
  methodology: 'TVL is ETH locked in Snatch prize pot and jackpot, plus ETH in Mines jackpot and operational pools. Own-token TVL tracks GLORB held in Mines emission and jackpot pools. Revenue: 5% of Snatch buys fund GLORB buyback-and-burn; Mines swaps 85% of ETH payments to GLORB for miner emissions and burns 10% of GLORB upgrade costs.',
  start: 1738368000,
  base: {
    tvl: sumTokensExport({
      owners: [SNATCH_CONTRACT, MINES_CONTRACT],
      tokens: [ADDRESSES.null],
    }),
    ownTokens: sumTokensExport({
      owners: [SNATCH_CONTRACT, MINES_CONTRACT],
      tokens: [GLORB_TOKEN],
    }),
  },
};
