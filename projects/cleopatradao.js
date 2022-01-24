const { sumTokensAndLPsSharedOwners } = require("./helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const TimeStaking = "0x6636dF51544bAef6B90f4012504B1dfE1eD5e3Fd";
const CAT = "0x48358BfAA1EC39AafCb0786c3e0342Db676Df93E";

const JoePair = "0x6a71044647c960afb6bbe758cc444dedfa9349f7";
const TREASURY = "0x10243C6D13875443716ff3E88b7Da7664e431E09";
const MIM = "0x130966628846BFd36ff31a822705796e8cb8C18D";
const WAVAX = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"

const staking = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const stakingBalance = await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: CAT,
        params: TimeStaking,
        block: chainBlocks.avax,
        chain: 'avax'
    });

    sdk.util.sumSingleBalance(balances, 'avax:'+CAT, stakingBalance.output);

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
};

module.exports = {
    avalanche: {
        tvl,
        staking
    },
    methodology: "Counts tokens on the treasury for tvl and staked CAT for staking",
};
