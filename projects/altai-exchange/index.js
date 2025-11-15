const TOKEN_LIST = [ 
  "0x99EBb9BFa6AF26E483fD55F92715321EB4C93aa9",
  "0x544ff249Be54bEaba1a80b4716D576222d41236d",
  "0x1f22a92AdcD346B0a4EAB1672F51584f15487c91",
  "0x5270A13CeA56f15AcfA8A58378cc8a643DFfDbFa",
  "0xf1E087d98928B99D02c2b72412608089688A979f"
];
const STAKE_CONTRACT = "0x4bB93E518b17ec37a00D0f8940cafbc65184BB99";

async function tvl(_, __, ___, { api }) {
  const balances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: TOKEN_LIST.map(token => ({
      target: token,
      params: STAKE_CONTRACT
    }))
  });

  balances.forEach((balance, i) => {
    if (+balance > 0) api.add(TOKEN_LIST[i], balance);
  });
}

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: false,
  methodology: "Altai Exchange is a Real World Assets (RWA) protocol on BNB Chain that tokenizes physical precious metals (gold, silver, platinum, palladium, etc.). TVL represents the total USD value of all RWA-backed tokens and stablecoins currently staked/locked in the official staking contract. Token prices are supplied directly on-chain via Pyth Network oracles, with some metal tokens using troy ounce (31.1 g) denomination that is automatically normalized by the protocol.",
  start: 1730287364,
  bsc: { tvl },
  hallmarks: [
    [1730287364, "Altai Exchange Mainnet Launch"]
  ]
};