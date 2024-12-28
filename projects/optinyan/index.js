const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const weth = ADDRESSES.ethereum.WETH
async function tvl(time, _ethBlock, {optimism: block}){
    const eth = await sdk.api.eth.getBalance({
        target: '0x6F7Fe8b33358a3F4313421186b98CA78127C6DB6',
        block,
        chain: 'optimism'
    })
    return {
        [weth]: eth.output
    }
}

module.exports = {
    optimism: {tvl}
}
