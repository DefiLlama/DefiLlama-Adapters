const FINWB_ABI = {
getProtocolTvlTokensAndAmounts:
'function getProtocolTvlTokensAndAmounts() view returns (address[] tokens, uint256[] amounts)',
}

const CONTRACTS = {
ethereum: '0x1Ef96B8fad9aE983E60610C4ba13536606B5c477',
polygon: '0xd17127796D46c1588550Df783FCfE3D08ef8F6c0',
arbitrum: '0xF5d84413f2cd33d6d473BA9D0c665a73472d8fC7',
base: '0x199180dfbACEE5c204Db4E803A92a9D3A9Db4d1F',
bsc: '0x18A021d1c89Af87AaeD266B2C58dD16855Ad3702',
}

async function tvl(api) {
const contract = CONTRACTS[api.chain]

const [tokens, amounts] = await api.call({
target: contract,
abi: FINWB_ABI.getProtocolTvlTokensAndAmounts,
})

tokens.forEach((token, i) => {
api.add(token, amounts[i])
})
}

module.exports = {
methodology:
'FWB TVL is calculated from active user principal tracked on-chain by each deployed FWB contract via getProtocolTvlTokensAndAmounts(). User deposits are transferred to protocol payout wallets for managed fixed-yield operations, while the contracts keep active principal accounting per supported token.',
ethereum: {
tvl,
},
polygon: {
tvl,
},
arbitrum: {
tvl,
},
base: {
tvl,
},
bsc: {
tvl,
},
}
