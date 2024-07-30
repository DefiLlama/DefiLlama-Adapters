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

// taken from onramp factory (allOnramps): https://explorer.gobob.xyz/address/0x1831d29376eb94bba3ca855af7984db923768b27?tab=read_contract
const bobOnrampAddresses = [
  "0x587e6E2b280C70ec811a371671D3CBE9D7b9F691",
  "0xA1884124a52331Bc2fa66e2b0EFa15856C6830c6",
  "0x2e0A1Fa2f61985c475B869559cF2Cf733d4DB282",
  "0xCA94d277d04e8e6ce960F7492b2df62e2215d562",
  "0x9BBBc8F4e4258cC9Ec79164DDB7ef72954f381E2",
  "0x47340424457463Fa77B59FDAdea31cA886a241FD",
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
  bob: {
    tvl: (api) =>
      sumTokens2({
        api,
        tokens: [
          ADDRESSES.bob.WBTC,
          ADDRESSES.bob.TBTC,
        ],
        owners: bobOnrampAddresses,
      }),
  }
};

