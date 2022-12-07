const { sumTokens2 } = require('../helper/unwrapLPs')

const SWAP_3FER_ADDR = '0xe8d13664a42B338F009812Fa5A75199A865dA5cD';
const SWAP_2FER_ADDR = '0xa34C0fE36541fB085677c36B4ff0CCF5fa2B32d6';
const chain = 'cronos'

const tokens = {
  // DAI
  "0xF2001B145b43032AAF5Ee2884e456CCd805F677D": [
    SWAP_3FER_ADDR,
  ],
  // USDC
  "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59": [
    SWAP_3FER_ADDR,
    SWAP_2FER_ADDR,
  ],
  // USDT
  "0x66e428c3f67a68878562e79A0234c1F83c208770": [
    SWAP_3FER_ADDR,
    SWAP_2FER_ADDR,
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
