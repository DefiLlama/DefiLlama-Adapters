const sdk = require('@defillama/sdk');
const abi = require("./abi.json");

const TokenMerger = '0x36A06C470342Fc3443d768a9c85Aa43985D82219';


async function tvl(chain, chainBlocks) {
    const balances = {};
  
    const fragmentedTokens = await sdk.api.abi.call({
      abi: abi.getAllFragmentedTokens,
      target: TokenMerger,
      params: [],
      chain: chain,
      block: chainBlocks[chain],
    });
  
    for (const fragmentedToken of fragmentedTokens.output) {
      const fragmentedTokenBalance = await sdk.api.erc20.balanceOf({
        target: fragmentedToken,
        owner: TokenMerger,
        chain: chain,
        block: chainBlocks[chain],
      });
  
      sdk.util.sumSingleBalance(
        balances,
        fragmentedToken,
        fragmentedTokenBalance.output,
        chain
      );
    }
  
    return balances;
  }

module.exports = {
  methodology: 'Counts the total balance of Fragmented tokens held in the Token Merger contract on Milkomeda C1 MACC.',
  milkomeda: {
    start: 0,
    tvl: (timestamp, block, chainBlocks) => tvl('milkomeda', chainBlocks)
  },
};

