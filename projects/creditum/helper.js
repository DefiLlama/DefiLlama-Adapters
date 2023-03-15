const abi = require('./abi.json')
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js');

async function handleYearnTokens(balances, tokens, owner, block, chain, transform) {
    let balance = (
      await sdk.api.abi.multiCall({
        calls: tokens.map((p) => ({
          target: p,
          params: owner,
        })),
        abi: "erc20:balanceOf",
        block,
        chain,
      })
    ).output;
    let pricePerShare = (
      await sdk.api.abi.multiCall({
        calls: tokens.map((p) => ({
          target: p,
        })),
        abi: "uint256:pricePerShare",
        block,
        chain,
      })
    ).output;
    let underlyingTokens = (
        await sdk.api.abi.multiCall({
          calls: tokens.map((p) => ({
            target: p,
          })),
          abi: abi.token,
          block,
          chain,
        })
      ).output;
    for (let i = 0; i < balance.length; i++) {
      let addr = transform(underlyingTokens[i].output.toLowerCase());
      const price = pricePerShare[i].output
      sdk.util.sumSingleBalance(
        balances,
        addr,
        BigNumber(balance[i].output)
          .times(price).div(10**Math.log10(price))
          .toFixed(0)
      );
    }
  }
module.exports = {
    handleYearnTokens
}