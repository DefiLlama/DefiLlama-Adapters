
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  era: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owner: '0x4992eb45172868f0d8cceb91190e159bdf571461', tokens: [ADDRESSES.era.USDC] }),
      cryptoPoolTvl,
    ])
  },
};

async function cryptoPoolTvl(api) {
  const logs = await getLogs({
    api,
    target: '0x7C5667677e7E6d5a7a3b7cb9EF25a2B4ad2C745A',
    eventAbi: "event NewVault(address indexed vault, address indexed creator, address token)",
    onlyArgs: true,
    fromBlock: 18448266,
  })

  return api.sumTokens({ tokensAndOwners: logs.map(log => [log.token, log.vault]) })
}