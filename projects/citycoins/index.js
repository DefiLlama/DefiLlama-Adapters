const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

const NYC_CONTRACT = 'SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5.newyorkcitycoin-core-v1'
const NYC_CONTRACT_V2 = 'SPSCWDV3RKV5ZRN1FQD84YE1NQFEDJ9R1F4DYQ11.newyorkcitycoin-core-v2'
const MIAMI_CONTRACT = 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-core-v1'
const MIAMI_CONTRACT_V2 = 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.miamicoin-core-v2'
const MIAMI_CITY_WALLET = 'SM2MARAVW6BEJCD13YV2RHGYHQWT7TDDNMNRB1MVT'
const NYC_CITY_WALLET = 'SM18VBF2QYAAHN57Q28E2HSM15F6078JZYZ2FQBCX'

module.exports = {
  stacks: {
    tvl: sumTokensExport({
      owners: [NYC_CONTRACT, NYC_CONTRACT_V2, MIAMI_CONTRACT, MIAMI_CONTRACT_V2],
      tokens: [nullAddress]
    }),
    // treasury, Note: Treasury has been disabled upon team request since they view it as amount reserved for city governers and does not belong to team
    staking: sumTokensExport({
      owners: [NYC_CONTRACT, NYC_CONTRACT_V2, MIAMI_CONTRACT, MIAMI_CONTRACT_V2],
      blacklistedTokens: [nullAddress]
    }),
  },
  methodology: 'Added STX in contracts as TVL, and native tokens in it as staking'
};