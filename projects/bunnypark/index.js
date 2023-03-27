const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");

const bp = "0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1";
const masterchef = "0x6148104d39924f071DF05eeb2f6AEB53F7b2EFE7";
const stakingPools = [
    "0x8a8389D174081E585983DAB7189ea1Cf18F11896",
    "0xE051C61baBa59Fd9d184a26F15BE4361027c9916"
]
const poolInfo = 'function poolInfo(uint256) view returns (address lpToken, uint256 lpSupply, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBPPerShare)'
async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`, poolInfo);
    return balances;
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {};
    let stakingBalance = (await sdk.api.abi.multiCall({
        calls: stakingPools.map(p => ({
            target: bp,
            params: p
        })),
        abi: "erc20:balanceOf",
        block : chainBlocks.bsc,
        chain: "bsc"
    })).output;
    stakingBalance.forEach(e => {
        sdk.util.sumSingleBalance(balances, `bsc:${bp}`, e.output);
    })
    return balances;
}

module.exports = {
    bsc: {
        tvl,
        staking
    }
}