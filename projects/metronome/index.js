const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const acc = '0x686e5ac50D9236A9b7406791256e47feDDB26AbA';
const met = '0xa3d58c4E56fedCae3a7c43A725aeE9A71F0ece4e';
const proceeds = '0x68c4b7d05fae45bcb6192bb93e246c77e98360e1';

module.exports = {
  start: 1527076766,        // block 5659904
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, acc],
        [nullAddress, proceeds],
        [met, acc],
      ]
    })
  }
};
