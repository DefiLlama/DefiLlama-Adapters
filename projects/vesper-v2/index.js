// Vesper 2 (backend of Odyssey Earn). Users deposit collateral to mint a pegged token (USDv / ETHv);
// the collateral is held by each instance's Treasury as shares of an ERC4626 yield vault.
const INSTANCES = {
  USDv: { treasury: '0xd4765523fd844eddf9e6efe136a48012bcd5503a', yieldVault: '0x3aed4dd0b5ba616156fa352274670c18d2ec2a81' },
  ETHv: { treasury: '0x41679fa9bdcb910f392da163e8c8b9173a78f34f', yieldVault: '0x025a05f1967521806bb4c8a10ba4b8c00a794f65' },
}

async function tvl(api) {
  const instances = Object.values(INSTANCES)
  const vaults = instances.map(i => i.yieldVault)
  const shares = await api.multiCall({ abi: 'erc20:balanceOf', calls: instances.map(i => ({ target: i.yieldVault, params: i.treasury })) })
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const amounts = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: vaults.map((target, i) => ({ target, params: shares[i] })) })
  api.add(assets, amounts)
}

module.exports = {
  start: '2026-06-02',
  methodology: 'Counts the collateral (USDC, WETH) backing the USDv and ETHv pegged tokens: each instance Treasury holds the collateral as ERC4626 yield-vault shares, valued via convertToAssets. Staked USDv/ETHv (sUSDv/sETHv) is excluded since it is minted against that same collateral.',
  ethereum: { tvl },
}
