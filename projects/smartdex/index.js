const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// Addresses from https://docs.smardex.io/ultimate-synthetic-delta-neutral/the-usdn-protocol/addresses
const USDN_PROTCOL = '0x656cB8C6d154Aad29d8771384089be5B5141f01a';
const DIP_ACCUMULATOR = '0xaeBcc85a5594e687F6B302405E6E92D616826e03';

const getEthereumTVL = async (api) => {
  const tvl = await sumTokens2({ api, tokens: [ADDRESSES.ethereum.WSTETH], owners: [USDN_PROTCOL, DIP_ACCUMULATOR] })
  return tvl
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({ factory: '0xBE087BeD88539d28664c9998FE3f180ea7b9749C', useDefaultCoreAssets: true, }), 
  },
  ethereum: {
    tvl: getEthereumTVL,
  },
};
