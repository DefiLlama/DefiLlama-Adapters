const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs, unwrapCrv} = require('../helper/unwrapLPs')
const axios = require('axios')
const stakingContract = '0xF43480afE9863da4AcBD4419A47D9Cc7d25A647F'
const sSpell = '0x26fa3fffb6efe8c1e69103acb4044c26b9a106a9'
async function tvl(timestamp, block) {
    const balances = {}
    const allTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${stakingContract}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    const lpPositions = []
    await Promise.all(
        allTokens.map(async (token)=>{
            if(token.contract_ticker_symbol === 'MIM-3LP3CRV-f') {
                const cTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${token.contract_address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
                cTokens.map(async (uToken)=> {
                    if(uToken.contract_ticker_symbol === '3Crv') {
                        await unwrapCrv(balances, uToken.contract_address, uToken.balance, block)
                    } else if(uToken.contract_ticker_symbol === 'MIM') {
                        const singleTokenLocked = sdk.api.erc20.balanceOf({
                            target: uToken.contract_address,
                            owner: token.contract_address,
                            block
                        })
                        sdk.util.sumSingleBalance(balances, uToken.contract_address, (await singleTokenLocked).output)
                    }
                })
            } else if(token.contract_ticker_symbol === 'SLP') {
                const uniLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: stakingContract,
                    block
                })
                lpPositions.push({
                    token: token.contract_address,
                    balance: (await uniLocked).output
                })

            } else if(token.supports_erc) {
                const singleTokenLocked = sdk.api.erc20.balanceOf({
                    target: token.contract_address,
                    owner: stakingContract,
                    block
                })
                sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
            }
        })
    )

    const spellTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${sSpell}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    spellTokens.map(async (stoken) => {
        if(stoken.supports_erc) {
            const singleTokenLocked = sdk.api.erc20.balanceOf({
                target: stoken.contract_address,
                owner: sSpell,
                block
            })
            sdk.util.sumSingleBalance(balances, stoken.contract_address, (await singleTokenLocked).output)
        }
    })
    await unwrapUniswapLPs(balances, lpPositions, block)

    return balances
}

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}
