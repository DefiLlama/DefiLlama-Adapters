
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const NATIVE_ADDRESS = "NATIVE";

const config = {
  arbitrum: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6 },
      { name: "weth", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18 },
    ]
  },
  avax: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", decimals: 6 },
      { name: "wbnb", address: "0x264c1383EA520f73dd837F915ef3a732e204a493", decimals: 18 },
      { name: "wrapped-avax", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18 },
      { name: "weth", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", decimals: 18 },
    ]
  },
  fantom: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6 },
      { name: "wmatic", address: "0x40DF1Ae6074C35047BFF66675488Aa2f9f6384F3", decimals: 18 },
      { name: "wbnb", address: "0x27f26F00e1605903645BbaBC0a73E35027Dccd45", decimals: 18 },
      { name: "wrapped-avax", address: "0x511D35c52a3C244E7b8bd92c0C297755FbD89212", decimals: 18 },
      { name: "wrapped-fantom", address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", decimals: 18 },
      { name: "weth", address: "0x74b23882a30290451A17c44f4F05243b6b58C76d", decimals: 18 },
    ]
  },
  optimism: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 },
      { name: "weth", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
    ]
  },
  polygon: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
      { name: "mimatic", address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1", decimals: 18 },
      { name: "route", address: "0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4", decimals: 18 },
      { name: "wmatic", address: "0x4c28f48448720e9000907bc2611f73022fdce1fa", decimals: 18 },
      { name: "dfyn-network", address: "0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97", decimals: 18 },
      { name: "wbnb", address: "0x5c4b7CCBF908E64F32e12c6650ec0C96d717f03F", decimals: 18 },
      { name: "wrapped-avax", address: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b", decimals: 18 },
      { name: "wrapped-fantom", address: "0xC9c1c1c20B3658F8787CC2FD702267791f224Ce1", decimals: 18 },
      { name: "weth", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18 },
    ]
  },
  bsc: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
      { name: "wmatic", address: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd", decimals: 18 },
      { name: "wbnb", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18 },
      { name: "binance-peg-avalanche", address: "0x1CE0c2827e2eF14D5C4f29a091d735A204794041", decimals: 18 },
      { name: "wrapped-fantom", address: "0xAD29AbB318791D579433D831ed122aFeAf29dcfe", decimals: 18 },
      { name: "weth", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18 },
    ]
  },
  ethereum: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      { name: "route", address: "0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4", decimals: 18 },
      { name: "wmatic", address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", decimals: 18 },
      { name: "dfyn-network", address: "0x9695e0114e12C0d3A3636fAb5A18e6b737529023", decimals: 18 },
      { name: "wbnb", address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", decimals: 18 },
      { name: "avalanche-wormhole", address: "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3", decimals: 18 },
      { name: "fantom", address: "0x4E15361FD6b4BB609Fa63C81A2be19d873717870", decimals: 18 },
      { name: "weth", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
      { name: "wrapped-cro", address: "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b", decimals: 18 },
    ]
  },
  aurora: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802", decimals: 6 },
      { name: "weth", address: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", decimals: 18 },
      { name: "wmatic", address: "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8", decimals: 18 },
      { name: "wbnb", address: "0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c", decimals: 18 },
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
      { name: "usd-coin", address: "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59", decimals: 6 },
      { name: "wrapped-cro", address: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", decimals: 18 },
      { name: "wmatic", address: "0xad79AC3c5a5c15C6B9194F5568e451b3fc3C2B40", decimals: 18 },
      { name: "wbnb", address: "0xfa9343c3897324496a05fc75abed6bac29f8a40f", decimals: 18 },
      { name: "wrapped-avax", address: "0x765277eebeca2e31912c9946eae1021199b39c61", decimals: 18 },
      { name: "weth", address: "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a", decimals: 18 },
      { name: "wrapped-fantom", address: "0xB44a9B6905aF7c801311e8F4E76932ee959c663C", decimals: 18 },
    ],
  },
  kava: {
    contractAddress: "0x6e14f48576265272B6CAA3A7cC500a26050Be64E",
    tokens: [
      { name: "usd-coin", address: "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f", decimals: 6 },
    ],
  },
}

module.exports = {
  methodology: "All tokens locked in Router Protocol contracts.",
};

Object.keys(config).forEach(chain => {
  let { contractAddress: owner, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      tokens = tokens.map(i => i.address === NATIVE_ADDRESS ? nullAddress: i.address)
      return sumTokens2({ chain, block, owner, tokens, })
    }
  }
})