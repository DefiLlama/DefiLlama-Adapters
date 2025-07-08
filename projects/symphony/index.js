const { getConfig } = require('../helper/cache')

const yoloAddress = {
  'avax': "0x44f91814c5c766e0762c8c23d65759f631c0abbd",
  'polygon': "0x935b97586FE291750F46Bf4eD7BeB8E1c3d110A2",
  'optimism': "0x3Ff61F4d7e1d912CA3Cb342581B2e764aE24d017"
}
const TOKENLIST_URL = "https://raw.githubusercontent.com/symphony-finance/token-list/master/symphony.tokenlist.json";

const tvl = async (api) => {
  const tokens = (await getConfig('symphony', TOKENLIST_URL)).tokens
    .filter((data) => data.chainId == api.chainId && !data.extensions.isNative)
    .map((token) => token.address)

  return api.sumTokens({ tokens, owners: [yoloAddress[api.chain]], })
}

module.exports = {
  deadFrom: '2023-07-07',
  avax: { tvl },
  polygon: { tvl },
  optimism: { tvl },
  methodology: "we only count tokens deposited in the yolo contract",
};
