const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const tokens = [
  ADDRESSES.null, // ETH
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.tBTC,
  ADDRESSES.ethereum.RETH,
  ADDRESSES.ethereum.WSTETH,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.WETH,
  "0x7122985656e38BDC0302Db86685bb972b145bD3C", // STONE
  "0xbdBb63F938c8961AF31eaD3deBa5C96e6A323DD1", // eDLLR
  "0xbdab72602e9AD40FC6a6852CAf43258113B8F7a5", // eSOV
  "0xe7c3755482d0dA522678Af05945062d4427e0923", // ALEX
  
];

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        tokens,
        owners: [
          "0x3F6cE1b36e5120BBc59D0cFe8A5aC8b6464ac1f7",
          "0x091dF5E1284E49fA682407096aD34cfD42B95B72",
          "0x450D55a4B4136805B0e5A6BB59377c71FC4FaCBb",
          "0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E"
        ],
        fetchCoValentTokens: true,
      }),
  },
};

