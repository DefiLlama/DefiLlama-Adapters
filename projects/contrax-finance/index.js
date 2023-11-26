const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const Vaults = [
  "0x5cc3543656EfA30144965C6c538F4d8379F83138",
  "0x3C0c76ceb491Cb0Bacb31F8e7dc6407A25FD87C0",
  "0x286d24B99b5CB6fE081f0e6Bd44EcbfCC1171A56",
  "0x8f2CC9FC5ecf3D30aC83c96189cdd6EC2810E2f8",
  "0x3F9012f9bF3172c26B1B7246B8bc62148842B013",
  "0xeb952db71c594299cEEe7c03C3AA26FE0fDBC8eb",
  "0xdf9d86bC4765a9C64e85323A9408dbee0115d22E",
  "0xb58004E106409B00b854aBBF8CCB8618673d9346",
  "0xf8bDcf1Cf4134b2864cdbE685A8128F90ED0E16e",
  "0x46910A4AbA500b71F213150A0E99201Fd5c8FCec",
  "0xfd3573bebDc8bF323c65Edf2408Fd9a8412a8694",
  "0x8ca3f11485Bd85Dd0E952C6b21981DEe8CD1E901",
  "0x1dda3B8A728a62a30f79d1E2a10e3d6B85ef4C5d",
  "0x6C416e46424aF2676E9603F9D707f8d4808Bb5d8",
];
const HOP_MAGIC_VAULT = "0x2d79B76841191c9c22238535a93Ee8169096A5Cc";
const GMX_VAULT = "0x8CdF8d10ea6Cd3492e67C4250481A695c2a75C4a";
const GMX = ADDRESSES.arbitrum.GMX;

async function getHopMagicData(api) {
  const tokenAddress = await api.call({
    abi: "function token() view returns (address token)",
    target: HOP_MAGIC_VAULT,
    params: [],
  });
  const balance = await api.call({
    abi: "erc20:balanceOf",
    target: tokenAddress,
    params: [HOP_MAGIC_VAULT],
  });
  api.add(tokenAddress, balance);
}

async function getGMXData(api) {
  const balance = await api.call({
    abi: "erc20:balanceOf",
    target: GMX,
    params: [GMX_VAULT],
  });
  api.add(GMX, balance);
}

async function tvl(_, _1, _2, { api }) {
  let tokens = await api.multiCall({ abi: "address:token", calls: Vaults });
  // Controllers
  let targets = await api.multiCall({
    abi: "address:controller",
    calls: Vaults,
  });

  const bals = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: tokens.map((t, i) => ({ target: targets[i], params: [t] })),
  });
  await getHopMagicData(api);
  await getGMXData(api);
  
  api.addTokens(tokens, bals);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  methodology: "gets the lp balance of all vaults/controller/treasuries",
  arbitrum: {
    tvl,
  },
};
