const sdk = require('@defillama/sdk')

// Ethereum Vaults
const ethCallVault = '0xB5c72818C3bDC5F8C51CA127b13ab724e3BA2379'
const ethPutVault = '0xD63210Ebb952aa5780a97cA05DB78EfE4e7c9632'
const wbtcCallVault = '0x299d62db022981bf6b2FaDD25Ce79D5fA7dF3ddf'
const wbtcPutVault = '0xDCaA803Cd23cfb988DA3794B46aEDBE968ecE17a'
const lunaPutVault = '0x49d8cde90cefdd4f8568f7d895e686fdb76b146e'
const algoPutVault = '0xC2DD9C7F526C7465D14bbBb25991DaB35f8Ea2B4'
const algoCallVault = '0xb8b5A6E1F300b023e9CdCa31AA94B0D66badd982'

// Avalanche Vaults
const avaxCallVault = '0x35e26F12a212b3a7eec8Dd215B8705Ed1AF4f39E'
const avaxPutVault = '0xe088455661dac18164cebcf3d9acd93f5c7b4062'

// Fantom Vaults
const ftmCallVault = '0x156D422436F4441dDE6ac0aB41ff58C9258C438B'
const ftmPutVault = '0x47831E1ff871f6D79CFb72956f5Aca65ec244733'

//BSC Vaults
const adaPutVault = '0x21e91a299fe9028738446f4fb5a836af4f81e5be'
const adaCallVault = '0x5043796caed0d187493ce4513fd3a50971fee121'
const bchPutVault = '0x87798b3844a1b8cc8a29472466a76c9875a269de'
const bchCallVault = '0x05e9373842977024b3531c31bf91e163ad42477f'
const wbnbPutVault = '0xb29bc98657bd9ee0d663781dad778be3076c48fe'
const wbnbCallVault = '0xcd69b95d35e640621813ca097eb1798e7b6a4c44'

//Polygon Vaults
const wMaticCallVault = '0x156d422436f4441dde6ac0ab41ff58c9258c438b'
const wMaticPutVault = '0x47831E1ff871f6D79CFb72956f5Aca65ec244733'

//Aurora Vaults
//const nearCallVault = '0x6d31e1126b4abf8502fc80a1f61f1e930862b075'

//Boba Vaults
//const bobaCallVault = '0xf802f5ef19a0033c297a26649f2eb54e416a989c'
//const bobaPutVault = '0xff5fe7909fc4d0d6643f1e8be8cba72610d0b485'



// Ethereum Assets
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const wbtc = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
const ust = '0xa693b19d2931d498c5b318df961919bb4aee87a5'
const tUSDC = '0x9f238fae3d1f1982716f136836fc2c0d1c2928ab'
const tAlgo = '0x0354762a3c01730d07d2f7098365d64dc81b565d'

// Avalanche Assets
const wavax = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
const usdce = '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664'

// Fantom Assets
const wftm = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const fusdc = '0x04068da6c83afcfa0e13ba15a6696662335d5b75'

// Binance Smart Chain Assets
const busd = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const ada = '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47'
const bch = '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf'
const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

// Polygon Assets
const wmatic = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
const pousdc = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'

// Aurora Assets
// const near = '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d'

// Boba Assets
// const boba = '0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7'
// const bobaUSDC = '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc'




async function addVault(balances, vault, token, block, chain) {
    const totalBalance = await sdk.api.erc20.balanceOf({
      target: token,
      owner: vault,
      block: block,
      chain: chain
    })
    if(chain == 'ethereum'){
    sdk.util.sumSingleBalance(balances,token,totalBalance.output)
  }
    else if(chain == 'avax'){
    sdk.util.sumSingleBalance(balances,`avax:${token}`,totalBalance.output)
    }

    else if(chain == 'fantom'){
    sdk.util.sumSingleBalance(balances,`fantom:${token}`,totalBalance.output)
    }

    else if(chain == 'bsc'){
    sdk.util.sumSingleBalance(balances,`bsc:${token}`,totalBalance.output)
    }

    else if(chain == 'polygon'){
    sdk.util.sumSingleBalance(balances,`polygon:${token}`,totalBalance.output)
    }
}

async function ethTvl(timestamp, block) {
    const balances = {}
    await Promise.all([
        addVault(balances, ethCallVault, weth, block, 'ethereum'),
        addVault(balances, ethPutVault, usdc, block, 'ethereum'),
        addVault(balances, wbtcCallVault, wbtc, block, 'ethereum'),
        addVault(balances, wbtcPutVault, usdc, block, 'ethereum'),
        addVault(balances, lunaPutVault, ust, block, 'ethereum'),
        addVault(balances, algoPutVault, tUSDC, block, 'ethereum'),
        addVault(balances, algoCallVault, tAlgo, block, 'ethereum'),
    ])
    return balances
}


async function avaxTvl(timestamp, ethblocks, chainBlocks) {
    const balances = {}
    await Promise.all([
        addVault(balances, avaxCallVault, wavax, chainBlocks["avax"], 'avax'),
        addVault(balances, avaxPutVault, usdce, chainBlocks["avax"], 'avax'),
    ])
    return balances
}

async function ftmTvl(timestamp, ethblocks, chainBlocks) {
    const balances = {}
    await Promise.all([
        addVault(balances, ftmCallVault, wftm, chainBlocks["fantom"], 'fantom'),
        addVault(balances, ftmPutVault, fusdc, chainBlocks["fantom"], 'fantom'),
    ])
    return balances
}

async function bscTvl(timestamp, ethblocks, chainBlocks) {
    const balances = {}
    await Promise.all([
        addVault(balances, adaPutVault, busd, chainBlocks["bsc"], 'bsc'),
        addVault(balances, adaCallVault, ada, chainBlocks["bsc"], 'bsc'),
        addVault(balances, bchPutVault, busd, chainBlocks["bsc"], 'bsc'),
        addVault(balances, bchCallVault, bch, chainBlocks["bsc"], 'bsc'),
        addVault(balances, wbnbPutVault, busd, chainBlocks["bsc"], 'bsc'),
        addVault(balances, wbnbCallVault, wbnb, chainBlocks["bsc"], 'bsc'),
    ])
    return balances
}

async function polygonTvl(timestamp, ethblocks, chainBlocks) {
    const balances = {}
    await Promise.all([
        addVault(balances, wMaticCallVault, wmatic, chainBlocks["polygon"], 'polygon'),
        addVault(balances, wMaticPutVault, pousdc, chainBlocks["polygon"], 'polygon'),
    ])
    return balances
}


module.exports = {
    ethereum: {
        tvl: ethTvl
    },
    avalanche: {
        tvl: avaxTvl
    },
    fantom: {
        tvl: ftmTvl
    },
    bsc: {
        tvl: bscTvl
    },
    polygon: {
        tvl: polygonTvl
    },
   tvl: sdk.util.sumChainTvls([ethTvl, avaxTvl, ftmTvl, bscTvl, polygonTvl]),
}
