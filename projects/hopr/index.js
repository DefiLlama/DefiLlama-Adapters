const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS = ADDRESSES.xdai.XHOPR;
const SAFE_FACTORY = '0x098B275485c406573D042848D66eb9d63fca311C';
const HOPR_CHANNELS = '0x693Bac5ce61c720dDC68533991Ceb41199D8F8ae';

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: SAFE_FACTORY,
    fromBlock: 29706820,
    eventAbi: 'event NewHoprNodeStakeSafe(address instance)'
  });

  const safes = logs.map(log => log.args[0]);

  const owners = [...safes, HOPR_CHANNELS]
  return sumTokens2({ api, tokens: [wxHOPR_TOKEN_SMART_CONTRACT_ADDRESS], owners, })
}

module.exports = {
  xdai: {
    tvl: () => ({}),
    staking: tvl,
  },
  methodology: 'HOPR TVL consists total amount of wxHOPR (wrapped xHOPR) that all users have in their HOPR Safes staked to receive a share of the revenue, and also the total amount of wxHOPR locked in the channels contract.',
};