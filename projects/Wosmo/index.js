const { sumTokens, } = require('../helper/chain/cosmos');

async function tvl() {
    // Get the result from sumTokens
    const result = await sumTokens({ owners: ['osmo1j0dxu3wkyza5775jgwu5u5y29reqmqtyz9uz7mau2pwl336wjz9s9jxpf0'], chain: 'osmosis' });

    // Extract osmosis and WOSMO values
    const osmosisValue = result['osmosis:factory:osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3:WOSMO'];
    const wosmoValue = result['osmosis:uosmo'];

    // Multiply each value by 2
    const multipliedOsmosisValue = osmosisValue * 2;
    const multipliedWosmoValue = wosmoValue * 2;

    // Bring the multiplied values back in sumTokens format
    const finalResult = {
        'osmosis:factory:osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3:WOSMO': multipliedOsmosisValue.toString(),
        'osmosis:uosmo': multipliedWosmoValue.toString(),
    };

    return finalResult;
}

module.exports = {
    osmosis: {
        tvl: tvl
    },
};
