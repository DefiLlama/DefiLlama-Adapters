const sdk = require('@defillama/sdk')
const abi = require('./abi.json')

function getBankTvl(bankAddress, chain){
    return async (time, ethBlock, chainBlocks)=>{
        const block = chainBlocks[chain];
        const balances = {};
        const invested = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.investedBalance})
        const underlying = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.underlying})
        return {
            [chain+":"+underlying.output]: invested.output
        }
    }
}

module.exports={
    ethereum:{
        tvl: getBankTvl("0xa528639AAe2E765351dcd1e0C2dD299D6279dB52", "ethereum"),
    },
    avalanche:{
        tvl: getBankTvl("0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB", "avax"),
    }
}