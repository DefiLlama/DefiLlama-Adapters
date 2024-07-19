const ADDRESSES = require('../helper/coreAssets.json')

const frax = ADDRESSES.ethereum.FRAX
const fxs = "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0"

async function tvl(api){
    const balances = {}
    // owner 0x6a7efa964cf6d9ab3bc3c47ebddb853a8853c502
    const lpOwned = await api.call({ abi: "function totalBalanceOf(address) view returns (uint256)", target:"0x7287488f8df7dddc5f373142d4827aaf92aac845", params: ["0x921852ba77cbceaa29e986e45ef2207f6e664df2"] })
    const supply = await api.call({ abi: "function totalSupply() view returns (uint256)", target:"0xdb7cbbb1d5d5124f86e92001c9dfdc068c05801d" })
    const fraxInPool = await api.call({ abi: "function balanceOf(address) view returns (uint256)", params:["0xf861483fa7e511fbc37487d91b6faa803af5d37c"], target: frax })
    balances[frax] = lpOwned/supply * fraxInPool
    balances[fxs] = await api.call({ abi: "function balanceOf(address) view returns (uint256)", params:["0x6a7efa964cf6d9ab3bc3c47ebddb853a8853c502"], target: fxs })

    return balances
}

module.exports={
    ethereum:{
        tvl
    }
}