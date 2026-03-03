
const { getTvl: getDriftVaultTvl } = require("../neutral-trade/utils/drift")

const DRIFT_VAULTS = [
  // PUBLIC
  {
    name: "USDC Alpha Stable",
    address: "EwHHtPNHttdUNHxVFdt9v1xuQyDnNcE5FzXWSTh1HG7n",
  },
  {
    name: "USDC Alpha Aggressive",
    address: "93gLh83YceGb6Cm3oYdutZ8xY9si5JX5dU7Ei6LkZHbJ",
  },
  {
    name: "USDC Staking (Neutral JLP)",
    address: "DrC6TVpLHtyL4JvFnxLscQsxatmN1sRi4v8SN2uqBDa7",
  },
];

const ENZYME_VAULTS = [
  {
    name: "BTC Quant Trend Following",
    address: "0xfb48ae6a8e7bd05f9ef542708dd632bc8517539e",
    valueAsset: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", // cbBTC
  },
];


async function drift_vaults_tvl(api) {
  await getDriftVaultTvl(
    api,
    DRIFT_VAULTS.map((vault) => vault.address)
  );
}

async function enzymeTvl(api) {
  const addresses = ENZYME_VAULTS.map((v) => v.address);
  const valueAssets = ENZYME_VAULTS.map((v) => v.valueAsset);
  const [shareValues, totalSupplies, decimals] = await Promise.all([
    api.multiCall({ calls: addresses, abi: 'uint256:shareValue' }),
    api.multiCall({ calls: addresses, abi: 'uint256:totalSupply' }),
    api.multiCall({ calls: valueAssets, abi: 'erc20:decimals' }),
  ]);
  for (let i = 0; i < ENZYME_VAULTS.length; i++) {
    // shareValue is in 18-decimal precision, convert to value asset's decimals
    const nav = BigInt(shareValues[i]) * BigInt(totalSupplies[i]) / (10n ** BigInt(36 - decimals[i]));
    api.add(ENZYME_VAULTS[i].valueAsset, nav.toString());
  }
}


module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "The combined TVL of all vaults.",
  solana: { tvl: drift_vaults_tvl },
  base: { tvl: enzymeTvl },
};
