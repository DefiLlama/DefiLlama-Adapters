const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");

const bp = "0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1";
const masterchef = "0x6148104d39924f071DF05eeb2f6AEB53F7b2EFE7";
const stakingPools = [
    "0x8a8389D174081E585983DAB7189ea1Cf18F11896",
    "0xE051C61baBa59Fd9d184a26F15BE4361027c9916"
]
const poolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IBEP20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"lpSupply","type":"uint256"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accBPPerShare","type":"uint256"}],"stateMutability":"view","type":"function"};

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