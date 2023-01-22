const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

const _vaults = {
    avax: [
        '0x37e0f0513ae3d3c4403e7b11c8a15b06c7cb1412', //USDC.e/USDC_C
        '0xb41506675a0977a34e8cec7da8c061d6753b5b03', //USDT/USDC_B
        '0xc4bbd4ba96eaf7ccb3d0f2e0819b1f6e5c900b16', //USDT/USDC_C
        '0x07462883abb2350e5243b94aeb27f4d37e3238e8', //USDT/USDT.e_B
        '0x9f44e67ba256c18411bb041375e572e3dd11fa72', //USDT/USDT.e_C
        '0x3b27aee8df3a3791eb57b59a770a530a93dc0221', //USDC.e/USDC_B
        '0x89547441489262feb5cee346fdacb9037c2574db', //JOE/AVAX_B
        '0x668530302c6ecc4ebe693ec877b79300ac72527c', //AVAX/USDC_B
        '0x9c9cea14731821f4d08889717043977e6dee766a', //WETH.e/AVAX_B
        '0x9cc15d1204d768380cec8d35bc1d8e1945083397', //BTC.b/USDC_B
        '0x536d7e7423e8fb799549caf574cfa12aae95ffcd' //BTC.b/AVAX_B
    ],
    arbitrum: [ 
    ],
}

async function getVaultShares(api) {
    return api.multiCall({
        calls: _vaults[api.chain],
        abi: abi.totalSupply,
    })
}

async function getDepositTokens(api) {
    return api.multiCall({
        calls: _vaults[api.chain],
        abi: abi.want,
    })
}


async function tvl(_, block, _1, { api }) {
    const balances = {};

    //get the total shares from all vaults
    const vaultShares = await getVaultShares(api);
    const depositTokens = await getDepositTokens(api);

    //get the total underlying assets from all shares
    const calls = []

    for (let i = 0; i < _vaults[api.chain].length; i++)
        calls.push({ target: _vaults[api.chain][i], params: vaultShares[i] })

    const poolInfo = await api.multiCall({
        calls,
        abi: abi.getUnderlyingAssets,
    })

    for (let i = 0; i < poolInfo.length; i++) {
        for (let t = 0; t < poolInfo[i].length; t++) {
            sdk.util.sumSingleBalance(balances, depositTokens[i][t], poolInfo[i][t], api.chain)
        }
    }

    return balances;
}

module.exports = {
    methodology: 'Counts the value of LB tokens staked into SteakHut Liquidity.',
    avax: {
        tvl,
    },
    arbitrum: {
        tvl
    }

}; 
