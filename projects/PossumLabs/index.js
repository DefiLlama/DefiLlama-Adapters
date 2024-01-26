const HLP_Portal = '0x1f3Af095CDa17d63cad238358837321e95FC5915';
const HLP_PRICE_ADAPTER = '0x0266868d1c144a7534513F38B816c1aadE4030A2';
// const TIME_RIFT = '0x6df4EF024089ab148078fdD88f5BF0Ee63248D3E';

async function tvl(_, _1, _2, { api }) {

    const stakeBalanceHLP = await api.call({
        abi: 'uint256:totalPrincipalStaked',
        target: HLP_Portal,
    });

    const PrincipalPrice = await api.call({
        abi: 'uint256:getPrice',
        target: HLP_PRICE_ADAPTER,
    });

    // const TimeRiftStakedFLASH = await api.call({
    //     abi: 'uint256:stakedTokensTotal',
    //     target: TIME_RIFT,
    // });


    api.add(HLP_Portal, stakeBalanceHLP * PrincipalPrice)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Get the number of HLP tokens staked and HLP price to calculate USD TVL.',
    start: 155591158,
    arbitrum: {
        tvl,
    }
};

module.exports = {
    doublecounted: true,
    start: 155591158,
    hallmarks: [
        [155591158, "HLP Portal Launch"],
        [166728446, "Time Rift Launch"]
    ]
};