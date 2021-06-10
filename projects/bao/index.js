const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
const axios = require('axios')
const {transformXdaiAddress} = require('../helper/portedTokens')
const {getBlock} = require('../helper/getBlock')

const masterChef = '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D'
const xdaiMasterChef = '0xf712a82DD8e2Ac923299193e9d6dAEda2d5a32fd'
const addresses = require('./lp.json')
const abi = require('./abi.json')

function chainTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        let block;
        if(chain === "ethereum"){
            block=ethBlock;
        } else {
            block = await getBlock(timestamp, chain, chainBlocks)
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
    const lpPositions = []
    await Promise.all(
        allTokens.map(async (token) =>{
        if(token.contract_ticker_symbol === 'SLP' || token.contract_ticker_symbol === 'UNI-V2')
        {
            const uniLocked = sdk.api.erc20.balanceOf({
                target: token.contract_address,
                owner: masterChef,
                block
            })
            lpPositions.push({
                token: token.contract_address,
                balance: (await uniLocked).output
            })
        } else if(token.supports_erc) {
            const singleTokenLocked = sdk.api.erc20.balanceOf({
                target: token.contract_address,
                owner: masterChef,
                block
            })
            sdk.util.sumSingleBalance(balances, token.contract_address, (await singleTokenLocked).output)
        }
    }))
    await unwrapUniswapLPs(balances, lpPositions, block)

    return balances
}

async function xdaiTvl(timestamp, block, ethBlock) {
    let balances = {};
    const transformAddress = await transformXdaiAddress()

    const sushiLps = addresses.lp.xdaiSLP
    const xdai = addresses.lp.xdai
    const slpPositions = []
    const xdaiLpPositions = []
    await Promise.all(
        sushiLps.map(async (address) =>{
            const uniLocked = sdk.api.erc20.balanceOf({
                target: address,
                owner: xdaiMasterChef,
                block,
                chain: 'xdai'
            })
            const ethAddress = await transformAddress(address)
            slpPositions.push({
                token: ethAddress,
                balance: (await uniLocked).output
            })
        }),
        xdai.map(async (address) =>{
            const uniLocked = sdk.api.erc20.balanceOf({
                target: address,
                owner: xdaiMasterChef,
                block,
                chain: 'xdai'
            })
            xdaiLpPositions.push({
                token: address,
                balance: (await uniLocked).output
            })
        })
    )
    await unwrapUniswapLPs(balances, slpPositions, ethBlock )
    await unwrapUniswapLPs(balances, xdaiLpPositions, block,'xdai', transformAddress )

    return balances
}

module.exports = {
    ethereum: {
        tvl: chainTvl('ethereum')
    },
    xdai: {
        tvl: chainTvl('xdai')
    },
    tvl: sdk.util.sumChainTvls(['xdai','ethereum'].map(chainTvl))
}
