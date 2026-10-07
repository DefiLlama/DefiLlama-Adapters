// DeTrade's Lagoon vaults invest in one another. Subtract the exact ERC-4626
// position held by a parent strategy Safe from the child vault's TVL.
const VAULT = {
  coreUsdc: "0x8092ca384d44260ea4feaf7457b629b8dc6f88f0", // Base
  coreEurc: "0xd4401d8bea82e4e6c40bb26ae3a04d2fb7ca4550", // Base
  coreEth: "0x9b97bfdfe44d1b113ecd4bf2f243ed36aca34523", // Base
  applefarm: "0x0a63471da694fc822f5a0a0b65978dda8c8edbe5", // Base
  murmurr: "0x7d2c2f54792ad72cb834d298f542145b06b703cb", // Ethereum
  coreAusd: "0xe95074a86fead8647edff36af2f3f1dd7e8f7adb", // Monad
};

// Lagoon's curating Safes, verified against its vault roles and DeTrade's
// position snapshots. Core USDC uses the same Safe address on Ethereum.
const SAFE = {
  coreUsdc: "0xc6835323372a4393b90bcc227c58e82d45ce4b7d",
  coreEurc: "0xd201b0947ae7b057b0751e227b07d37b1a771570",
  coreEth: "0x66dbcee7fea3287b3356227d6f3dff3cefbc6f3c",
};

const convertToAssetsAbi = "function convertToAssets(uint256 shares) view returns (uint256 assets)";

async function subtractSharesHeldBy(api, childVault, parentSafes) {
  const shares = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: parentSafes.map((owner) => ({ target: childVault, params: [owner] })),
  });

  const calls = shares
    .filter((amount) => BigInt(amount) > 0n)
    .map((amount) => ({ target: childVault, params: [amount] }));
  if (!calls.length) return;

  const [asset, nestedAssets] = await Promise.all([
    api.call({ abi: "address:asset", target: childVault }),
    api.multiCall({ abi: convertToAssetsAbi, calls }),
  ]);
  nestedAssets.forEach((amount) => api.add(asset, -BigInt(amount)));
}

async function baseTvl(api) {
  await api.erc4626Sum2({ calls: [VAULT.coreUsdc, VAULT.coreEurc, VAULT.coreEth, VAULT.applefarm] });
  // Core EURC and Core ETH Safes each own Core USDC shares on Base.
  await subtractSharesHeldBy(api, VAULT.coreUsdc, [SAFE.coreEurc, SAFE.coreEth]);
  // Core EURC can also allocate to Applefarm; its share balance is currently zero.
  await subtractSharesHeldBy(api, VAULT.applefarm, [SAFE.coreUsdc, SAFE.coreEurc, SAFE.coreEth]);
  return api.getBalances();
}

async function ethereumTvl(api) {
  await api.erc4626Sum2({ calls: [VAULT.murmurr] });
  // The Core USDC strategy Safe owns Murmurr shares on Ethereum.
  await subtractSharesHeldBy(api, VAULT.murmurr, [SAFE.coreUsdc]);
  return api.getBalances();
}

async function monadTvl(api) {
  await api.erc4626Sum2({ calls: [VAULT.coreAusd] });
  // The Core USDC strategy Safe (same address on Monad) held Core AUSD shares until ~Apr 2026.
  await subtractSharesHeldBy(api, VAULT.coreAusd, [SAFE.coreUsdc]);
  return api.getBalances();
}

module.exports = {
  doublecounted: true, // These same vaults also appear under Lagoon's protocol TVL.
  methodology: "Counts on-chain totalAssets() for DeTrade's three Base Core vaults, Base Applefarm, Ethereum Murmurr and Monad Core AUSD. Subtracts only the underlying value of nested vault shares held by the Core EURC, Core ETH or Core USDC strategy Safes, using balanceOf() and convertToAssets() on the child vaults. This curator listing overlaps Lagoon TVL.",
  base: { tvl: baseTvl },
  ethereum: { tvl: ethereumTvl },
  monad: { tvl: monadTvl },
};
