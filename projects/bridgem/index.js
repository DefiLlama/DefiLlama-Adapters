const { sumTokensExport } = require("../helper/unwrapLPs");

const STONE = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3';
const AtomicLockContract = '0x19727db22Cba70B1feE40337Aba69D83c6741caF';

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ESTONE = '0x7122985656e38BDC0302Db86685bb972b145bD3C';
const LOCK_CONTRACT = '0xD6572c7Cd671ECF75d920aDcd200B00343959600';

module.exports = {
  methodology: 'counts the number of STONE in the  AtomicLockContract.',
  manta: {
    tvl: sumTokensExport({ owner: AtomicLockContract, tokens: [STONE] }),
  },
  ethereum: {
    tvl: sumTokensExport({ owner: LOCK_CONTRACT, tokens: [USDC, ESTONE] }),
  }
}; 
