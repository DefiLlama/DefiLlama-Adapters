const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  start: '2024-11-30',
  sapphire: {
    tvl: sumTokensExport({ owner: '0x9be6f065aFC34ca99e82af0f0BfB9a01E3f919eE', tokens: [nullAddress] }, 
                         { owner: '0xa16ed0B92a27E8F7fFf1aB513c607115636cb63f', tokens: [nullAddress] }),
  },
}

