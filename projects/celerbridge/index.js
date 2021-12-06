const { getBlock } = require("../helper/getBlock")
const { chainExports } = require("../helper/exports")
const sdk = require('@defillama/sdk')

const bridgeContractV1 = "0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"

const bridgeContractsV2 = {
    ethereum: "0xc578Cbaf5a411dFa9F0D227F97DaDAa4074aD062",
    bsc: "0x5d96d4287D1ff115eE50faC0526cf43eCf79bFc6",
    arbitrum: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
    polygon: "0xa251c4691C1ffd7d9b128874C023427513D8Ac5C",
    avax: "0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573",
    fantom: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
    optimism: "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb"
}

// From https://cbridge-docs.celer.network/#/FAQ?id=what-are-the-token-addresses-on-each-chain
const tokens = [{
    ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    bsc: "0x55d398326f99059ff775485246999027b3197955",
    arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    xdai: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
    okexchain: "0x382bb369d343125bfb2117af9c149795c6c65c50",
    avax: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    optimism: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
    fantom: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    heco: "0xa71edc38d189767582c38a3145b5873052c3e47a",
}, {
    ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    bsc: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    arbitrum: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    xdai: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
    okexchain: "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85",
    avax: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    optimism: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
    fantom: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    heco: "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b",
}, {
    ethereum: "0x6b175474e89094c44da98b954eedeac495271d0f",
    bsc: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    polygon: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    avax: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    optimism: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
}, {
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    bsc: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    polygon: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    avax: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    fantom: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
    optimism: "0x4200000000000000000000000000000000000006"
}, {
    ethereum: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    arbitrum: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    polygon: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    avax: "0x50b7545627a5162F82A992c33b87aDc75187B218",
    fantom: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
}, {
    ethereum: "0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd",
    bsc: "0x67ee3cb086f8a16f34bee3ca72fad36f7db929e2",
    arbitrum: "0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581",
}, {
    ethereum: "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42",
    arbitrum: "0x4e352cf164e64adcbad318c3a1e222e9eba4ce42",
}, {
    ethereum: "0x4f9254c83eb525f9fcf346490bbb3ed28a81c667",
    bsc: "0x1f9f6a696c6fd109cd3956f45dc709d2b3902163",
    arbitrum: "0x3a8B787f78D775AECFEEa15706D4221B40F345AB",
}, {
    ethereum: "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
    bsc: "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
}]

const chainsWithDifferentDecimals = ['bsc', 'okexchain', 'heco']

function chainTvl(chain) {
    return async (time, ethBlock, chainBlocks) => {
        const block = await getBlock(time, chain, chainBlocks, true)
        const balances = {}
        await Promise.all(tokens.map(async token => {
            if (token[chain] === undefined) {
                return
            }
            const balanceV1 = await sdk.api.erc20.balanceOf({
                chain,
                block,
                target: token[chain],
                owner: bridgeContractV1
            })
            const tokenAddress = chainsWithDifferentDecimals.includes(chain) ? chain + ':' + token[chain] : token.ethereum
            sdk.util.sumSingleBalance(balances, tokenAddress, balanceV1.output)
            if (bridgeContractsV2[chain] !== undefined) {
                const balanceV2 = await sdk.api.erc20.balanceOf({
                    chain,
                    block,
                    target: token[chain],
                    owner: bridgeContractsV2[chain]
                })
                sdk.util.sumSingleBalance(balances, tokenAddress, balanceV2.output)
            }
        }))
        return balances
    }
}

const chains = tokens.reduce((allChains, token) => {
    Object.keys(token).forEach(chain => allChains.add(chain))
    return allChains
}, new Set())

module.exports = chainExports(chainTvl, Array.from(chains))
