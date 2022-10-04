const { addFundsInMasterChef } = require("./helper/masterchef")
const { transformPolygonAddress } = require("./helper/portedTokens");

const token = "0x6397835430a5a5f8530F30C412CB217CE3f0943b";
const masterchef = "0xE139E30D5C375C59140DFB6FD3bdC91B9406201c";
const abi = { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardTime", "type": "uint256" }, { "internalType": "uint256", "name": "accVRTPerShare", "type": "uint256" }], "stateMutability": "view", "type": "function" }

async function tvl(timestamp, blokc, chainBlocks) {
    const balances = {};
    const transform = await transformPolygonAddress();

    await addFundsInMasterChef(
        balances,
        masterchef,
        chainBlocks.polygon,
        'polygon',
        transform,
        abi,
        [],
        true,
        true,
        token
    );

    return balances;
};
module.exports = {
    tvl
};