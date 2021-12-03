const sdk = require('@defillama/sdk')
const { default: axios } = require('axios')
const { getBlock } = require('../helper/getBlock')
const abi = require('./abi.json')
const { toUSDTBalances } = require("../helper/balances");

const chainIds = {
    ethereum: 1,
    bsc: 56,
    heco: 128
}

// https://golff.finance/api/v2/product/list?chain_id=56&biz_type=2
function chainTvl(chain, filterFunction) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const api = `https://golff.finance/api/v2/product/list?chain_id=${chainIds[chain]}&biz_type=1`
        const pools = (await axios.get(api)).data.data.filter(filterFunction)
        return toUSDTBalances(pools.reduce((t,p)=>t+p.tvl, 0)/1e18)
    }
}

function chainExports(chain){
    return {
        tvl: chainTvl(chain, p=>!p.name.includes("GOF")),
        staking: chainTvl(chain, p=>p.token_name==="GOF" || p.token_name=== "G-GOF"),
        pool2: chainTvl(chain, p=>p.name.includes("GOF-")),
    }
}

module.exports={
    misrepresentedTokens: false,
    ethereum:chainExports("ethereum"),
    bsc:chainExports("bsc"),
    heco:chainExports("heco"),
}
