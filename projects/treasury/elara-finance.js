const NAV_AGGREGATOR = '0x507f997c64dE57e189ed1ce95b832CE7b65FAc50'

const tvl = async (api) => {
    const tokens = await api.fetchList({ target: NAV_AGGREGATOR, lengthAbi: 'uint256:tokenCount', itemAbi: 'function getToken(uint256 index) view returns (address)' })
    const wallets = await api.fetchList({ target: NAV_AGGREGATOR, lengthAbi: 'uint256:walletCount', itemAbi: 'function getWallet(uint256 index) view returns (address)' })
    const adapters = await api.fetchList({ target: NAV_AGGREGATOR, lengthAbi: 'uint256:adapterCount', itemAbi: 'function getAdapter(uint256 index) view returns (address)' })
    const calls = adapters.flatMap(adapter => wallets.map(wallet => ({ target: adapter, params: [wallet] })))
    const positionValues = await api.multiCall({ abi: 'function getPositionValue(address wallet) view returns (uint256)', calls, })

    positionValues.forEach((value, i) => { if (value && value !== '0') api.addUSDValue(Number(BigInt(value) / 10n ** 12n) / 1e6)})

    await api.sumTokens({ tokens, owners: wallets })
}

module.exports = {
  start: '2026-06-16',
  ethereum: { tvl },
}