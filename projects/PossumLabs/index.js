const HLP_Portal = '0x24b7d3034C711497c81ed5f70BEE2280907Ea1Fa';
const HLP_PRICE_ADAPTER = '0x0266868d1c144a7534513F38B816c1aadE4030A2';
// const TIME_RIFT = '0x6df4EF024089ab148078fdD88f5BF0Ee63248D3E';

async function tvl(_, _1, _2, { api }) {

    const stakeBalanceHLP = await api.call({
        abi: 'uint256:totalPrincipalStaked',
        target: HLP_Portal,
    });

    // const PrincipalPrice = await api.call({
    //     abi: 'uint256:getPrice',
    //     target: HLP_PRICE_ADAPTER,
    // });

    // const TimeRiftStakedFLASH = await api.call({
    //     abi: 'uint256:stakedTokensTotal',
    //     target: TIME_RIFT,
    // });

    api.add(HLP_Portal, stakeBalanceHLP)
}


module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Get the number of HLP tokens staked.',
    start: 1701313010,
    arbitrum: {
        tvl,
    },
    doublecounted: true,
    hallmarks: [
        [1701313010, "HLP Portal Launch"],
        [1704270118, "Time Rift Launch"]
    ]
};