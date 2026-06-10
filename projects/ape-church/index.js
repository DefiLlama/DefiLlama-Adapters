const { sumTokensExport } = require('../helper/unwrapLPs');
const { nullAddress } = require('../helper/tokenMapping');

const HOUSE_CONTRACT = '0x2054709F89F18a4CCAC6132acE7b812E32608469';
const HOUSE_CONTRACT_V2 = '0xB7EcD1F3fA462d2c6c65F55357E8c16c614CC2f1';

module.exports = {
  methodology: `Ape Church TVL is achieved by tracking the balance of The House smart contract. Volume is achieved by tracking the Transfer events from the UserInfoTracker smart contract.`,
  start: 1757586225,
  apechain: {
    tvl: sumTokensExport({ owners: [HOUSE_CONTRACT, HOUSE_CONTRACT_V2], tokens: [nullAddress], }),
  }
}
