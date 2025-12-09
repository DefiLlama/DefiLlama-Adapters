const ADDRESSES = require('../helper/coreAssets.json')


const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  const tcvFactory = "0xCa2396933E02Fb7636126a914aE5f5512ab31077";
  const routerFarmingUniV3 = "0x1AC0083dDA51dEde7a4f9F35a78fc02f91a242e7";
  const autodca = "0xE9c47aAcB92E4E694736e1072ff0C0A79A841daa"
  const tokens = [
    // ARB
    ADDRESSES.arbitrum.ARB,
    // WETH
    ADDRESSES.arbitrum.WETH,
    // USDC
    ADDRESSES.arbitrum.USDC_CIRCLE,
    // WBTC
    ADDRESSES.arbitrum.WBTC
  ]
  const index = await api.call({ target: tcvFactory, abi: 'uint256:numVaults', });
  const vaults = await api.call({ target: tcvFactory, abi: 'function vaults(uint256,uint256) returns (address[])', params: ["0", String(index)], });
  await sumTokens2({ api, resolveUniV3: true, owners: vaults });
  await sumTokens2({ api, resolveUniV3: true, owner: routerFarmingUniV3 });
  for (const token of tokens) {
    api.add(token, await api.call({ target: autodca, abi: 'function getBalance(address) view returns (uint256)', params: [token] }))
  }
}

module.exports = {
  methodology: "Calculates total liquidity from TCV",
  start: '2025-09-15',
  arbitrum: {
    tvl,
  },
};