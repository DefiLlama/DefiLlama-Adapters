const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

// Contract addresses on Base
const SNATCH_CONTRACT = '0x1Ef75dc4904b71021F308a8D276be346889fEe62';
const MINES_CONTRACT = '0x8536f84d0300Be2B6733B69Bcd48613a9E04E918';
const GLORB_TOKEN = '0xa26303226Baa2299adA8D573a6FcD792aB1CFB07';

module.exports = {
  methodology: 'TVL is calculated by summing the ETH locked in the Snatch prize pot contract, plus the ETH and GLORB tokens held in the Mines idle mining game contract (emission pool, jackpot pools).',
  start: 1738368000,
  base: {
    tvl: sumTokensExport({
      owners: [SNATCH_CONTRACT, MINES_CONTRACT],
      tokens: [ADDRESSES.null, GLORB_TOKEN],
    }),
  },
};
