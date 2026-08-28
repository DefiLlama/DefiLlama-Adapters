const { getUniTVL, sumUnknownTokens } = require("../helper/unknownTokens");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require("../helper/cache/getLogs");
const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const BUN_TOKEN = "0x695f775551fb0D28b64101c9507c06F334b4bA86";

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
    staking: async (api) => {
      const pair = "0x9Dd78eA2B7a92B6CB5D4a495DAC34F8641070CEB";

      // Get BUN reserves from the BUN/ETH pair (BUN is always token0)
      const reserves = await api.call({ 
        abi: 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)', 
        target: pair 
      });

      // BUN is token0, so we use reserve0
      const reserve0 = reserves._reserve0 || 0;
      api.add(BUN_TOKEN, reserve0);

      // Get BUN balances from all index contracts
      const { indexFactory } = config.ethereum;
      const logs = await getLogs({
        api,
        target: indexFactory,
        topic: "IndexCreated(address,address,string,string,uint16,uint8,uint8,address[],uint256[],uint256[],uint256)",
        eventAbi: "event IndexCreated(address indexed index, address indexed manager, string name, string symbol, uint16 swapFee, uint8 mintAndBurnFee, uint8 managerShareFee, address[] tokens, uint256[] amounts, uint256[] weights, uint256 initialSupply)",
        onlyArgs: true,
        fromBlock: 23296262,
      });
      const indexes = logs.map(({ index }) => index);
      
      // Get BUN balance for each index
      const bunBalances = await api.multiCall({
        abi: 'function getBalance(address _token) view returns (uint256 _balance)',
        calls: indexes.map(index => ({
          target: index,
          params: [BUN_TOKEN]
        }))
      });

      // Add BUN balances from indexes
      bunBalances.forEach((balance, i) => {
        if (balance && balance > 0) {
          api.add(BUN_TOKEN, balance);
        }
      });

      return sumUnknownTokens({ api, tokens: [BUN_TOKEN], lps: [pair], useDefaultCoreAssets: true, allLps: true, resolveLP: true });
    },
  },
};