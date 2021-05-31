const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const axios = require('axios')

const masterChef = '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D'
const xdaiMasterChef = '0xf712a82DD8e2Ac923299193e9d6dAEda2d5a32fd'
const bridgeAdd = '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d'
const addresses = require('./lp.json')
const abi = require('./abi.json')

function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        let block;
        if(chain === "ethereum"){
            block=ethBlock;
        }
        block = chainBlocks[chain]
        if(block===undefined){
            block = (await sdk.api.util.lookupBlock(timestamp, {chain})).block
        }

        if(chain === "ethereum") {
            return await ethTvl(timestamp, block)
        }
        else if(chain === "xdai") {
            return await xdaiTvl(timestamp, block, ethBlock)
        }
    }
}

async function ethTvl(timestamp, block) {
    let balances = {};
    const allTokens = (await axios.get(`https://api.covalenthq.com/v1/1/address/${masterChef}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`)).data.data.items
    await Promise.all(
        allTokens.map(async (token) =>{
        if(token.contract_ticker_symbol === 'SLP' || token.contract_ticker_symbol === 'UNI-V2')
        {
            const uniLocked = sdk.api.erc20.balanceOf({
                target: token.contract_address,
                owner: masterChef,
                block
            })
            await unwrapUniswapLPs(balances, [{
                token: token.contract_address,
                balance: (await uniLocked).output
            }], block)
        } else if(token.supports_erc) {
            const singleTokenLocked = sdk.api.erc20.balanceOf({
                target: token.contract_address,
                owner: masterChef,
                block
            })
            sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
        }
    }))

    return balances
}

async function transformAddress(address) {

    const result = await sdk.api.abi.call({
        target: bridgeAdd,
        abi: abi.abiXdaiBridge,
        params: [address],
        chain: 'xdai'
    });
    return result.output
}

async function xdaiTvl(timestamp, block, ethBlock) {
    let balances = {};

    const sushiLps = addresses.lp.xdaiSLP
    const xdai = addresses.lp.xdai
    await Promise.all(
        sushiLps.map(async (address) =>{
            const uniLocked = sdk.api.erc20.balanceOf({
                target: address,
                owner: xdaiMasterChef,
                block,
                chain: 'xdai'
            })
            const ethAddress = await transformAddress(address)
            await unwrapUniswapLPs(balances, [{
                token: ethAddress,
                balance: (await uniLocked).output
            }], ethBlock )
        }),
        xdai.map(async (address) =>{
            const uniLocked = sdk.api.erc20.balanceOf({
                target: address,
                owner: xdaiMasterChef,
                block,
                chain: 'xdai'
            })
            await unwrapUniswapLPs(balances, [{
                token: address,
                balance: (await uniLocked).output
            }], block,'xdai', transformAddress )
        })
    )

    return balances
}

module.exports = {
    name: 'Bao',
    token: 'BAO',
    category: 'yield',
    ethereum: {
        tvl: chainTvl('ethereum')
    },
    xdai: {
        tvl: chainTvl('xdai')
    },
    tvl: sdk.util.sumChainTvls(['xdai','ethereum'].map(chainTvl))
}
