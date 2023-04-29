const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners } = require("./helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const TimeStaking = "0x9619BC1306B94130FBC70CF07e311E69949f07D4";
const CROWN = "0x39912d83acb4a373321387300f4fbe88aa5d6f14";

const JoePair = "0x089a9BF16453b519Fab02e40d143C0dcF9083778";
const TREASURY = "0x6D9Cfb705C7b7A5ca1C4565A47Fa1b26FC1bE3d0";
const MIM = "0x130966628846BFd36ff31a822705796e8cb8C18D";
const WAVAX = ADDRESSES.avax.WAVAX

const staking = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const stakingBalance = await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: CROWN,
        params: TimeStaking,
        block: chainBlocks.avax,
        chain: 'avax'
    });

    sdk.util.sumSingleBalance(balances, 'avax:'+CROWN, stakingBalance.output);

    return balances;
};

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    await sumTokensAndLPsSharedOwners(
        balances,
        [
            [MIM, false],
            [WAVAX, false],
            [JoePair, true],
        ],
        [TREASURY],
        chainBlocks.avax,
        'avax',
        addr=>`avax:${addr}`
    );

    return balances;
}

module.exports = {
    avax:{
        tvl,
        staking
    },
    methodology: "Counts tokens on the treasury for tvl and staked CROWN for staking",
};
