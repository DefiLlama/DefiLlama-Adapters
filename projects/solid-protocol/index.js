const { queryContract, getBalance, getBalance2 } = require("../helper/chain/cosmos");

// Solid Protocol — CDP-style lending protocol on Terra2 (phoenix-1).
// https://solidcapa.com — mints the SOLID stablecoin against LSD & blue-chip
// collateral (ampLUNA, bLUNA, wBTC.axl, wETH.axl, USDC).
//
// TVL = collateral held by the protocol's custody contracts + any residual
// balances in the Market and Liquidation Queue contracts. ampLUNA is priced
// in LUNA via the Eris Hub exchange rate; bLUNA is priced 1:1 against LUNA.
// For testing run: node test.js projects/solid-protocol/index.js

const CHAIN = "terra2";

const ERIS_HUB = "terra10788fkzah89xrdm27zkj5yvhj9x3494lxawzm5qq3vvxcqz2yzaqyd3enk";

const AMPLUNA_CW20 = "terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct";
const BLUNA_CW20 = "terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml";

// Collateral custody + stake contracts
const COLLATERAL_OWNERS = {
  ampLuna: ["terra18uxq2k6wpsqythpakz5n6ljnuzyehrt775zkdclrtdtv6da63gmskqn7dq"],
  bLuna: ["terra1fyfrqdf58nf4fev2amrdrytq5d63njulfa7sm75c0zu4pnr693dsqlr7p9"],
  wbtc: [
    "terra1jksfmpavp09wwla8xffera3q7z49ef6r2jx9lu29mwvl64g34ljs7u2hln",
    "terra163nmjy97n7dqpdaxp6gts0xrnchn2nsg2d40wrgqnpguf0v9rvdslytfpz",
  ],
  weth: [
    "terra1xyxxg9z8eep6xkfts4sp7gper677glz0md4wd9krj4d8dllmut8q8tjjrl",
    "terra1lz9048tzegtspy35chwq2lmlhtwz8qq4jdvpua8yslskfnpk6yfsw06090",
  ],
  usdc: [
    "terra1shc5n0sqg30fzvg0e2j826j0g73ypmjw9vkf592ghdph5dhau25qha2rks",
    "terra1hdu4t2mrrv98rwdzps40va7me3xjme32upcw36x4cda8tx9cee9qrwdhsl",
  ],
};

// Contracts that may hold residual native uluna (Market escrow, liquidations).
const LUNA_OWNERS = [
  "terra1h4cknjl5k0aysdhv0h4eqcaka620g8h69k8h0pjjccxvf9esfhws3cyqnc", // Market
  "terra188d4q69nen6vmwt7vcvz8lf54mc80cfvqtrznpmsrawftm86jkmsh4grzp", // Liquidation Queue
  ...COLLATERAL_OWNERS.ampLuna,
  ...COLLATERAL_OWNERS.bLuna,
];

const TOKENS = {
  wbtc: {
    denom: "ibc/05D299885B07905B6886F554B39346EA6761246076A1120B1950049B92B922DD",
    coinGeckoId: "wrapped-bitcoin",
    decimals: 8,
  },
  weth: {
    denom: "ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674",
    coinGeckoId: "weth",
    decimals: 18,
  },
  usdc: {
    denom: "ibc/2C962DAB9F57FE0921435426AE75196009FAA1981BF86991203C8411F8980FDB",
    coinGeckoId: "usd-coin",
    decimals: 6,
  },
};

const LUNA_ID = "terra-luna-2";
const LUNA_DECIMALS = 6;

async function sumDenomAt(owners, denom) {
  // getBalance2 normalizes IBC denoms as "ibc:HASH" (colon separator).
  const key = denom.replace("ibc/", "ibc:");
  const perOwner = await Promise.all(
    owners.map(async (owner) => {
      const balances = await getBalance2({ chain: CHAIN, owner });
      return +(balances[key] || balances[denom] || 0);
    })
  );
  return perOwner.reduce((acc, v) => acc + v, 0);
}

async function sumCw20At(owners, token) {
  const balances = await Promise.all(
    owners.map((owner) => getBalance({ chain: CHAIN, token, owner }))
  );
  return balances.reduce((acc, v) => acc + (+v || 0), 0);
}

async function tvl() {
  const [
    ampLunaAmount,
    bLunaAmount,
    rawLunaAmount,
    wbtcAmount,
    wethAmount,
    usdcAmount,
    hubState,
  ] = await Promise.all([
    sumCw20At(COLLATERAL_OWNERS.ampLuna, AMPLUNA_CW20),
    sumCw20At(COLLATERAL_OWNERS.bLuna, BLUNA_CW20),
    sumDenomAt(LUNA_OWNERS, "uluna"),
    sumDenomAt(COLLATERAL_OWNERS.wbtc, TOKENS.wbtc.denom),
    sumDenomAt(COLLATERAL_OWNERS.weth, TOKENS.weth.denom),
    sumDenomAt(COLLATERAL_OWNERS.usdc, TOKENS.usdc.denom),
    queryContract({ chain: CHAIN, contract: ERIS_HUB, data: { state: {} } }),
  ]);

  const ampRate = +hubState.exchange_rate;

  const lunaEquivalent =
    (ampLunaAmount * ampRate + bLunaAmount + rawLunaAmount) /
    Math.pow(10, LUNA_DECIMALS);

  return {
    [LUNA_ID]: lunaEquivalent,
    [TOKENS.wbtc.coinGeckoId]: wbtcAmount / Math.pow(10, TOKENS.wbtc.decimals),
    [TOKENS.weth.coinGeckoId]: wethAmount / Math.pow(10, TOKENS.weth.decimals),
    [TOKENS.usdc.coinGeckoId]: usdcAmount / Math.pow(10, TOKENS.usdc.decimals),
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Sum of all collateral tokens (ampLUNA, bLUNA, wBTC.axl, wETH.axl, USDC) deposited into Solid Protocol custody and stake contracts on Terra2 (phoenix-1). ampLUNA is valued in LUNA via the Eris Hub exchange rate; bLUNA is valued 1:1 against LUNA.",
  terra2: {
    tvl,
  },
};
