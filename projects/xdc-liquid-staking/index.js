const xdcStakeRewardTokenAddress = '0x7f115F68A789F819047b94EFA0114AA9829b83d8'
const wrappedXdcAddress = '0x951857744785E80e2De051c32EE7b25f9c458C42' // Use Wrapped XDC Token for token price
// const xdcVaultAddress = '0xEb7bCbdCb6152e8f6b368F3843381c1F75bf247D'

const tvl = async (api) => {
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: xdcStakeRewardTokenAddress,
    })

    api.add(wrappedXdcAddress, totalSupply)
}

module.exports = {
    xdc: {tvl}
}