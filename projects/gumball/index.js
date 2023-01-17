const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

const abi = {
    gbtPrice: "uint256:currentPrice",
    deployLength: "function totalDeployed() view returns (uint256)",
    baseToken: "function BASE_TOKEN() view returns (address base_token)",
    deployInfo: "function deployInfo(uint256) view returns(address gbt, address gnft, address xgbt, bool allowed)"
}

const GumballFactoryContractArbitrum = '0xf5cfBaF55036264B902D9ae55A114d9A22c42750'

async function tvl(_, _b, _cb, { api, }) {
    let items = await api.fetchList({ itemAbi: abi.deployInfo, lengthAbi: abi.deployLength, target: GumballFactoryContractArbitrum })
    items = items.filter(i => i.allowed)
    // let prices = await api.multiCall({ abi: abi.gbtPrice, calls: items.map(i => i.gbt) })
    let baseTokens = await api.multiCall({ abi: abi.baseToken, calls: items.map(i => i.gbt) })
    const toa = []
    items.forEach((val, i) => {
        const owners = [val.gbt, val.gnft, val.xgbt]
        owners.forEach(o => {
            toa.push([baseTokens[i], o])
            // toa.push([val.gnft, o]) // TODO: Get prices and use it to value this NFT or maybe use baseTokens * 2 as tvl
        })
    })

    const bal = await sumTokens2({ api, tokensAndOwners: toa })
    const balances = {}
    Object.entries(bal).forEach(([token, value]) => sdk.util.sumSingleBalance(balances, token, value * 2)) // value of base token * 2 to account for NFT tvl locked in pools
    return balances
}

module.exports = {
    arbitrum: {
        tvl,
    },
    start: 51954296,
    timetravel: true,
    methodology: 'Value of base token * 2 (nfts in pools are valued equal to base tokens in pool)'
}