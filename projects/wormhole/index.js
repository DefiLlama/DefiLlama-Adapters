const {getBlock} = require('../helper/getBlock')
const sdk = require('@defillama/sdk')
const terra = require('../helper/terra')
const NATIVE_ADDRESS = "NATIVE";


const data = {
    avax: {
        contractAddress: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
        tokens: [
            {name: "WAVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 6},
            {name: "USDC.e", address: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", decimals: 6},
        ]
    },

    bsc: {
        contractAddress: "0xB6F6D86a8f9879A9c87f643768d9efc38c1Da6E7",
        tokens: [
            {name: "WBNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18},
            {name: "BUSD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 6},
            {name: "BSC-USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 6},
            {name: "USDC", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 6},
        ]
    },

    ethereum: {
        contractAddress: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
        tokens: [
            {name: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18},
            {name: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6},
            {name: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6},
            {name: "BUSD", address: "0x4Fabb145d64652a948d72533023f6E7A623C7C53", decimals: 18},
            {name: "HUSD", address: "0xdF574c24545E5FfEcb9a659c229253D4111d87e1", decimals: 18},
            {name: "SUSHI", address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", decimals: 18},
            {name: "ORION", address: "0x727f064A78DC734D33eEc18d5370aef32Ffd46e4", decimals: 18},
            {name: "SRM", address: "0x476c5E26a75bd202a9683ffD34359C0CC15be0fF", decimals: 18},
            {name: "FRAX", address: "0x853d955aCEf822Db058eb8505911ED77F175b99e", decimals: 18},
            {name: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18},
            {name: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18},
            {name: "wstETH", address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", decimals: 18},
            {name: "LDO", address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals: 18},
            {name: "UNI", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18},
            {name: "HBTC", address: "0x0316EB71485b0Ab14103307bf65a021042c6d380", decimals: 18},
            {name: "FXS", address: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", decimals: 18},
        ]
    },

    fantom: {
        contractAddress: "0x7C9Fc5741288cDFdD83CeB07f3ea7e22618D79D2",
        tokens:[
            {name: "USDC", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6},
        ]
    },

    polygon: {
        contractAddress: "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE",
        tokens:[
            {name: "WMATIC", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18},
            {name: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6},
            {name: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6},
        ]
    },


    terra: {
        contractAddress: "terra10nmmwe8r3g99a9newtqa7a75xfgs2e8z87r2sf",
        tokens: [
            {name: "terrausd", address: "uusd", decimals: 6},
            {name: "terra-luna", address: "uluna", decimals: 6},
        ]
    },


    }

const toNumber = (decimals, n) => Number(n)/Math.pow(10, decimals)

function getTVLFunction(chain)
{
    return async function tvl(timestamp, ethBlock, chainBlocks) {
        const balances = {}
        const chainData = data[chain];
        const block = await getBlock(timestamp, chain, chainBlocks);
        for (const token of chainData.tokens) {
            const balance = token.address === NATIVE_ADDRESS ? await sdk.api.eth.getBalance({
                block, chain, target: chainData.contractAddress
            }) : await sdk.api.erc20.balanceOf({
                block, chain, target: token.address, owner: chainData.contractAddress
            });
            sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance.output));
        }
        return balances
    }
}


async function terraTvl() {
    const balances = {}
    for (const token of data.terra.tokens) {
        const balance = token.address.length > 5
          ? await terra.getBalance(token.address, data.terra.contractAddress)
          : await terra.getDenomBalance(token.address, data.terra.contractAddress);
        sdk.util.sumSingleBalance(balances, token.name, toNumber(token.decimals, balance));
    }
    return balances
}



module.exports={
    methodology: "All tokens in Wormhole contracts.",
    avax: {
        tvl: getTVLFunction('avax'),
    },
    bsc: {
        tvl: getTVLFunction('bsc'),
    },
    ethereum: {
        tvl: getTVLFunction('ethereum'),
    },
    fantom: {
        tvl: getTVLFunction('fantom'),
    },
    polygon: {
        tvl: getTVLFunction('polygon'),
    },
    terra: {
        tvl: terraTvl
        }
}

