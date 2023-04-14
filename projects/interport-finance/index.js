const sdk = require('@defillama/sdk');
const { itpEthereumTvl } = require("./itp-tvl");
const { lpRevShareLtv } = require("./lp-rev-share-tvl");

const vault = '0xEc8DDCb498b44C35EFaD7e5e43E0Caf6D16A66E8';

async function ethereumTvl(time, ethBlock, chainBlocks, { api }) {
  const balances = {};
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

  const balance = await sdk.api.erc20.balanceOf({
    target: usdtAddress,
    owner: vault,
    chain: api.chain,
  });

  sdk.util.sumSingleBalance(balances, usdtAddress, balance.output, api.chain);

  const itp = await itpEthereumTvl();
  sdk.util.mergeBalances(balances, itp);

  const lpRevShare = await lpRevShareLtv();
  sdk.util.mergeBalances(balances, lpRevShare);

  return balances;
}

async function bscTvl(time, ethBlock, chainBlocks, { api }) {
  const balances = {};
  const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';

  const balance = await sdk.api.erc20.balanceOf({
    target: usdtAddress,
    owner: vault,
    chain: api.chain,
  });

  sdk.util.sumSingleBalance(balances, usdtAddress, balance.output, api.chain);

  return balances;
}

async function polygonTvl(time, ethBlock, chainBlocks, { api }) {
  const balances = {};
  const usdtAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

  const balance = await sdk.api.erc20.balanceOf({
    target: usdtAddress,
    owner: vault,
    chain: api.chain,
  });

  sdk.util.sumSingleBalance(balances, usdtAddress, balance.output, api.chain);

  return balances;
}

async function avalancheTvl(time, ethBlock, chainBlocks, { api }) {
  const balances = {};
  const usdtAddress = '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7';

  const balance = await sdk.api.erc20.balanceOf({
    target: usdtAddress,
    owner: vault,
    chain: api.chain,
  });

  sdk.util.sumSingleBalance(balances, usdtAddress, balance.output, api.chain);

  return balances;
}

async function fantomTvl(time, ethBlock, chainBlocks, { api }) {
  const balances = {};
  const usdtAddress = '0x049d68029688eAbF473097a2fC38ef61633A3C7A';

  const balance = await sdk.api.erc20.balanceOf({
    target: usdtAddress,
    owner: vault,
    chain: api.chain,
  });

  sdk.util.sumSingleBalance(balances, usdtAddress, balance.output, api.chain);

  return balances;
}

async function arbitrumTvl(time, ethBlock, chainBlocks, { api }) {
  const balances = {};
  const usdtAddress = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';

  const balance = await sdk.api.erc20.balanceOf({
    target: usdtAddress,
    owner: vault,
    chain: api.chain,
  });

  sdk.util.sumSingleBalance(balances, usdtAddress, balance.output, api.chain);

  return balances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Interport TVL is calculated by summing the USDT balance of the vaults contracts, ITP token balance in the ITP Revenue Share contract and LP token balance in the LP Revenue Share contract.',
  ethereum: {
    tvl: ethereumTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  avax: {
    tvl: avalancheTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
};
