const sdk = require('@defillama/sdk')

const router = "0x3881e447F439891dC106Da7bca0007B319eeB74D";
const chain = 'gochain';

async function getFactory(){
    const factory = await sdk.api.abi.call({
        target: router,
        chain,
        abi: {"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    })
    const wrappedToken = await sdk.api.abi.call({
        target: router,
        chain,
        abi: {"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    })
    console.log("factory", factory.output)
    console.log("wrapped token", wrappedToken.output)
}
getFactory()