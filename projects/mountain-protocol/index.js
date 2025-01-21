const ADDRESSES = require('../helper/coreAssets.json')
const MOUNTAIN_PROTOCOL_CONTRACT = ADDRESSES.ethereum.USDM;
const ZKSYNC_MOUNTAIN_PROTOCOL_CONTRACT = ADDRESSES.zksync.USDM;

function chainTvl(chain){
  const contractAddress = chain == "zksync" ? ZKSYNC_MOUNTAIN_PROTOCOL_CONTRACT : MOUNTAIN_PROTOCOL_CONTRACT;
  return async (api) => {
    const totalSupply = await api.call({
      abi: "erc20:totalSupply",
      target: contractAddress,
    });
  
    const decimals = await api.call({
      abi: "erc20:decimals",
      target: contractAddress,
    });
  
    return {
      "usd-coin": totalSupply / 10 ** decimals,
    };
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the total USDM Supply",
  ethereum: {
    tvl: chainTvl("ethereum"),
  },
  polygon: {
    tvl: chainTvl("polygon"),
  },
  optimism: {
    tvl: chainTvl("optimism"),
  },
  base: {
    tvl: chainTvl("base"),
  },
  arbitrum: {
    tvl: chainTvl("arbitrum"),
  },
  zksync: {
    tvl: chainTvl("zksync"),
  },
  celo: {
    tvl: chainTvl("celo"),
  },
};
