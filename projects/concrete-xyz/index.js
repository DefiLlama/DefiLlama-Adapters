const CONFIG = {
  ethereum: ['0x0Ed9E3271B7bD5a94E95d5c36d87321372B2FA14'],
  berachain: ['0x34C83440fF0b21a7DaD14c22fB7B1Bb3fc8433E6'],
  morph: ['0x04c60a0468BC0d329A0C04e8391699c41D95D981'],
  corn: ['0xed497422Eb43d309D63bee71741FF17511bAb577']
}

const abis = {
  getStrategies: "function getStrategies() view returns ((address strategy, (uint256 index, uint256 amount) allocation)[])",
  multiSig: 'function multiSig() view returns (address)',
}

const tvl = async (api) => {
  const registry = CONFIG[api.chain]
  const vaults = (await api.multiCall({ abi: 'address[]:getAllVaults', calls: registry })).flat()
  const rawStrategies = await api.multiCall({ abi: abis.getStrategies, calls: vaults })

  const strategies = rawStrategies.flatMap((strategies, i) => {
    const vault = vaults[i]
    if (!strategies.length) return null;
    return strategies.map(({ strategy }) => ({ vault, strategy }))
  }).filter(Boolean)

  const calls = strategies.map(({ strategy }) => ({ target: strategy }))

  const [tokens, multiSigs, balances] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls }),
    api.multiCall({ abi: abis.multiSig, calls, permitFailure: true }),
    api.multiCall({ abi: 'uint256:totalAssets', calls })
  ])

  const seenMultiSigs = new Set();

  strategies.forEach((_, i) => {
    const token = tokens[i];
    const multiSig = multiSigs[i];
    const balance = balances[i];

    if (!token || !multiSig || !balance) return;
    if (seenMultiSigs.has(multiSig)) return;
    seenMultiSigs.add(multiSig);
    api.add(token, balance);
  });
}

module.exports = {
  doublecounted: true
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})