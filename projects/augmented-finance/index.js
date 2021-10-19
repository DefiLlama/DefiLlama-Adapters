const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const PROTOCOL_DATA_PROVIDER = '0xd25C4a0b0c088DC8d501e4292cF28da6829023c0';

async function tvl(timestamp, block) {
    const { output: reservesData } = await sdk.api.abi.call({
        target: PROTOCOL_DATA_PROVIDER,
        abi: abi.find(abi => abi.name === 'getReservesData'),
        params: [ZERO_ADDRESS],
        block
    });

    const [reserves] = reservesData;
    const totalSupply = await sdk.api.abi.multiCall({
        abi: 'erc20:totalSupply',
        calls: reserves.map(reserve => ({ target: reserve.depositTokenAddress })),
        block
    });

    let balances = {};
    totalSupply.output.forEach((call, index) => {
        const tokenAddress = reserves[index].underlyingAsset;
        const tokenBalance = call.output;
        sdk.util.sumSingleBalance(balances, tokenAddress, tokenBalance);
    })

    return balances;
}

module.exports = {
    name: 'Augmented Finance',
    website: 'https://augmented.finance',
    token: 'AGF',
    category: 'lending',
    start: 13339609, // Oct-02-2021 11:33:05 AM +UTC
    ethereum:{
        tvl,
    },
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
    tvl
}
