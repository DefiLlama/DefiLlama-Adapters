const CHAINS = {
  ethereum: {
    contract: '0xa0DA53447C0f6C4987964d8463da7e6628B30f82',
    token: '0x09D1d767eDF8Fa23A64C51fa559E0688E526812F',
    chainId: 'ethereum',
    startBlock: 17733049,
  },
  gnosis: {
    contract: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
    token: '0x79c872ed3acb3fc5770dd8a0cd9cd5db3b3ac985',
    chainId: 'xdai',
    startBlock: 30398144,
  },
  polygon: {
    contract: '0x1fe74A08ac89300B102AdCd474C721AE8764E850',
    token: '0x62309056c759c36879Cde93693E7903bF415E4Bc',
    chainId: 'polygon',
    startBlock: 52472849,
  },
};

async function fetchBalance(api, target, params, chain, block) {
  try {
    return await api.call({
      abi: 'erc20:balanceOf',
      target,
      params,
      chain,
      block,
    });
  } catch {
    return '0'; // Return '0' on error or if the call returns undefined/null
  }
}

async function calculateTVL(chain, timestamp, ethBlock, chainBlocks, { api }) {
  const chainInfo = CHAINS[chain];
  const lpTokenBalance = await fetchBalance(api, chainInfo.token, [chainInfo.contract], chainInfo.chainId, chainBlocks[chainInfo.chainId]);

  console.log(`${chain} LP Token Balance:`, lpTokenBalance); // Debug log

  return { [chainInfo.chainId + ':' + chainInfo.token]: lpTokenBalance };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts the LP tokens held in the Olas contract on Ethereum, in the bridging contract on Gnosis, and on Polygon.',
  ethereum: {
    start: CHAINS.ethereum.startBlock,
    tvl: (timestamp, ethBlock, chainBlocks, api) => calculateTVL('ethereum', timestamp, ethBlock, chainBlocks, api),
  },
  xdai: {
    start: CHAINS.gnosis.startBlock,
    tvl: (timestamp, ethBlock, chainBlocks, api) => calculateTVL('gnosis', timestamp, ethBlock, chainBlocks, api),
  },
  polygon: {
    start: CHAINS.polygon.startBlock,
    tvl: (timestamp, ethBlock, chainBlocks, api) => calculateTVL('polygon', timestamp, ethBlock, chainBlocks, api),
  },
};
