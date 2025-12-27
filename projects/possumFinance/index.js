const { stakings } = require("../helper/staking");

/* -------------------------------------------------------------------------- */
/*                 NEW PROTOCOL (NO-LOSS PREDICTION MARKETS)                  */
/* -------------------------------------------------------------------------- */

// Protocol Token
const PSM = "0x17A8541B82BF67e10B0874284b4Ae66858cb1fd5";

// Staking contracts holding PSM (Signal Vaults)
const stakingContracts = [
  "0xb800B8dbCF9A78b16F5C1135Cd1A39384ABf1fbc",
];

const assetVaultList = {
  WETHUSDC: "0xc7A22081662fAEedC27993Cb72cbA6141e15ba48",
};

// TVL in Asset Vaults of the new protocol
async function newProtocolTvl(api) {
  const vaults = Object.values(assetVaultList);

  // Fetch UP_TOKEN and DOWN_TOKEN for each vault
  const upTokens = await api.multiCall({
    abi: "address:UP_TOKEN",
    calls: vaults,
  });

  const downTokens = await api.multiCall({
    abi: "address:DOWN_TOKEN",
    calls: vaults,
  });

  // Fetch actual token balances from ERC20.balanceOf(vault)
  const upBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: upTokens.map((token, i) => ({
      target: token,
      params: [vaults[i]],
    })),
  });

  const downBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: downTokens.map((token, i) => ({
      target: token,
      params: [vaults[i]],
    })),
  });

  // Add balances to TVL
  upTokens.forEach((token, i) => api.add(token, upBalances[i]));
  downTokens.forEach((token, i) => api.add(token, downBalances[i]));
}

/* -------------------------------------------------------------------------- */
/*                          OLD PROTOCOL (PORTALS V1/V2)                      */
/* -------------------------------------------------------------------------- */

const portalsContractAddress = "0x24b7d3034C711497c81ed5f70BEE2280907Ea1Fa";

const portalsV2 = {
  USDC: "0x9167CFf02D6f55912011d6f498D98454227F4e16",
  USDCE: "0xE8EfFf304D01aC2D9BA256b602D736dB81f20984",
  ETH: "0xe771545aaDF6feC3815B982fe2294F7230C9c55b",
  WBTC: "0x919B37b5f2f1DEd2a1f6230Bf41790e27b016609",
  ARB: "0x523a93037c47Ba173E9080FE8EBAeae834c24082",
  LINK: "0x51623b54753E07Ba9B3144Ba8bAB969D427982b6",
};

// TVL for the OLD protocol
async function oldProtocolTvl(api) {
  const vaults = [portalsContractAddress, ...Object.values(portalsV2)];

  const bals = await api.multiCall({
    abi: "uint256:totalPrincipalStaked",
    calls: vaults,
  });

  const tokens = await api.multiCall({
    abi: "address:PRINCIPAL_TOKEN_ADDRESS",
    calls: vaults,
  });

  api.add(tokens, bals);
}

/* -------------------------------------------------------------------------- */
/*                              COMBINED TVL LOGIC                             */
/* -------------------------------------------------------------------------- */

async function tvl(api) {
  await newProtocolTvl(api);
  await oldProtocolTvl(api);
}

module.exports = {
  methodology:
    "TVL includes Asset Vault balances of the No-Loss Prediction Market, plus staked PSM in Signal Vaults, and old Portals V1/V2 balances.",
  arbitrum: {
    staking: stakings(stakingContracts, PSM),
    tvl,
  },
  hallmarks: [
    [1715776637, "Launch: Portals V2"],
    [1735513200, "Sunset: Portals V1 & V2 (Upfront Yield)"],
    [1764540000, "Launch: No-Loss Prediction Markets"],
  ],
};