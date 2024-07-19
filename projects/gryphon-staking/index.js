const { queryContract } = require("../helper/chain/cosmos");

const config = {
  injective: {
    nAssets: [
      { name: "nINJ", asset: "inj13xlpypcwl5fuc84uhqzzqumnrcfpptyl6w3vrf", coingeckoId: "injective-protocol" },
      { name: "nATOM", asset: "inj1ln2tayrlh0vl73cdzxryhkuuppkycxpna5jm87", coingeckoId: "cosmos" }
    ],
  }
}
module.exports = {
  timetravel: false,
};

Object.keys(config).forEach(chain => {
  const { nAssets } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      for (const { asset, coingeckoId } of nAssets) {
        const { total_supply, decimals } = await queryContract({ contract: asset, chain, data: { token_info: {} } })
        api.add(coingeckoId, total_supply / 10 ** decimals, { skipChain: true })
      }
      return api.getBalances()
    }
  }
})