const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const ethereum_pitchfxs = '0x11ebe21e9d7bf541a18e1e3ac94939018ce88f0b';

const config = {
  ethereum: { factory: '0x679619FA685a18782a86dD5850124A75E83daD8F', fromBlock: 19877998 },
  mantle: { factory: '0x624bd5ba06A856C4D5f60c8Ba29eeE1f684Ddf05', fromBlock: 65870976 },
}

module.exports = {
  methodology: 'TVL accounts for all assets deposited into our boosted vaults. It also includes the amount of FXS time-locked and minted as pitchFXS.',
};


Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'ethereum')
        await computePitchfxsTvl(api)
      const logs = await getLogs2({
        api,
        factory,
        eventAbi: 'event NewMaturityCreated (uint256 deploymentIndex, address depositor, address[] receipts)',
        fromBlock,
      })

      const vaults = logs.map(log => log.depositor)
      const tokens = await api.multiCall({ abi: 'address:getUnderlying', calls: vaults })
      return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
    }
  }
})

const computePitchfxsTvl = async (api) => {
  const balance = await api.call({
    target: ethereum_pitchfxs,
    params: [],
    abi: 'erc20:totalSupply',
  });

  api.addToken(ADDRESSES.ethereum.FXS, balance);
}
