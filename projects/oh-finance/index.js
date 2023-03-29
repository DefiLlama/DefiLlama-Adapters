const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

function getBankTvl(bankAddress, chain){
    return async (time, ethBlock, {[chain]: block})=>{
        const invested = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.virtualBalance})
        const underlying = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.underlying})
        return {
            [chain+":"+underlying.output]: invested.output
        }
    }
}

module.exports={
    ethereum:{
        tvl: getBankTvl("0xa528639aae2e765351dcd1e0c2dd299d6279db52", "ethereum"), // usdc
    },
    avax:{
        tvl: sdk.util.sumChainTvls([
            getBankTvl("0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB", "avax"), // usdc.e
            getBankTvl("0xd96AbEcf6AA022735CFa9CB512d63645b0834720", "avax"), // usdt.e
            getBankTvl("0xF74303DD14E511CCD90219594e8069d36Da01DCD", "avax"), // dai.e
            getBankTvl("0xe001DeCc1763F8BadBbc1b10c2D6db0900f9B928", "avax"), // usdc
            getBankTvl("0xB3ce618F43b53Cdc12077FB937f9fF465BcE1f60", "avax"), // usdt
        ])
    },
    moonriver: {
        tvl: sdk.util.sumChainTvls([
            getBankTvl("0x4C211F45876d8EC7bAb54CAc0e32AAD15095358A","moonriver"), // usdc
            getBankTvl("0xdeA7Ff1D84B7E54587b434C1A585718857CF61d1","moonriver"), // usdt
        ])
    },
    metis: {
        tvl: sdk.util.sumChainTvls([
            getBankTvl("0x4C211F45876d8EC7bAb54CAc0e32AAD15095358A", "metis"), // m.usdc
            getBankTvl("0xc53bC2517Fceff56308b492AFad4A53d96d16ed8", "metis"), // m.usdt
        ])
    }
}