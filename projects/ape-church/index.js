const { sumTokens2 } = require('../helper/unwrapLPs');
const { nullAddress } = require('../helper/tokenMapping');

const HOUSE_CONTRACT = '0x2054709F89F18a4CCAC6132acE7b812E32608469';

async function tvl(api) {
    return sumTokens2({ owner: HOUSE_CONTRACT, tokens: [nullAddress], api, })
}

module.exports = {
  methodology: `Ape Church TVL is achieved by tracking the balance of The House smart contract. Volume is achieved by tracking the Transfer events from the UserInfoTracker smart contract.`,
  start: 1757586225,
  apechain: {
    tvl
  }
}
