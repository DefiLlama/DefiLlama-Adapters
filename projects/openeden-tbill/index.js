const { getTokenSupplies } = require('../helper/solana')
const { ripple } = require('../helper/chain/rpcProxy')

const evmUSDOAddr = {
    ethereum: '0x8238884Ec9668Ef77B90C6dfF4D1a9F4F4823BFe',
    base: '0xaD55aebc9b8c03FC43cd9f62260391c13c23e7c0',
}
const evmTBILLAddr = {
    ethereum: '0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a',
    arbitrum: '0xF84D28A8D28292842dD73D1c5F99476A80b6666A',
}
const solTBILLAddr = '4MmJVdwYN8LwvbGeCowYjSx7KoEi6BJWg8XXnW4fDDp6'
const xrpTBILLAddr = {
    issuerAddress: 'rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn',
    subscriptionOperatorAddress: 'rB56JZWRKvpWNeyqM3QYfZwW4fS9YEyPWM',
}

async function ethTVL(api) {
    const tbill = await api.call({ 
        abi: 'uint256:totalSupply',
        target: evmTBILLAddr.ethereum 
    })
    api.add(evmTBILLAddr.ethereum, tbill)

    const usdo = await api.call({ 
        abi: 'uint256:totalSupply', 
        target: evmUSDOAddr.ethereum 
    })
    api.add(evmUSDOAddr.ethereum, usdo)
}

async function arbTVL(api) {
    const tbill = await api.call({ 
        abi: 'uint256:totalSupply',
        target: evmTBILLAddr.arbitrum
    })
    api.add(evmTBILLAddr.arbitrum, tbill)
}

async function baseTVL(api) {
    const usdo = await api.call({ 
        abi: 'uint256:totalSupply', 
        target: evmUSDOAddr.base 
    })
    api.add(evmUSDOAddr.base, usdo)
}

async function solTVL(api) {
    const data = await getTokenSupplies([solTBILLAddr])
    Object.entries(data).forEach(([addr, tbill]) => {
        api.add(addr, tbill)
    })
}

async function xrpTVL(api) {
    const data = await ripple.gatewayBalances({
        account: xrpTBILLAddr.issuerAddress, 
        hotwallet: xrpTBILLAddr.subscriptionOperatorAddress, 
    })
    api.add(evmTBILLAddr.ethereum, Number(data.obligations?.TBL) * 1e6, { skipChain: true })
}

module.exports = {
  ethereum: { tvl: ethTVL },
  arbitrum: { tvl: arbTVL },
  base: { tvl: baseTVL},
  ripple: { tvl: xrpTVL },
  solana: { tvl: solTVL },
}