const { getUniTVL } = require("../helper/unknownTokens");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require("../helper/cache/getLogs");
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const config = {
  ethereum: {
    swapFactory: "0xAcff9eee0a5522000E7141b77107359A6462E8d2",
    indexFactory: "0x661F8b1Ef3d24E99C461E0523Fd441Ed8d49bF19",
  },
  tokens: [
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.WBTC,
    ADDRESSES.ethereum.AAVE,
    ADDRESSES.ethereum.WSTETH,
    ADDRESSES.ethereum.LINK,
  ]
};

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  methodology: "TVL includes liquidity of index/ETH pools from the swap factory and the value of index tokens created by the index factory.",
  ethereum: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({
        factory: config.ethereum.swapFactory,
        useDefaultCoreAssets: true,
      }),
      async (api) => {
        const { indexFactory } = config.ethereum;
        const tokens = config.tokens;
        const logs = await getLogs({
          api,
          target: indexFactory,
          topic: "IndexCreated(address,address,string,string,uint16,uint8,uint8,address[],uint256[],uint256[],uint256)",
          eventAbi: "event IndexCreated(address indexed index, address indexed manager, string name, string symbol, uint16 swapFee, uint8 mintAndBurnFee, uint8 managerShareFee, address[] tokens, uint256[] amounts, uint256[] weights, uint256 initialSupply)",
          onlyArgs: true,
          fromBlock: 23296262,
        });
        const indexes = logs.map(({ index }) => index);
        return sumTokens2({ api, tokens, owners: indexes });
      }
    ]),
  },
};