const abi = require("./abi.json");

const CHAINS = {
  ethereum: "0xF80E51AFb613D764FA61751Affd3313C190A86BB",
  bsc: "0xF80E51AFb613D764FA61751Affd3313C190A86BB",
  polygon: "0xF80E51AFb613D764FA61751Affd3313C190A86BB",
  arbitrum: "0xF80E51AFb613D764FA61751Affd3313C190A86BB",
  avax: "0xF80E51AFb613D764FA61751Affd3313C190A86BB",
  optimism: "0xF80E51AFb613D764FA61751Affd3313C190A86BB",
  fantom: "0xF80E51AFb613D764FA61751Affd3313C190A86BB"
};

const BLOCK_NUMBERS = {
  ethereum: 17641746,
  bsc: 29753860,
  polygon: 44790231,
  arbitrum: 108765120,
  avax: 32293273,
  optimism: 106566230,
  fantom: 65647962
};

const PATH_COUNT = {
  ethereum: 14,
  bsc: 2,
  polygon: 3,
  arbitrum: 4,
  avax: 2,
  optimism: 2,
  fantom: 1
};

const chainPathsABI = abi.find(item => item.name === "chainPaths");

async function getTvlForChain(chain, contractAddress, { api }) {
  let chainTvl = {};
  for (let i = 0; i < PATH_COUNT[chain]; i++) {
    const result = await api.call({
      abi: chainPathsABI,
      target: contractAddress,
      params: [i],
      block: BLOCK_NUMBERS[chain],
      chain,
      skipCache: true
    });
    const tokenAddress = result[1];
    const balance = result[5];
    if (!chainTvl[tokenAddress]) {
      chainTvl[tokenAddress] = BigInt(balance);
    } else {
      chainTvl[tokenAddress] += BigInt(balance);
    }
  }
  return chainTvl;
}

const exportedObject = {
  methodology:
    "Fetches the localLiquidity of each token in the Altitude contract across multiple chains and computes the TVL."
};

for (const chain of Object.keys(CHAINS)) {
  exportedObject[chain] = {
    tvl: async (timestamp, block, chainBlocks, { api }) =>
      await getTvlForChain(chain, CHAINS[chain], { api })
  };
}

module.exports = exportedObject;
