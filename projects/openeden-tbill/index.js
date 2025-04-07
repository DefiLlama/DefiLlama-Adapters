const { ripple } = require('../helper/chain/rpcProxy')

const evmTBILLAddr = {
    ethereum: '0xdd50C053C096CB04A3e3362E2b622529EC5f2e8a',
    arbitrum: '0xF84D28A8D28292842dD73D1c5F99476A80b6666A',
}

const xrpTBILLAddr = {
    issuerAddress: 'rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn',
    subscriptionOperatorAddress: 'rB56JZWRKvpWNeyqM3QYfZwW4fS9YEyPWM',
}

async function ethTVL(api) {
    const tbill = await api.call({ 
        abi: 'uint256:totalAssets', 
        target: evmTBILLAddr.ethereum 
    })
    api.add(evmTBILLAddr.ethereum, tbill)
}

async function arbTVL(api) {
    const tbill = await api.call({ 
        abi: 'uint256:totalAssets', 
        target: evmTBILLAddr.arbitrum
    })
    api.add(evmTBILLAddr.arbitrum, tbill)
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
  ripple: { tvl: xrpTVL },
}
