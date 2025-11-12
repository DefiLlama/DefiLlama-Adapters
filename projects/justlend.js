const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens } = require('./helper/sumTokens')
const sdk = require('@defillama/sdk')

const comptroller = 'TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx7'

module.exports = {
  tron: {
    tvl, borrowed,
  },
  hallmarks: [
    [1733270400, "TRX token price was increasing over 90%"],
  ],
};

async function tvl(api) {
  const markets = (await api.call({ abi: 'address[]:getAllMarkets', target: comptroller })).map(sdk.tron.unhexifyTarget)
  const cMarkets = ['TE2RzoSV3wFK99w6J9UnnZ4vLfXYoxvRwP']
  const tokensAndOwners = []
  const otherMarkets = []
  for (let i = 0; i < markets.length; i++) {
    if (cMarkets.includes(markets[i])) {
      tokensAndOwners.push([ADDRESSES.null, markets[i]])
    } else
      otherMarkets.push(markets[i])
  }

  const underlyings = await api.multiCall({ abi: 'address:underlying', calls: otherMarkets })
  underlyings.forEach((t, i) => tokensAndOwners.push([t, otherMarkets[i]]))
  return sumTokens({ chain: 'tron', tokensAndOwners })
}

async function borrowed(api) {
  const markets = (await api.call({ abi: 'address[]:getAllMarkets', target: comptroller })).map(sdk.tron.unhexifyTarget)
  const cMarkets = ['TE2RzoSV3wFK99w6J9UnnZ4vLfXYoxvRwP']
  const otherMarkets = []
  for (let i = 0; i < markets.length; i++) {
    if (!cMarkets.includes(markets[i]))
      otherMarkets.push(markets[i])
  }

  const underlyings = await api.multiCall({ abi: 'address:underlying', calls: otherMarkets })
  const uBorrowed = await api.multiCall({ abi: 'uint256:totalBorrows', calls: otherMarkets })
  const cBorrowed = await api.multiCall({ abi: 'uint256:totalBorrows', calls: cMarkets })
  api.add(underlyings, uBorrowed)
  api.add(ADDRESSES.null, cBorrowed)
}
