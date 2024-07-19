const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(api){
    const supply = await api.call({ abi: "function totalSupply() view returns (uint256)", target:"0x9F823D534954Fc119E31257b3dDBa0Db9E2Ff4ed" })
    return {
        ["canto:" + ADDRESSES.null]: supply
    }
}

module.exports={
    canto:{
        tvl
    }
}