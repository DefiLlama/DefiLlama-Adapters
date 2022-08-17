const sdk = require('@defillama/sdk')
const utils = require('../helper/utils')
const { getChainTransform } = require('../helper/portedTokens')

// const { data } = await utils.fetchURL(url)
const ABI = {
    wantLockedTotal: {
        "inputs": [],
        "name": "wantLockedTotal",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    farms: {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "farms",
        "outputs": [
          {
            "internalType": "address payable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
}
const vaults = {
    bsc: '0x89c527764f03BCb7dC469707B23b79C1D7Beb780',
    celo: '0x979cD0826C2bf62703Ef62221a4feA1f23da3777',
    ethereum: '0x1bf68a9d1eaee7826b3593c20a0ca93293cb489a',
    heco: '0x38C92A7C2B358e2F2b91723e5c4Fc7aa8b4d279F',
    klaytn: '0x9abc3f6c11dbd83234d6e6b2c373dfc1893f648d',
    polygon: '0x506DC4c6408813948470a06ef6e4a1DaF228dbd5'
    // ripple: '',
}

const farms = {
    bsc: [
        '0x0000000000000000000000000000000000000000',// BNB
        '0x55d398326f99059ff775485246999027b3197955',// USDT-B
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',// BUSD
        '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',// CAKE
    ],
    ethereum: [
        '0x0000000000000000000000000000000000000000',// ETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',// USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',// DAI
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',// USDC
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',// WBTC
    ]
}

function chainTvls(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        let balances = {}
        const block = chainBlocks[chain]
        // const block = await getBlock(timestamp, chain, chainBlocks, false)
        const vault = vaults[chain]
        let targetChain = chain
        if(chain === 'ethereum') targetChain = 'eth'
        if(chain === 'polygon') targetChain = 'matic'

        const transform = await getChainTransform(chain)
        
        const tokenListURL = 'https://bridge.orbitchain.io/open/v1/api/monitor/rawTokenList'
        const { data } = await utils.fetchURL(tokenListURL)

        if(data.success) {
            let tokenList = data.origins.filter(x => x.chain === targetChain && x.address !== "0x0000000000000000000000000000000000000000")
            const nameList = tokenList.map(x => [x.symbol, x.price_usd])
            tokenList = tokenList.map(x => x.address)
            try {
                let { output: balance } = await sdk.api.eth.getBalance({ 
                    target: vault, 
                    block, 
                    chain 
                })

                let nativeToken = chain !== 'klaytn' ? chain+':'+"0x0000000000000000000000000000000000000000" : 'klay-token'
                balance = chain !== 'klaytn' ? balance : balance / 1e18

                sdk.util.sumSingleBalance(balances, nativeToken, balance);

                const underlyingBalances = await sdk.api.abi.multiCall({
                    calls: tokenList.map(c => ({
                        target: c,
                        params: vault
                    })),
                    abi: "erc20:balanceOf",
                    block,
                    chain,
                });

                sdk.util.sumMultiBalanceOf(balances, underlyingBalances, false, transform);

                if(farms[chain]) {
                    for(let token of farms[chain]) {
                        const { output: farm } = await sdk.api.abi.call({
                            target: vault,
                            abi: ABI.farms,
                            chain, block,
                            params: [token],
                        })

                        const { output: farmBalance } = await sdk.api.abi.call({
                            target: farm,
                            abi: ABI.wantLockedTotal,
                            chain, block,
                        })
                        sdk.util.sumSingleBalance(balances, chain+':'+ token, farmBalance);
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        return balances
    }
}

async function rippleTvls() {
    const rippleVault = 'rLcxBUrZESqHnruY4fX7GQthRjDCDSAWia'
    return {
        ripple: await utils.getRippleBalance(rippleVault)
    }
}

module.exports = {
    methodology: 'Tokens locked in Orbit Bridge contract are counted as TVL',
    misrepresentedTokens: true,
    timetravel: false,
    bsc: {
        tvl: chainTvls('bsc')
    },
    celo: {
        tvl: chainTvls('celo')
    },
    heco: {
        tvl: chainTvls('heco')
    },
    ethereum: {
        tvl: chainTvls('ethereum')
    },
    klaytn: {
        tvl: chainTvls('klaytn')
    },
    polygon: {
        tvl: chainTvls('polygon')
    },
    ripple: {
        tvl: rippleTvls
    }
}