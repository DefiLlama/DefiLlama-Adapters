const TOKEN_ADDRESS = {
    bsc: "0xe60106a5cAb7e7C64830919d36Ab20CaAf50Ac91",
    base: "0xeA953eA6634d55dAC6697C436B1e81A679Db5882",
    ethereum: "0x77a31A47E8a1dCe18Cb1772ae1C2157Fa080CFde",
}

async function tvl(api) {
    const supply = await api.call({abi: 'erc20:totalSupply', target: TOKEN_ADDRESS[api.chain]});

    api.add(TOKEN_ADDRESS[api.chain], supply)
}

Object.keys(TOKEN_ADDRESS).forEach(chain => {
    module.exports[chain] = { tvl }
})