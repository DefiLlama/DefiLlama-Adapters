const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json')

const SYN_TOKEN = '0x8f4b429794ABa4607d177b100Cc5e481D22d0ad4';

const TREASURY_CONTRACT = '0x8205e9782Fe54fD2aaD895b436B695db169F3d7B';

const ESCROW_CONTRACTS = [
  '0x99955b487aE5519a2b1Ff677f9bed3A6145b750d',
  '0x2518d845C9d23AE52650f35C4E4E187BFD797f6B',
  '0xC6BE1BCE9ADcad9d97a302D652839F399a699460',
  '0xd1e4F8dfBD1e7eC75Fa58561909706af223c5e34',
  '0x8eC5c246E976b512D7c157714e464D1A38CD59B6',
  '0x11Ae69867785C36ADAcc40D383cd5f19d6288432',
  '0x55bA23c48e3c5bE2A36a93A9124C3f7Cacac6B81',
  '0x5821ACB8CD8601cCd3861dD66f459Cd9f0027Dd2',
  '0xC566D6E70e76886f2aB253f165E6Bd4A69145025',
  '0x3b56457A3f647CDf04Db064BD6f1Da9e883C185c',
];

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [TREASURY_CONTRACT, ...ESCROW_CONTRACTS],
    tokens: [ADDRESSES.arc.USDC, ADDRESSES.arc.EURC, ADDRESSES.arc.cirBTC, nullAddress],
  });
}

async function ownTokens(api) {
  return sumTokens2({
    api,
    owners: [TREASURY_CONTRACT],
    tokens: [SYN_TOKEN],
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    'Counts USDC, EURC, cirBTC, and native ARC gas token held in the Syn DAO treasury and active milestone escrow contracts on Arc Mainnet.',
  arc: {
    tvl,
    ownTokens,
  },
};
