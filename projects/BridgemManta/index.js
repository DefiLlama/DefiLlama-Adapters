const { sumTokensExport } = require("../helper/unwrapLPs");

const STONE = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3';
const AtomicLockContract = '0x19727db22Cba70B1feE40337Aba69D83c6741caF';

module.exports = {
  methodology: 'counts the number of STONE in the  AtomicLockContract.',
  start: 1955673,
  manta: {
    tvl: sumTokensExport({ owner: AtomicLockContract, tokens: [STONE] }),
  }
}; 
