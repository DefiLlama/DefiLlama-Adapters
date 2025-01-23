const ADDRESSES = require('../helper/coreAssets.json')
const MOUNTAIN_PROTOCOL_CONTRACT = ADDRESSES.ethereum.USDM;

async function tvl(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: MOUNTAIN_PROTOCOL_CONTRACT,
  });

  const decimals = await api.call({
    abi: "erc20:decimals",
    target: MOUNTAIN_PROTOCOL_CONTRACT,
  });

  return {
    "usd-coin": totalSupply / 10 ** decimals,
  };
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the total USDM Supply",
  ethereum: {
    tvl,
  },
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
  },
  base: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
};
