const sdk = require('@defillama/sdk')

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const contract = "0xBabeE6d5F6EDD301B5Fae591a0D61AB702b359d0"
const currentTvlAbi = {"inputs":[],"name":"currentTVL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
async function tvl(time, block){
    return {
        [USDC]:(await sdk.api.abi.call({
            target: contract,
            block,
            abi: currentTvlAbi
        })).output
    }
}

module.exports={
    methodology: `Count the USDC that has been deposited on ${contract}`,
    ethereum:{
        tvl,
        masterchef: tvl
    },
    tvl
}