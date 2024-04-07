const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Tokens
const EZETH = "0x2416092f143378750bb29b79eD961ab195CcEea5";

// Lending pools
const LENDING_POOL_USDB = "0x4A1d9220e11a47d8Ab22Ccd82DA616740CF0920a";
const LENDING_POOL_WETH = "0x44f33bC796f7d3df55040cd3C631628B560715C2";

// Managers
const COLLATERAL_MANAGER = "0x6301795aa55B90427CF74C18C8636E0443F2100b";
const COLLATERAL_MANAGER_V2 = "0x105e285f1a2370D325046fed1424D4e73F6Fa2B0";
const WETH_COLLATERAL_MANAGER = "0x23eBa06981B5c2a6f1a985BdCE41BD64D18e6dFA";
const EZETH_COLLATERAL_MANAGER = "0xc81A630806d1aF3fd7509187E1AfC501Fd46e818";

// LPs
const THRUSTER_V3_NFP = "0x434575EaEa081b735C985FA9bf63CD7b87e227F9";
const THRUSTER_V2_WETH_USDB = "0x12c69BFA3fb3CbA75a1DEFA6e976B87E233fc7df";
const RING_V2_WETH_USDB = "0x9BE8a40C9cf00fe33fd84EAeDaA5C4fe3f04CbC3";

// External Vaults
const WASABI_USDB_VAULT = "0x4bed2a922654cacc2be974689619768fabf24855";
const WASABI_WETH_VAULT = "0x8E2b50413a53F50E2a059142a9be060294961e40";

// Strategies
const THRUSTER_V3_WETH_SPOT = "0x4A355D57fc1A5eEB33C0a19539744A2144220027";
const THRUSTER_V2_WETH_USDB_03 = "0x72E4ce9b7cC5d9C017F64ad58e512C253a11d30a";
const WASABI_USDB = "0x0CA56aa647E83A8F0a5f7a81a2fdcA393bC68D78";
const THRUSTER_V3_WETH_EZETH_SPOT_03 =
  "0x741011f52B7499ca951f8b8Ee547DD3Cdd813Fda";
const HYPERLOCK_V2_WETH_USDB = "0x8034b01555487C26D4e21F4E33b7A30fbc90d181";
const HYPERLOCK_V3_WETH_EZETH = "0xc28EffdfEF75448243c1d9bA972b97e32dF60d06";
const RING_WETH_USDB_V2 = "0xfEc64ae675CC4B1AacF8F9C0ABeaD585c5496382";
const WASABI_WETH = "0x98546CdD046219b25B2E617A55563A5e4a3b9Adc";

// Munchable
const MUNCHABLE_LOCKDROP_VAULT = "0x01F7dF622DDE3B7d234aadBE282DDA24CEAd9D21";
const MUNCHABLE_WETH_COLLATERAL_VAULT =
  "0x32b6C6322939263029A5CF37F14A59ab0A9E277c";

// [lp , contract]
const vaults = [
  [THRUSTER_V2_WETH_USDB, THRUSTER_V2_WETH_USDB_03],
  [EZETH, THRUSTER_V3_WETH_EZETH_SPOT_03],
  [RING_V2_WETH_USDB, RING_WETH_USDB_V2],
];

const wethHolders = [
  LENDING_POOL_WETH,
  COLLATERAL_MANAGER,
  COLLATERAL_MANAGER_V2,
  WETH_COLLATERAL_MANAGER,
  MUNCHABLE_LOCKDROP_VAULT,
  MUNCHABLE_WETH_COLLATERAL_VAULT,
  THRUSTER_V3_WETH_SPOT,
].map((a) => [ADDRESSES.blast.WETH, a]);

async function tvl(api) {
  const wasabiAbi = "function balanceOf(address) view returns (uint256)";
  // Wasbi weth Vault
  const wasabiWeth = await api.multiCall({
    abi: wasabiAbi,
    calls: [{ params: [WASABI_WETH] }],
    target: WASABI_WETH_VAULT,
  });
  api.add(ADDRESSES.blast.WETH, wasabiWeth);

  // Wasabi usdb Vault
  const wasabiUsdb = await api.multiCall({
    abi: wasabiAbi,
    calls: [{ params: [WASABI_USDB] }],
    target: WASABI_USDB_VAULT,
  });
  api.add(ADDRESSES.blast.USDB, wasabiUsdb);

  // Hyperlock v2 weth-usdb
  const thrusterv2LPs = [
    // [LP, contract]
    [THRUSTER_V2_WETH_USDB, HYPERLOCK_V2_WETH_USDB],
  ];
  const stakedLPCalls = thrusterv2LPs.map((lp) => ({ params: [lp[1], lp[0]] }));
  const v2Bals = await api.multiCall({
    abi: "function staked(address, address) view returns (uint256)",
    calls: stakedLPCalls,
    target: "0xc3ecadb7a5fab07c72af6bcfbd588b7818c4a40e",
  });
  const v2Tokens = thrusterv2LPs.map((lp) => lp[0]);
  api.add(v2Tokens, v2Bals);

  await sumTokens2({
    api,
    resolveLP: true,
    tokensAndOwners: [
      [ADDRESSES.blast.USDB, LENDING_POOL_USDB],
      [EZETH, EZETH_COLLATERAL_MANAGER],
      ...wethHolders,
      ...vaults,
    ],
    uniV3nftsAndOwners: [[THRUSTER_V3_NFP, HYPERLOCK_V3_WETH_EZETH]],
    uniV3ExtraConfig: {
      nftIdFetcher: "0x6E25B505085a69c31d535Ff5a687C7fa39e04E2a",
    },
  });
}

module.exports = {
  blast: {
    tvl,
  },
};
