const { stakings } = require("../helper/staking");

const stakingContracts = [
  "0xbc2B1262C90ab34757dC7eb2CB7CE595660Ff44e",
];

const ALTD = "0x8929e9DbD2785e3BA16175E596CDD61520feE0D1";

const GENERAL_CONTRACT = '0xF80E51AFb613D764FA61751Affd3313C190A86BB';
const EXTRA_CONTRACTS = {
  arbitrum: ['0xd6e501F92CE58623EE5D36f6BAdBcd35d87Ea522'],
  mantle: ['0xf0dbc067D21319068e1C2617e13FC28db83C18FE'],
};

const CHAINS = ["ethereum", "bsc", "polygon", "arbitrum", "avax", "optimism", "fantom", "linea", "mantle"];
const chainPathsAbi = "function chainPaths(uint256) view returns (bool ready, address srcToken, uint16 dstChainId, address dstToken, uint256 remoteLiquidity, uint256 localLiquidity, uint256 rewardPoolSize, address lpToken, bool stopSwap)";

let output = {};

CHAINS.forEach(chain => {
  output[chain] = {
    tvl: async (api) => {
      // Define a function to fetch tokens given a contract address
      const fetchTokens = async (contract) => {
        const tokens = [];
        let hasMoreTokens = false;
        let currentStart = 0;
        const fetchSize = 5;
        do {
          let res = await api.fetchList({
            itemAbi: chainPathsAbi,
            target: contract,
            itemCount: fetchSize + currentStart,
            start: currentStart,
            permitFailure: true
          });
          res = res.filter(i => i).map(i => i.srcToken);
          tokens.push(...res);
          currentStart += fetchSize;
          hasMoreTokens = res.length === fetchSize;
        } while (hasMoreTokens);
        return tokens;
      };
      
      // Fetch tokens from the general contract
      let tokens = await fetchTokens(GENERAL_CONTRACT);
      
      // If there are extra contracts for this chain, fetch those tokens too
      if(EXTRA_CONTRACTS[chain]) {
        for(const extraContract of EXTRA_CONTRACTS[chain]) {
          const extraTokens = await fetchTokens(extraContract);
          tokens = [...tokens, ...extraTokens];
        }
      }
      
      // Sum tokens for TVL
      return api.sumTokens({ owner: GENERAL_CONTRACT, tokens });
    }
  };
});


output.ethereum.staking = stakings(stakingContracts, ALTD);

output.methodology = "Fetches the localLiquidity of each token in the Altitude contract across multiple chains and computes the TVL.";

module.exports = output;
