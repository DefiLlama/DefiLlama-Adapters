const sdk = require("@defillama/sdk");
const MOUNTAIN_PROTOCOL_CONTRACT = "0x59d9356e565ab3a36dd77763fc0d87feaf85508c";

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
  start: 16685700,
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
