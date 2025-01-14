const { sumTokensExport } = require("../helper/unwrapLPs");

const MANTA = '0x95CeF13441Be50d20cA4558CC0a27B601aC544E5';
const STONE = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3';
const TIME_LOCK_CONTRACT = '0x8Bb6CaE3f1CADA07Dd14bA951e02886ea6bBA183';

module.exports = {
  methodology: 'counts the number of (MANTA OR STONE) in the time lock contract.',
  manta: {
    tvl: sumTokensExport({ owner: TIME_LOCK_CONTRACT, tokens: [MANTA, STONE] }),
  }
}; 
