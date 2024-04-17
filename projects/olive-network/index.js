const sdk = require('@defillama/sdk');
const abi = require('./abi.json')
const ADDRESSES = require('../helper/coreAssets.json')


function getBankTvl(bankAddress, chain){
    return async (time, ethBlock, {[chain]: block})=>{
        const invested = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.balance})
        const underlying = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.token})
        return {
            [chain+":"+underlying.output]: invested.output
        }
    }
}

function getETHTvl(bankAddress, chain){
    return async (time, ethBlock, {[chain]: block})=>{
        const invested = await sdk.api.abi.call({target: bankAddress, block, chain, abi:abi.balance})
        return {
            [chain+":"+ADDRESSES.null]: invested.output
        }
    }
}

module.exports={
    ethereum:{
        tvl: sdk.util.sumChainTvls([
            // ETH vaults
            getETHTvl("0xd94a9FBae86e662350FFEbB352f70c3CBeb9E96e", "ethereum"), // ETH

            // Token vaults
            getBankTvl("0x700886a402d42113aD94D9756f08A923BB5aC77A", "ethereum"), // eETH
            getBankTvl("0xDa4D36dbdf5154B22580c0f1c998D37BfBB33D85", "ethereum"), // ezETH
            getBankTvl("0xd75c669B3da058cf589bF0076FDaceDa40380C4d", "ethereum"), // pufETH
            getBankTvl("0x9F3E781b25501A6b9051556B8058812D7Ba30549", "ethereum"), // rsETH
            getBankTvl("0x6De2a95331400bb6cf9Cf75c7a8861d33687a95F", "ethereum"), // stETH
            getBankTvl("0x7531b2AbA509E09566C08D61CaD6324b78444eCd", "ethereum"), // wBTC
            getBankTvl("0xdb0d6F58a63118E20C91c0De84f4d8eA1a407C36", "ethereum"), // weETH
            getBankTvl("0x2865568AD1CA0FE12dB53c8f866039Fa4500962F", "ethereum"), // wETH
            getBankTvl("0xDEA5f3171C5052384a0a974E3C85b0d419c48204", "ethereum"), // wstETH

            // PT vaults
            getBankTvl("0xeF0DF466417bC45007773C363866B3693fc0b1E7", "ethereum"), // PT-weETH Jun 2024
            getBankTvl("0x31ec45f7dA20998775d594539F54e443e268f9F5", "ethereum"), // PT-ezETH Apr 2024
            getBankTvl("0xF3b442217f18EB46417eFfd3A6cE09C3B311f4f5", "ethereum"), // PT-pufETH Jun 2024
            getBankTvl("0x6D8c42855690c493E9c6404803478CD321A63376", "ethereum"), // PT-rsETH Jun 2024
            getBankTvl("0x47764d88F8f54daD6Db75EC3667a11d58811ABc6", "ethereum"), // PT-wstETH Dec 2024
        ])
    },
    arbitrum:{
        tvl: sdk.util.sumChainTvls([
            getBankTvl("0xA2e9c6177f81a1337b656d3b066FD20c7Cf8cAb4", "arbitrum"), // ezETH
            getBankTvl("0xd94a9FBae86e662350FFEbB352f70c3CBeb9E96e", "arbitrum"), // rsETH
            getBankTvl("0x2865568AD1CA0FE12dB53c8f866039Fa4500962F", "arbitrum"), // weETH
            getBankTvl("0x6De2a95331400bb6cf9Cf75c7a8861d33687a95F", "arbitrum"), // wstETH

            // PT vaults
            getBankTvl("0x700886a402d42113aD94D9756f08A923BB5aC77A", "arbitrum"), // PT-weETH Jun 2024
            getBankTvl("0xDa4D36dbdf5154B22580c0f1c998D37BfBB33D85", "arbitrum"), // PT-ezETH Jun 2024
            getBankTvl("0xd75c669B3da058cf589bF0076FDaceDa40380C4d", "arbitrum"), // PT-rsETH Jun 2024
            getBankTvl("0x9F3E781b25501A6b9051556B8058812D7Ba30549", "arbitrum"), // PT-wstETH Dec 2024
        ])
    }
}