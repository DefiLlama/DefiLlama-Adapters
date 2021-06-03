const sdk = require('@defillama/sdk');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const { default: axios } = require('axios')

const masterChef = '0x8CFD1B9B7478E7B0422916B72d1DB6A9D513D734'
const PoSMappedTokenList = 'https://api.bridge.matic.network/api/tokens/pos/erc20'
const PlasmaMappedTokenList = 'https://api.bridge.matic.network/api/tokens/plasma/erc20'

async function tvl(timestamp, block, chainBlocks) {
    let balances = {}
    const allTokens = (await axios.get(`https://api.covalenthq.com/v1/137/address/${masterChef}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    const posTokens = await axios.get(PoSMappedTokenList)
    const plasmaTokens = await axios.get(PlasmaMappedTokenList)
    const tokens = posTokens.data.tokens.concat(plasmaTokens.data.tokens).reduce((tokenMap, token)=>{
        tokenMap[token.childToken.toLowerCase()] = token.rootToken.toLowerCase();
        return tokenMap;
    }, {})
    const chain = 'polygon'
    const getAddress = (addr)=> {
        if(addr === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'){
            return '0x0000000000000000000000000000000000000000'
        }
        return tokens[addr] ?? `polygon:${addr}`
    }
    await Promise.all(
        allTokens.map(async (token) =>{
            if(token.contract_ticker_symbol === 'UNI-V2' ||
                token.contract_ticker_symbol === 'SLP' ||
                token.contract_ticker_symbol === 'DFYNLP')
            {
                const uniLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: masterChef,
                    block: chainBlocks['polygon'],
                    chain
                })
                await unwrapUniswapLPs(balances, [{
                    token: token.contract_address,
                    balance: (await uniLocked).output
                }], chainBlocks['polygon'], chain, getAddress)

            } else if(token.supports_erc) {
                const singleTokenLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: masterChef,
                    block: chainBlocks['polygon'],
                    chain
                })
                sdk.util.sumSingleBalance(balances, getAddress(token.contract_address), (await singleTokenLocked).output)
            }
        }))
    return balances
}

module.exports = {
    name: 'Polycat Finance',
    token: 'FISH',
    category: 'staking',
    polygon: {
        tvl
    },
    tvl
}
