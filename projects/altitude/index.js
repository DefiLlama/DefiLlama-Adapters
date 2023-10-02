const { stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const stakingContracts = [
  "0xbc2B1262C90ab34757dC7eb2CB7CE595660Ff44e",
];

const ALTD_USDC_UNIV2 = "0xC180869eeff55eE737e4B4f10D93B27B10bF976b";
const ALTD = "0x8929e9DbD2785e3BA16175E596CDD61520feE0D1";

const contract = '0xF80E51AFb613D764FA61751Affd3313C190A86BB'

const CHAINS = ["ethereum", "bsc", "polygon", "arbitrum", "avax", "optimism", "fantom", "linea"];
const chainPathsAbi = "function chainPaths(uint256) view returns (bool ready, address srcToken, uint16 dstChainId, address dstToken, uint256 remoteLiquidity, uint256 localLiquidity, uint256 rewardPoolSize, address lpToken, bool stopSwap)";

let output = {};

CHAINS.forEach(chain => {
  output[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const tokens = [];
      let hasMoreTokens = false;
      let currentStart = 0;
      const fetchSize = 5;
      do {
        let res = await api.fetchList({ itemAbi: chainPathsAbi, target: contract, itemCount: fetchSize + currentStart, start: currentStart, permitFailure: true });
        res = res.filter(i => i).map(i => i.srcToken);
        tokens.push(...res);
        currentStart += fetchSize;
        hasMoreTokens = res.length === fetchSize;
      } while (hasMoreTokens);
      return api.sumTokens({ owner: contract, tokens });
    }
  };
});

output.ethereum.staking = stakings(stakingContracts, ALTD);
// output.ethereum.pool2 = pool2(
//   null,  // No staking contract
//   ALTD_USDC_UNIV2  // Address of the LP token
// );

output.methodology = "Fetches the localLiquidity of each token in the Altitude contract across multiple chains and computes the TVL.";

module.exports = output;
