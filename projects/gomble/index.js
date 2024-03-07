const sdk = require("@defillama/sdk")
const balanceOfUnderlyingAbi = "function balanceOfUnderlying(address token) external view returns (uint256)";
const stakingContractAddress = '0xAB8c9Eb287796F075C821ffafBaC5FeDAa4604d5';
const BNB = "0x0000000000000000000000000000000000000000";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const chain = 'bsc';

async function fetchLiquidity(ts, _block, chainBlocks, {api}) {
  const block = chainBlocks[chain]
  const { output: bnbAmount} = await sdk.api.abi.call({
    chain, block,
    target: stakingContractAddress,
    abi: balanceOfUnderlyingAbi,
    params: [BNB],
  });

  const { output: usdtAmount} = await sdk.api.abi.call({
    chain, block,
    target: stakingContractAddress,
    abi: balanceOfUnderlyingAbi,
    params: [USDT],
  });

  const { output: usdcAmount} = await sdk.api.abi.call({
    chain, block,
    target: stakingContractAddress,
    abi: balanceOfUnderlyingAbi,
    params: [USDC],
  });

  api.addTokens(
    [BNB, USDT, USDC],
    [bnbAmount, usdtAmount, usdcAmount]
  );
}

module.exports = {
  bsc: {
    tvl: fetchLiquidity,
  },
};
