const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const CRIPTERY_CONTRACT_BASE = '0xB0C41621f7bc3d23B1e7e020C0e1E61328e5F5f7';

module.exports = {
  methodology: 'TVL counts the native ETH and ERC-20 tokens locked in active non-custodial lottery draws, private rooms, and 1v1 coin-flip duels inside the CyberLotoSplitterV4 smart contract on Base Mainnet waiting to be distributed to winners.',
  base: {
    tvl: sumTokensExport({
      owner: CRIPTERY_CONTRACT_BASE,
      tokens: [
        ADDRESSES.null, // ETH nativo en Base
        ADDRESSES.base.USDC,
        ADDRESSES.base.USDT || '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      ],
    }),
  },
};
