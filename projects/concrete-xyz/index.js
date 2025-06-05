const CONFIG = {
  ethereum: ['0x0Ed9E3271B7bD5a94E95d5c36d87321372B2FA14'],
  berachain: ['0x34C83440fF0b21a7DaD14c22fB7B1Bb3fc8433E6'],
  morph: ['0x04c60a0468BC0d329A0C04e8391699c41D95D981'],
  corn: ['0xed497422Eb43d309D63bee71741FF17511bAb577']
}

const abis = {
  getStrategies: "function getStrategies() view returns ((address strategy, (uint256 index, uint256 amount) allocation)[])",
  multiSig: 'function multiSig() view returns (address)',
  withdrawEnabled: "function withdrawEnabled() view returns (bool)",
  maxWithdraw: "function maxWithdraw(address owner) view returns (uint256)",
  getAvailableAssetsForWithdrawal: "function getAvailableAssetsForWithdrawal() view returns (uint256)"
}

const tvl = async (api) => {
  const registry = CONFIG[api.chain]
  if (!registry.length) return;
  const vaults = (await api.multiCall({ abi: 'address[]:getAllVaults', calls: registry })).flat()
  const rawStrategies = await api.multiCall({ abi: abis.getStrategies, calls: vaults })

  const strategies = rawStrategies.flatMap((strategies, i) => {
    const vault = vaults[i]
    if (!strategies.length) return null;
    return strategies.map(({ strategy }) => ({ vault, strategy }))
  }).filter(Boolean)

  const calls = strategies.map(({ strategy }) => ({ target: strategy }))

  const [assets, multiSigs, balances, withdrawEnableds] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls }),
    api.multiCall({ abi: abis.multiSig, calls, permitFailure: true }),
    api.multiCall({ abi: 'uint256:totalAssets', calls }),
    api.multiCall({ abi: abis.withdrawEnabled, calls, permitFailure: true }),
  ])

  const seenMultiSigs = new Set();
  const strategiesDatas = []

  strategies.forEach(({ vault, strategy }, i) => {
    const asset = assets[i];
    const multiSig = multiSigs[i];
    const balance = Number(balances[i]);
    const withdrawEnabled = withdrawEnableds[i];

    if (!asset || !multiSig || !balance || !withdrawEnabled) return;

    if (!seenMultiSigs.has(multiSig)) {
      seenMultiSigs.add(multiSig);
      strategiesDatas.push({ vault, strategy, asset, multiSig, balance, withdrawEnabled });
    }
  });

  const [vaultBalances, multiSigResiduals] = await Promise.all([
    api.multiCall({ calls: strategiesDatas.map((s) => ({ target: s.vault, params: [s.multiSig] })), abi: 'erc20:balanceOf' }),
    api.multiCall({ calls: strategiesDatas.map((s) => ({ target: s.asset, params: [s.multiSig] })), abi: 'erc20:balanceOf' }),
  ])

  strategiesDatas.forEach(({ asset, balance }, i) => {
    const vaultBalance = Number(vaultBalances[i])
    const multiSigResidual = Number(multiSigResiduals[i])

    const value = api.chain === 'berachain'
      ? balance + multiSigResidual - vaultBalance / 10 ** 9
      : multiSigResidual - vaultBalance / 10 ** 9;

    api.add(asset, value);
  })
}


Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})