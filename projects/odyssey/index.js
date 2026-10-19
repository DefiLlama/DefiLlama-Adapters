// PositionRegistry, same address on every chain
const REGISTRY = '0xee156d8ea7b96a5524ccc3cf9283ab85e80e9534'

async function tvl(api) {
    const positions = await api.call({ target: REGISTRY, abi: 'address[]:getPositions' })
    const assets = await api.multiCall({ abi: 'address:asset', calls: positions })
    const amounts = await api.multiCall({ abi: 'uint256:depositedAmount', calls: positions })
    api.add(assets, amounts)
}

module.exports = {
    methodology: 'Sums the collateral each Odyssey position contract holds in its underlying lending market (Morpho Blue, Aave V3, Compound V3, Euler V2, Metronome Synth), read on-chain via depositedAmount() for every position in the PositionRegistry. Leveraged positions are counted at full collateral, including the part bought with borrowed funds.',
}

;['ethereum', 'base', 'optimism', 'plasma', 'robinhood'].forEach(chain => {
    module.exports[chain] = { tvl }
})
