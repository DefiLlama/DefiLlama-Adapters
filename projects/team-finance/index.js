const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const { addTokensAndLPs } = require("../helper/unwrapLPs");
const { ethereumContractData } = require("./config");
const BigNumber = require("bignumber.js");

function ethereumTvl(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {

      const contractAddress = args[i].contract
      const abi = args[i].contractABI
      const balances = {};
      const chain = args[i].chain
      const block = chainBlocks[chain]

      const totalDepositId = Number(
        (
          await sdk.api.abi.call({
            abi: abi.depositId,
            target: contractAddress,
            chain: chain,
            block: block 
          })
        ).output
      );

      const allDepositId = Array.from(Array(totalDepositId).keys());
      const lpAllTokens = (
        await sdk.api.abi.multiCall({
          abi: abi.getDepositDetails,
          calls: allDepositId.map((num) => ({
            target: contractAddress,
            params: num,
          })),
          chain: chain,
          block: block 
        })
      ).output.map((lp) => (lp.output[0].toLowerCase())) 

      const lpFilterTokens = lpAllTokens.sort().filter(function (item, pos, ary) {
        return (!pos || item != ary[pos - 1]) && item != "0x0000000000000000000000000000000000000000";
      });

      const lpTokens = lpFilterTokens.map((lp) => ({ output: lp.toLowerCase() }));
      const amounts =
        (
          await sdk.api.abi.multiCall({
            abi: erc20.balanceOf,
            calls: lpTokens.map((lp) => ({
              target: lp.output,
              params: contractAddress,
            })),
            chain: chain,
            block: block,
          })
        )

      const transformAddress = addr => `${chain}:${addr}`;
      const tokens = { output: lpTokens };

      await addTokensAndLPs(
        balances,
        tokens,
        amounts,
        chainBlocks[chain],
        chain,
        transformAddress
      );

      for (const [token, balance] of Object.entries(balances)) {
        if (!totalBalances[token]) totalBalances[token] = '0'
        totalBalances[token] = BigNumber(totalBalances[token]).plus(BigNumber(balance)).toFixed(0)
      }
    }
    return totalBalances
  }
};

module.exports = {
  methodology: '',
  ethereum: {
    tvl: ethereumTvl(ethereumContractData),
  },
};

