const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl");

const leos = "0x2c8368f8F474Ed9aF49b87eAc77061BEb986c2f1";
const leon = "0x27E873bee690C8E161813DE3566E9E18a64b0381";
const factory = "0xEB10f4Fe2A57383215646b4aC0Da70F8EDc69D4F";
const masterchef = "0x72F8fE2489A4d480957d5dF9924166e7a8DDaBBf";

async function tvl(timestamp, block, chainBlocks) {
    return await calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, "bsc", factory, 0, true);
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {};
    let stakingBalance = (await sdk.api.abi.multiCall({
        calls: [
            {
                target: leos,
                params: masterchef
            },
            {
                target: leon,
                params: masterchef
            }
        ],
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    stakingBalance.forEach(p => {
        sdk.util.sumSingleBalance(balances, `bsc:${p.input.target}`, p.output);
    })
    return balances;
}

module.exports = {
    bsc: {
        tvl,
        staking
    },
    tvl
}