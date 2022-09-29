const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const tokens = {
  BFR: "0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D",
  USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
};

const contracts = {
  POOL: "0x37Cdbe3063002383B2018240bdAFE05127d36c3C",
  STAKING: "0x173817F33f1C09bCb0df436c2f327B9504d6e067"
}

const tvl = async (timestamp, block, chainBlocks) =>{
  const transform = await transformArbitrumAddress();
  const balances = {};
  const allTokens = [tokens.USDC];
  const tokenBalances = await sdk.api.abi.multiCall({
      block: chainBlocks.arbitrum,
      calls: allTokens.map(token=>({
          target: token,
          params: [contracts.POOL]
      })),
      abi: 'erc20:balanceOf',
      chain: 'arbitrum',
  });
  sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);
  return balances;
};

const staking = async (timestamp, block, chainBlocks) =>{
  const bfrLocked = (await sdk.api.erc20.balanceOf({
      target: tokens.BFR,
      owner: contracts.STAKING,
      chain: 'arbitrum',
      block: chainBlocks.arbitrum
  }));
  return { [`arbitrum:${tokens.BFR}`]: bfrLocked.output }
}

module.exports = {
  arbitrum: {
    staking: staking,
    tvl: tvl
  },
};