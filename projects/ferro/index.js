const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const SWAP_3FER_ADDR = '0xe8d13664a42B338F009812Fa5A75199A865dA5cD';
const SWAP_2FER_ADDR = '0xa34C0fE36541fB085677c36B4ff0CCF5fa2B32d6';
const SWAP_LCRO_WCRO_ADDRESSES = '0x1578C5CF4f8f6064deb167d1eeAD15dF43185afa';
const chain = 'cronos'

const tokens = {
  // DAI
  "0xF2001B145b43032AAF5Ee2884e456CCd805F677D": [
    SWAP_3FER_ADDR,
  ],
  // USDC
  [ADDRESSES.cronos.USDC]: [
    SWAP_3FER_ADDR,
    SWAP_2FER_ADDR,
  ],
  // USDT
  [ADDRESSES.cronos.USDT]: [
    SWAP_3FER_ADDR,
    SWAP_2FER_ADDR,
  ],
  // LCRO
  "0x9fae23a2700feecd5b93e43fdbc03c76aa7c08a6": [
    SWAP_LCRO_WCRO_ADDRESSES,
  ],
  // WCRO
  "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23": [
    SWAP_LCRO_WCRO_ADDRESSES,
  ],
};

async function tvl(timestamp, ethBlock, {cronos: block}) {
  const tokensAndOwners = Object.entries(tokens).map(([token, owners]) => owners.map(owner => [token, owner])).flat()
  return sumTokens2({ chain, block, tokensAndOwners })
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'sum of ferro stablecoin pool contracts balance',
  start: 1651218360,
  cronos: {
    tvl,
  }
}