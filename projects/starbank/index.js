const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  astar: {
    tvl: sumTokensExport({
      owner: '0x18df7884DEa0B24334800C8b05763112Eb592ce0',
      tokens: [
        '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
        ADDRESSES.moonbeam.USDC,
        ADDRESSES.astar.USDT,
        ADDRESSES.astar.SDN,
        ADDRESSES.astar.DAI,
        ADDRESSES.oasis.ceUSDT,
      ],
    })
  }
};
