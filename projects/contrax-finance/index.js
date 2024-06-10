const ADDRESSES = require("../helper/coreAssets.json");
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
  // Peapods Vaults
  "0x92781a20B6447F304E72321ed4BC8ca4349b3739",
  "0x91805fD2cB80ad57379842630a569aC6D72E1B47",
  "0x7f9E71e0d829619b5445073d034927347cf0e3eA",
  "0xAFbC45a9aaaD39aC26dC4D2Cc32Dc4187d897eCa",
  "0x483a461745e4245D5B7Be0BBFb580940d6a4F52a",
  "0x0fC2106678F73cFe2D7C09631c05E6eB079EF36A",
];
const HOP_MAGIC_VAULT = "0x2d79B76841191c9c22238535a93Ee8169096A5Cc";
const GMX_VAULT = "0x8CdF8d10ea6Cd3492e67C4250481A695c2a75C4a";
const GMX = ADDRESSES.arbitrum.GMX;
const STEER_VAULTS = ["0x3fB6C1C5b7319Af78608570F97b920a553aB0Ed3", "0xe41586C416D8fAb3ee01e8a29DaD6f3a8655097d"];

async function getHopMagicData(api) {
  const tokenAddress = await api.call({
    abi: "function token() view returns (address token)",
    target: HOP_MAGIC_VAULT,
    params: [],
  });
  const balance = await api.call({
    abi: "uint256:balance",
    target: HOP_MAGIC_VAULT,
  });
  api.add(tokenAddress, balance);
}

async function getSteerData(api) {
  let tokens = await api.multiCall({ abi: "address:steerVault", calls: STEER_VAULTS });
  let bals = await api.multiCall({
    abi: "uint256:balance",
    calls: STEER_VAULTS,
  });
  api.addTokens(tokens, bals);
}

async function getGMXData(api) {
  const balance = await api.call({
    abi: "uint256:balance",
    target: GMX_VAULT,
  });
  api.add(GMX, balance);
}

async function tvl(api) {
  let tokens = await api.multiCall({ abi: "address:token", calls: Vaults });
  let bals = await api.multiCall({
    abi: "uint256:balance",
    calls: Vaults,
  });

  // const bals = await api.multiCall({
  //   abi: "erc20:balanceOf",
  //   calls: tokens.map((t, i) => ({ target: targets[i], params: [t] })),
  // });
  await getHopMagicData(api);
  await getGMXData(api);
  await getSteerData(api);

  api.addTokens(tokens, bals);
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  methodology: "gets the lp balance of all vaults/controller/treasuries",
  arbitrum: {
    tvl,
  },
};
