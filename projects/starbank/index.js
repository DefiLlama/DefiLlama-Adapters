const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  astar: {
    tvl: sumTokensExport({
      owner: '0x18df7884DEa0B24334800C8b05763112Eb592ce0',
      tokens: [
        '0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720',
        '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
        '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
        '0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4',
        '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb',
        '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E',
      ],
    })
  }
};
