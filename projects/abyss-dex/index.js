const { uniV3Export } = require('../helper/uniswapV3');
const { mergeExports } = require('../helper/utils');

const currentExport = uniV3Export({
  robinhood: {
    factory: '0xe7feF2BC860B25bbdEB6F6AB96d88bAAa77ddad7',
    fromBlock: 50161538,
  },
});

// The legacy factory predates the standard V3-compatible PoolCreated event.
const legacyEvent = {
  eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, uint8 profile, bool quoteIsToken0, bytes32 oracleConfigId, address pool)',
  topics: ['0x55abb5c932f796b161e52a8c043b2bead9f1f2e4958a6470d589db2b9e6e68ce'],
};

const legacyExport = uniV3Export({
  robinhood: {
    factory: '0x4510098D4993E035A3Bcb1004154D796665F4917',
    fromBlock: 48916592,
    ...legacyEvent,
  },
});

module.exports = {
  methodology: 'TVL sums raw on-chain ERC20 balances of both assets in every Abyss pool discovered from current and legacy factory PoolCreated events on Robinhood, including remaining legacy liquidity. Pool assets include ABYSS where present and retain their original chain/address identities for external DefiLlama pricing; no API balances, quote-asset doubling or custom prices are used, and unpriced tokens are not assigned a USD value by this adapter. Separate treasury, burner, router and fee-vault holdings are excluded, and position NFTs are not counted again.',
  ...mergeExports([currentExport, legacyExport]),
};
