const { getLogs2 } = require('../helper/cache/getLogs');
const { nullAddress } = require("../helper/tokenMapping");

// Bonding Curves PumpFactory
const PUMP_FACTORY = '0x0fDc7bf21a167A20C49FcA41CCbc3ABa354AcfbD';

async function tvl(api) {
  const tokenCreatedLogs = await getLogs2({
    api,
    factory: PUMP_FACTORY,
    eventAbi: 'event TokenCreated(address indexed token, address indexed bondingCurve)',
    fromBlock: 1895173, // PumpFactory creation block time
  });
  const owners = tokenCreatedLogs.map(i => i.bondingCurve)
  return api.sumTokens({ owners, token: nullAddress})

}

module.exports = {
  methodology: 'We count the ETH locked in the Bonding Curves contracts',
  formnetwork: {
    tvl
  }
}
