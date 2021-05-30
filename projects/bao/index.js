const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const baoToken = '0x374CB8C27130E2c9E04F44303f3c8351B9De61C1'
const masterChef = '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D'
const xdaiBaoToken = '0x82dFe19164729949fD66Da1a37BC70dD6c4746ce'
const xdaiBaoCxToken = '0xe0d0b1DBbCF3dd5CAc67edaf9243863Fd70745DA'
const xdaiMasterChef = '0xf712a82DD8e2Ac923299193e9d6dAEda2d5a32fd'
const xsushiToken = '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272'
const addresses = require('./lp.json')

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
            return await xdaiTvl(timestamp, block)
        }
    }
}

async function ethTvl(timestamp, block) {
    let balances = {};
    const baoLocked = sdk.api.erc20.balanceOf({
        target: baoToken,
        owner: masterChef,
        block
    })

    const xsushiLocked = sdk.api.erc20.balanceOf({
        target: xsushiToken,
        owner: masterChef,
        block
    })

    const lps = addresses.lp.mainnet
    await Promise.all(
        lps.map(async (address) =>{
        const uniLocked = sdk.api.erc20.balanceOf({
            target: address,
            owner: masterChef,
            block
        })
        await unwrapUniswapLPs(balances, [{
            token: address,
            balance: (await uniLocked).output
        }], block)
    }))

    sdk.util.sumSingleBalance(balances, baoToken, (await baoLocked).output)
    sdk.util.sumSingleBalance(balances, xsushiToken, (await xsushiLocked).output)

    return balances
}

async function xdaiTvl(timestamp, block) {
    let balances = {};
    const baoLocked = sdk.api.erc20.balanceOf({
        target: xdaiBaoToken,
        owner: xdaiMasterChef,
        block,
        chain: 'xdai'
    })

    const cxBaoLocked = sdk.api.erc20.balanceOf({
        target: xdaiBaoCxToken,
        owner: xdaiMasterChef,
        block,
        chain: 'xdai'

    })

    const lps = addresses.lp.xdai
    await Promise.all(
        lps.map(async (address) =>{
            const uniLocked = sdk.api.erc20.balanceOf({
                target: address,
                owner: xdaiMasterChef,
                block,
                chain: 'xdai'
            })
            await unwrapUniswapLPs(balances, [{
                token: address,
                balance: (await uniLocked).output
            }], block,'xdai')
        }))

    sdk.util.sumSingleBalance(balances, xdaiBaoToken, (await baoLocked).output)
    sdk.util.sumSingleBalance(balances, xdaiBaoCxToken, (await cxBaoLocked).output)

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
    tvl: sdk.util.sumChainTvls(['ethereum'].map(chainTvl))
}
