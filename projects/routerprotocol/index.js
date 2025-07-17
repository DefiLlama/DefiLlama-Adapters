const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const NATIVE_ADDRESS = "NATIVE";

const config = {
  arbitrum: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.arbitrum.USDC, decimals: 6 },
      { name: "weth", address: ADDRESSES.arbitrum.WETH, decimals: 18 },
    ]
  },
  avax: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.avax.USDC_e, decimals: 6 },
      { name: "wbnb", address: "0x264c1383EA520f73dd837F915ef3a732e204a493", decimals: 18 },
      { name: "wrapped-avax", address: ADDRESSES.avax.WAVAX, decimals: 18 },
      { name: "weth", address: ADDRESSES.avax.WETH_e, decimals: 18 },
    ]
  },
  fantom: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.fantom.USDC, decimals: 6 },
      { name: "wmatic", address: "0x40DF1Ae6074C35047BFF66675488Aa2f9f6384F3", decimals: 18 },
      { name: "wbnb", address: "0x27f26F00e1605903645BbaBC0a73E35027Dccd45", decimals: 18 },
      { name: "wrapped-avax", address: "0x511D35c52a3C244E7b8bd92c0C297755FbD89212", decimals: 18 },
      { name: "wrapped-fantom", address: ADDRESSES.fantom.WFTM, decimals: 18 },
      { name: "weth", address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", decimals: 18 },
    ]
  },
  optimism: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.optimism.USDC, decimals: 6 },
      { name: "weth", address: ADDRESSES.tombchain.FTM, decimals: 18 },
    ]
  },
  polygon: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.polygon.USDC, decimals: 6 },
      { name: "mimatic", address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", decimals: 18 },
      { name: "route", address: "0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4", decimals: 18 },
      { name: "wmatic", address: "0x4c28f48448720e9000907bc2611f73022fdce1fa", decimals: 18 },
      { name: "dfyn-network", address: "0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97", decimals: 18 },
      { name: "wbnb", address: ADDRESSES.polygon.BNB, decimals: 18 },
      { name: "wrapped-avax", address: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b", decimals: 18 },
      { name: "wrapped-fantom", address: "0xC9c1c1c20B3658F8787CC2FD702267791f224Ce1", decimals: 18 },
      { name: "weth", address: ADDRESSES.polygon.WETH_1, decimals: 18 },
    ]
  },
  bsc: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.bsc.USDC, decimals: 18 },
      { name: "wmatic", address: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd", decimals: 18 },
      { name: "wbnb", address: ADDRESSES.bsc.WBNB, decimals: 18 },
      { name: "binance-peg-avalanche", address: "0x1CE0c2827e2eF14D5C4f29a091d735A204794041", decimals: 18 },
      { name: "wrapped-fantom", address: "0xAD29AbB318791D579433D831ed122aFeAf29dcfe", decimals: 18 },
      { name: "weth", address: ADDRESSES.bsc.ETH, decimals: 18 },
    ]
  },
  ethereum: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.ethereum.USDC, decimals: 6 },
      { name: "route", address: "0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4", decimals: 18 },
      { name: "wmatic", address: ADDRESSES.ethereum.MATIC, decimals: 18 },
      { name: "dfyn-network", address: "0x9695e0114e12C0d3A3636fAb5A18e6b737529023", decimals: 18 },
      { name: "wbnb", address: ADDRESSES.ethereum.BNB, decimals: 18 },
      { name: "avalanche-wormhole", address: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3", decimals: 18 },
      { name: "fantom", address: ADDRESSES.ethereum.FTM, decimals: 18 },
      { name: "weth", address: ADDRESSES.ethereum.WETH, decimals: 18 },
      { name: "wrapped-cro", address: "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b", decimals: 18 },
    ]
  },
  aurora: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.aurora.USDC_e, decimals: 6 },
      { name: "weth", address: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", decimals: 18 },
      { name: "wmatic", address: ADDRESSES.oasis.USDT, decimals: 18 },
      { name: "wbnb", address: ADDRESSES.syscoin.USDC, decimals: 18 },
      { name: "wrapped-avax", address: "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844", decimals: 18 },
    ],
  },
  harmony: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0x985458E523dB3d53125813eD68c274899e9DfAb4", decimals: 6 },
    ],
  },
  cronos: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.cronos.USDC, decimals: 6 },
      { name: "wrapped-cro", address: ADDRESSES.cronos.WCRO_1, decimals: 18 },
      { name: "wmatic", address: "0xad79AC3c5a5c15C6B9194F5568e451b3fc3C2B40", decimals: 18 },
      { name: "wbnb", address: ADDRESSES.telos.ETH, decimals: 18 },
      { name: "wrapped-avax", address: ADDRESSES.shiden.ETH, decimals: 18 },
      { name: "weth", address: "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a", decimals: 18 },
      { name: "wrapped-fantom", address: ADDRESSES.moonriver.USDT, decimals: 18 },
    ],
  },
  kava: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: ADDRESSES.telos.ETH, decimals: 6 },
    ],
  },
}

module.exports = {
  methodology: "All tokens locked in Router Protocol contracts.",
};

Object.keys(config).forEach(chain => {
  let { contractAddress: owner, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      tokens = tokens.map(i => i.address === NATIVE_ADDRESS ? nullAddress: i.address)
      return sumTokens2({ api, owner, tokens, })
    }
  }
})