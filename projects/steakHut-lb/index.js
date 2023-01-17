const sdk = require('@defillama/sdk');
const abi = require('./abi.json')
const { transformAvaxAddress } = require('../helper/portedTokens');

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
        '0x9cc15d1204d768380cec8d35bc1d8e1945083397' //BTC.b/USDC
    ],
    arbitrum: [
        '0xb41506675a0977a34e8cec7da8c061d6753b5b03', 
    ],
  }

async function getVaultShares(chainBlocks, api){
    const calls = []
    
    for (let i = 0;i < _vaults[api.chain].length;i++)
    calls.push({target: _vaults[api.chain][i],})

    const vaultInfo = await
    sdk.api.abi.multiCall({
        calls,
        abi: abi.totalSupply,
        chain: api.chain,
        block: chainBlocks[api.chain],
    })
    return(vaultInfo)
}

async function getDepositTokens(chainBlocks, api){
    const calls = []
    
    for (let i = 0;i < _vaults[api.chain].length;i++)
    calls.push({target: _vaults[api.chain][i],})

    const vaultInfo = await
    sdk.api.abi.multiCall({
        calls,
        abi: abi.want,
        chain: api.chain,
        block: chainBlocks[api.chain],
    })
    return(vaultInfo.output)
}


async function tvl(_, block, chainBlocks, { api }) {
    const balances = {};

    const transformAddress = await transformAvaxAddress()
    
    //get the total shares from all vaults
    const vaultShares = await getVaultShares(chainBlocks, api);
    const depositTokens = await getDepositTokens(chainBlocks, api);

    //get the total underlying assets from all shares
    const calls = []

    for (let i = 0;i < _vaults[api.chain].length;i++)
        calls.push({target: _vaults[api.chain][i], params: vaultShares.output[i].output})

    const poolInfo = await
    sdk.api.abi.multiCall({
        calls,
        abi: abi.getUnderlyingAssets,
        chain: api.chain,
        block: chainBlocks[api.chain],
    })

    for (let i = 0;i < poolInfo.output.length;i++){
        for (let t = 0;t < poolInfo.output[i].output.length;t++){
            sdk.util.sumSingleBalance(balances, transformAddress(depositTokens[i].output[t]), poolInfo.output[i].output[t])
        }
    }
    
    return balances;
}

module.exports = {
    methodology: 'Counts the value of LB tokens staked into SteakHut Liquidity.',
    avax:{
        tvl,
    },
    arbitrum: {
        tvl
    }

}; 
