const sdk = require("@defillama/sdk");
const {getBlock} = require("./helper/getBlock");

const m2m = "0x33efB0868A6f12aEce19B451e0fcf62302Ec4A72";
const USDC = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const abi = {
    "inputs": [],
    "name": "totalNetAssets",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}


async function tvl(timestamp, block, chainBlocks) {
    block = await getBlock(timestamp, "polygon", chainBlocks);

    const balances = {}

    const totalNetAssets = (await sdk.api.abi.call({
        target: m2m,
        abi: abi,
        block: block,
        chain:'polygon',
    })).output;

    sdk.util.sumSingleBalance(balances, `polygon:${USDC}`, totalNetAssets);
    return balances;
}

module.exports = {
    polygon: {
        tvl,
    },
};
