const factoryAbi = {
  "getPool": "function getPool(address token) view returns (address pool)",
  "getTokenAssets": "address[]:getTokenAssets"
}

const factory = "0x2C577706579E08A88bd30df0Fd7A5778A707c3AD";
const sparta = "0x3910db0600eA925F63C36DdB1351aB6E2c6eb102";

async function tvl(api) {
  let tokens = await api.call({ target: factory, abi: factoryAbi["getTokenAssets"], })
  const pools = await api.multiCall({ abi: factoryAbi.getPool, target: factory, calls: tokens })
  const ownerTokens = pools.map((pool, i) => [[tokens[i], sparta], pool])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology:
    "We count only the liquidity in the V2 pools. We do not include anything staked in the vaults nor any liquidity in the V1 pools.",
  bsc: {
    tvl,
  },
};
