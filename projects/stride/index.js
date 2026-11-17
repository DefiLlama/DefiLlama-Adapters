const sdk = require("@defillama/sdk");
const { sumTokens } = require("../helper/chain/cosmos");

// stTokens were minted on these chains' host zones. The Stride chain halted on 2026-11-13, keys kept so tvl history stays
const haltedChains = [
  "stride", "cosmos", "stargaze", "juno", "terra2", "evmos", "injective", "umee",
  "comdex", "sommelier", "dydx", "celestia", "dymension", "islm", "band",
];

// Stride admin multisig on Osmosis: admin of every stToken redemption pool and holder of their alloyed LP
const OSMOSIS_VAULT = "osmo1k8c2m5cn322akk5wy8lpt87dd2f4yh9afcd7af";
const MAX_POOL_CANDIDATES = 100;

// native tokens backing the pools, the stTokens already redeemed into them are not counted
const NATIVE_DENOMS = [
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
  "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877", // TIA
  "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273", // INJ
  "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA", // ISLM
  "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C", // DYDX
  "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE", // BAND
  "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED", // JUNO
  "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9", // LUNA
  "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E", // SOMM
  "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2", // SAGA
  "uosmo",
];

// a pool is the factory creator of an alloyed LP denom in the vault, kept only while the vault holds most of that LP
async function redemptionPools() {
  const balances = await sdk.chains.cosmos.getBalances({ chain: "osmosis", owner: OSMOSIS_VAULT });
  const candidates = balances.filter(({ denom }) => /^factory\/osmo1[a-z0-9]+\/alloyed\/st/.test(denom));
  if (candidates.length > MAX_POOL_CANDIDATES)
    throw new Error(`stride: ${candidates.length} alloyed denoms in the Osmosis vault, above ${MAX_POOL_CANDIDATES}`);

  const pools = [];
  for (const { denom, amount } of candidates) {
    const supply = BigInt(await sdk.chains.cosmos.totalSupply({ chain: "osmosis", denom }));
    if (BigInt(amount) > supply) throw new Error(`stride: vault holds more ${denom} than its supply`);
    if (BigInt(amount) * 2n > supply) pools.push(denom.split("/")[1]);
  }
  if (pools.length === 0) throw new Error("stride: no redemption pool owned by the Osmosis vault");
  return pools;
}

async function osmosisTvl(api) {
  const owners = await redemptionPools();
  return sumTokens({ api, owners, tokens: NATIVE_DENOMS });
}

module.exports = {
  timetravel: false,
  methodology:
    "Until the Stride chain halted on 2026-11-13, counted each stToken's supply times its redemption rate. Since the halt, counts the native tokens backing stToken redemptions in the Osmosis transmuter pools owned by Stride's multisig, without the stTokens already redeemed into them. On Berachain, counts the receipt tokens staked in Stride's manager contract.",
  hallmarks: [
    ['2026-09-29', 'Stride chain shutdown proposed (funding shortfall); redemptions until Oct 12, moving to Osmosis ~Nov 20'],
    ['2026-11-13', 'Stride chain halted, stToken backing moved to Osmosis redemption pools'],
  ],
  osmosis: {
    tvl: osmosisTvl,
  },
}; // node test.js projects/stride/index.js

for (const chain of haltedChains) {
  module.exports[chain] = { tvl: () => ({}) };
}

// ############### Berachain TVL ###############
// Berachain TVL is calculated differently than the other chains Stride
// supports.
const MANAGER_CONTRACT_ADDRESS = "0xDcc5E38f0207757604c5a4925A870dE9554395b4";
function makeBerachainTvlFn() {
  return async (api) => {
    // Get all whitelisted receipt tokens (vaults)
    const receipts = await api.call({
      target: MANAGER_CONTRACT_ADDRESS,
      abi: 'function receipts() view returns (address[])',
    });

    // For each vault, get the total staked amount
    const stakedAmounts = await api.multiCall({
      target: MANAGER_CONTRACT_ADDRESS,
      abi: "function totalStakedByReceipt(address receipt) view returns (uint256)",
      calls: receipts,
    });
    api.add(receipts, stakedAmounts);
  };
}

module.exports["berachain"] = {
  tvl: makeBerachainTvlFn(),
};
