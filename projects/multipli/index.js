const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  timetravel: false,
  methodology: 'Counts USDC deposited in Multipli vault and fund manager contracts.',
  avax: {
    tvl: sumTokensExport({
      owners: [
        '0xCF0Eb4ac018C06a16ED5c63484823C7805e7599D', // xUSDC vault
        '0x01e676EAA0C9780A88395c651349Cf08Fe52368e', // fund manager
      ],
      tokens: [ADDRESSES.avax.USDC],
    }),
  },
  monad: {
    tvl: sumTokensExport({
      owners: [
        '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009', // xUSDC vault
        '0xE1824bF952bB2E8414d12de8A9fc2cBc666D6758', // fund manager
      ],
      tokens: [ADDRESSES.monad.USDC],
    }),
  },
};
