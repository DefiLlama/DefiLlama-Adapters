const { sumTokens2 } = require('../helper/unwrapLPs')
const { getBlock } = require('../helper/getBlock');

const threeFerPoolAddress = '0xe8d13664a42B338F009812Fa5A75199A865dA5cD';
const chain = 'cronos'

const tokens = {
  // DAI
  "0xF2001B145b43032AAF5Ee2884e456CCd805F677D": [
    threeFerPoolAddress,
  ],
  // USDC
  "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59": [
    threeFerPoolAddress,
  ],
  // USDT
  "0x66e428c3f67a68878562e79A0234c1F83c208770": [
    threeFerPoolAddress,
  ],
};

async function tvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'cronos', chainBlocks);
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
