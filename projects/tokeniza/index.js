const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const { get } = require('../helper/http')
const treasury = "0xbaECbdde43C6c6a167c37d5b789023592B27fF93";

async function moonbeamTvl(api) {
  const data = await get('https://plataforma.tokeniza.com.br/api/v1/assets/getTVL?network=MOONBEAN')
  const tvl = parseFloat(data.tvl)
  api.add(ADDRESSES.moonbeam.USDC, tvl * 1e6)
}

module.exports = {
  methodology: 'The Tokeniza TVL represents the total USD value of all tokenized NFTs and assets purchased through the Tokeniza platform, combined with the balance held in Tokeniza’s internal wallets. This methodology reflects the on-chain value of regulated Real World Assets (RWA) issued and managed by Tokeniza.',
  moonbeam: {
    tvl: moonbeamTvl
  },
  ...treasuryExports({
    ethereum: {
      tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT
      ],
      owners: [treasury]
    },
    polygon: {
      tokens: [
        nullAddress,
        ADDRESSES.polygon.USDT
      ],
      owners: [treasury]
    },
  })
}