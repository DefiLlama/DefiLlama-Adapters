const { addFundsInMasterChef } = require("./helper/masterchef")
const { transformPolygonAddress } = require("./helper/portedTokens");

const token = "0x6397835430a5a5f8530F30C412CB217CE3f0943b";
const masterchef = "0xE139E30D5C375C59140DFB6FD3bdC91B9406201c";
const abi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accVRTPerShare)'

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
}
module.exports = {
    polygon: {tvl}
};