

const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  const tcvFactory = "0xCa2396933E02Fb7636126a914aE5f5512ab31077";
  const index = await api.call({ target: tcvFactory, abi: 'uint256:numVaults', });
  const vaults = await api.call({ target: tcvFactory, abi: 'function vaults(uint256,uint256) returns (address[])', params: ["0", String(index)], });
  await sumTokens2({ api, resolveUniV3: true, owners: vaults })
}

module.exports = {
  methodology: "Calculates total liquidity from all NFT ranges in the given pools.",
  start: '2024-06-01',
  arbitrum: {
    tvl,
  },
};