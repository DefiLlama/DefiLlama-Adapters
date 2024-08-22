const genAddress = '0x99999999999997fceB5549c58aB66dF52385ca4d';
const sGenAddress = '0x8888888888888e9b808caA0a8BB7e2268fd17351';

async function stakedGen(api) {
    const sGenSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: sGenAddress
    });

    api.add(genAddress, sGenSupply)
}

module.exports = {
    ethereum: {
        tvl: () => ({}),
        staking: stakedGen
    }
};
