const sdk = require('@defillama/sdk')

async function tvl(time, block){
    return{
        "0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7": (await sdk.api.abi.call({
            target: "0x83507cc8c8b67ed48badd1f59f684d5d02884c81",
            abi: {"inputs":[],"name":"totalUnderlying","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},
            block
        })).output,
        "0xFEEf77d3f69374f66429C91d732A244f074bdf74": (await sdk.api.abi.call({
            target: "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e",
            abi: {"inputs":[],"name":"totalUnderlying","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"view","type":"function"},
            block
        })).output
    }
}

module.exports={
    ethereum:{
        tvl
    }
}
