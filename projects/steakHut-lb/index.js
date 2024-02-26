const sdk = require('@defillama/sdk');
const abi = require('./abi.json')
const abi_hjoe = require('./abi_hJOE.json')
const abi_factory = require('./abi_enigmaFactory.json')
const abi_enigma = require('./abi_enigma.json');
const { balanceOf } = require('@defillama/sdk/build/erc20');

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
        '0x536d7e7423e8fb799549caf574cfa12aae95ffcd', //BTC.b/AVAX_B
        '0x9bdda0c0cd56d98a8165fddabdeb7f9aee2d993e', //GMX/AVAX
        // '0xFFE588AC8d94c758AFaC5c50A4b4bF4BC1887fFD', //CAI/AVAX
    ],
    arbitrum: [ 
        '0x862f459c3c1f8949b3f5b624d39134d61697946e', //GMX/ETH
        '0xec9fba07ca8b3429950b2e01aec4e2b08dbd7897', //ETH/USDC
        '0xfb6421346d7e96f573414be757b502c0bb15cb62', //USDT/USDC_B
        '0xf8d6eb0e55a83e8a27af3c5f48cab883da3c716d', //USDT/USDC_C
        '0x2DBb0b159dc932D86FA4a5378924E7e074F4a5f2', //ARB/WETH
        '0x223d04520d5376D6B465e4270e64746048eed716', //ARB/USDC
        '0x04F9a9D6B7728787520B0ac69b88D81ddB5C10ED', //UNIDX/WETH
        '0x57de2A8df99480fCc5323678bdA61E8Fd612bD54', //JOE/WETH
        '0xe5F984fA55315fb1ee3399D6be3d9aAF74F1eFE4', //MAGIC/WETH
        '0xEb7081e31E6d46058Fe65A68a309B788Aa8B363f', //BFR/WETH
        '0xA0676beC4EC591c33A69877A2d39f08b54d34b84', //BETS/WETH
    ],
}

const enigmaFactory_AVAX = `0xD751E0940CfadC35f84e60075d0f940a2545FB8d`;

async function getTotalEnigmaCount(api){
    return api.call({
        target: enigmaFactory_AVAX,
        abi: abi_factory.enigmaPositionNumber
    })
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

function buildQueries(count){
    const calls = []
    for (let i = 0; i < count; i++) {
        calls.push({
            target: enigmaFactory_AVAX,
            params: i
        })
    }
    return calls
}

function buildQueriesOnEnigma(addresses){
    const calls = []
    for (let i = 0; i < addresses.length; i++) {
        calls.push({
            target: addresses[i]
        })
    }
    return calls
}

async function getXSteakTVL(_, block, _1, { api }) {
    const balances = {};

    const XSTEAK_ADDRESS = '0x902Aa4cC3b463c84541C9C1DeDF50620C99950B9';
    const STEAK_ADDRESS_AVAX = '0xb279f8dd152b99ec1d84a489d32c35bc0c7f5674';
    
    const totalSupply = await api.call({
        target: XSTEAK_ADDRESS,
        abi: abi_hjoe.totalSupply
    })

    
    
    sdk.util.sumSingleBalance(balances, STEAK_ADDRESS_AVAX, totalSupply, api.chain)
    return(balances);

}

async function tvlHJoe(_, block, _1, { api }) {
    const balances = {};
    const HJOE_ADDRESS = '0xe7250b05bd8dee615ecc681eda1196add5156f2b';
    const JOE_ADDRESS = '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd';

    const totalSupply = await api.call({
        target: HJOE_ADDRESS,
        abi: abi_hjoe.totalSupply
    })

    
    
    sdk.util.sumSingleBalance(balances,JOE_ADDRESS, totalSupply, api.chain)
    return(balances);
}


async function getV2LiquidityTVL(_, block, _1, { api }) {
    const balances = {};

    //get the total shares from all vaults
    const enigmaCount = await getTotalEnigmaCount(api);
    

    const enigmaCalls = buildQueries(enigmaCount);
    

    //get all the enigma contract addresses 
    const enigmasGenerated = await api.multiCall({
        calls: enigmaCalls,
        abi: abi_factory.enigmaAtIndex
    })
    

    const enigmaQueries = buildQueriesOnEnigma(enigmasGenerated);
    
    
    ///get the want tokens 
    const wantToken0sForEnigmas = await api.multiCall({
        calls: enigmaQueries,
        abi: abi_enigma.token0
    })

    const wantToken1sForEnigmas = await api.multiCall({
        calls: enigmaQueries,
        abi: abi_enigma.token1
    })



    const underlyingAmounts = await api.multiCall({
        calls: enigmaQueries,
        abi: abi_enigma.getTotalAmounts
    })

    //now we can sum the total balances 
    for(let i = 0; i < underlyingAmounts.length; i++){
        sdk.util.sumSingleBalance(balances, wantToken0sForEnigmas[i], underlyingAmounts[i][0], api.chain)
        sdk.util.sumSingleBalance(balances, wantToken1sForEnigmas[i], underlyingAmounts[i][1], api.chain)
    }

    
    return(balances);
}
function mergeAndSum(obj1, obj2) {
    const result = { ...obj1 }; // Start with a copy of the first object
  
    Object.keys(obj2).forEach(key => {
      if (result.hasOwnProperty(key)) {
        // Convert both values to numbers and sum them if the key exists
        result[key] = (parseFloat(result[key]) + parseFloat(obj2[key])).toString();
      } else {
        // Otherwise, just add the key-value pair from obj2 to the result
        result[key] = obj2[key];
      }
    });
  
    return result;
  }


async function tvlAVAX(_, block, _1, { api }) {
    
    const xSTEAKTVL = await getXSteakTVL(_, block, _1, { api });
    const hJOETVL = await tvlHJoe(_, block, _1, { api });
    const v2LiquidityTVL = await getV2LiquidityTVL(_, block, _1, { api });

    const x = mergeAndSum(xSTEAKTVL, v2LiquidityTVL );
    const y = mergeAndSum(x, hJOETVL);

    return(y);
}



module.exports = {
    doublecounted: true,
    methodology: 'Counts the value of underlying SteakHut Pools.',
    avax: {
        tvl: tvlAVAX,
    },
    arbitrum: {
        tvl
    }
}; 
