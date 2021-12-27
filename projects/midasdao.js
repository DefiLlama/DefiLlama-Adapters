const { sumTokensAndLPsSharedOwners } = require("./helper/unwrapLPs");
const sdk = require('@defillama/sdk');

const TimeStaking = "0x5B92738B2De8331Bee366378f27d146DcBaD85c5";
const CROWN = "0xed46443C18E38064523180Fc364C6180b35803d3";

const JoePair = "0x3f0DE4Ec592e4376aA6925C3B3dc33D5ffBCDcc3";
const TREASURY = "0x820885fCA68fB49d29D40AbF920362FC3e9865C6";
const MIM = "0x130966628846BFd36ff31a822705796e8cb8C18D";
const WAVAX = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"

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
};

module.exports = {
    avalanche: {
        tvl,
        staking
    },
    methodology: "Counts tokens on the treasury for tvl and staked CROWN for staking",
};
