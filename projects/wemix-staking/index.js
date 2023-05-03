const sdk = require("@defillama/sdk");
const BigNumber = require('bignumber.js');

const wwemix = '0x7D72b22a74A216Af4a002a1095C8C707d6eC1C5f'
const stakingContract = '0x6F3f44B0Cf7C751f2a44Faf6bFdd08e499Eb0973'

async function tvl(chainBlocks, chain, transform=a=>a) {
    let balances = {};

    const lpBalance = (await sdk.api.abi.call({
        abi: "erc20:balanceOf",
        params: stakingContract,
        target: wwemix,
        chain
    })
    ).output

    balances = { wwemix: BigNumber(lpBalance).div(1e18) };

    return balances;
}

async function wemixTvl(timestamp, ethBlock, chainBlocks) {
    let balances = await tvl(chainBlocks, 'wemix');

    return balances;
}

module.exports = {
    wemix: {
        tvl: () => ({}),
        staking: wemixTvl,
    },
}