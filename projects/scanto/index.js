async function tvl(_, _b, _cb, { api }){
    const supply = await api.call({ abi: "function totalSupply() view returns (uint256)", target:"0x9F823D534954Fc119E31257b3dDBa0Db9E2Ff4ed" })
    return {
        "canto:0x0000000000000000000000000000000000000000": supply
    }
}

module.exports={
    canto:{
        tvl
    }
}