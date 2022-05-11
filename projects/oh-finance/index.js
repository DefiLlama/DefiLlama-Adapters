const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { avalanche } = require('../multichainMiner');
const abi = require('./abi.json')

function getBankTvl(bankAddress, chain){
    return async (time, ethBlock, chainBlocks)=>{
        const block = (await getBlock(time, chain, chainBlocks));
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
        tvl: getBankTvl("0xa528639aae2e765351dcd1e0c2dd299d6279db52", "ethereum"),
    },
    avalanche: {
        tvl: sdk.util.sumChainTvls([
            getBankTvl("0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB", "avax"), // usdc
            getBankTvl("0xd96AbEcf6AA022735CFa9CB512d63645b0834720", "avax"), // usdt
            getBankTvl("0xF74303DD14E511CCD90219594e8069d36Da01DCD", "avax"), // dai
        ])
    },
    moonriver: {
        tvl: sdk.util.sumChainTvls([
            getBankTvl("0x4C211F45876d8EC7bAb54CAc0e32AAD15095358A","moonriver"), // usdc
            getBankTvl("0xdeA7Ff1D84B7E54587b434C1A585718857CF61d1","moonriver"), // usdt
        ])
    }
}