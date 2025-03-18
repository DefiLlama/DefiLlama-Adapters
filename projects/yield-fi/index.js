const config = {
    ethereum: "0x1CE7D9942ff78c328A4181b9F3826fEE6D845A97", 
    optimism: '0x895e15020C3f52ddD4D8e9514eB83C39F53B1579',
    bob: '0x895e15020C3f52ddD4D8e9514eB83C39F53B1579',
    arbitrum: '0x895e15020C3f52ddD4D8e9514eB83C39F53B1579',
    base: '0x895e15020C3f52ddD4D8e9514eB83C39F53B1579',
    sonic: '0x26A62298556A4b8124f129eF29B9C7e50c488445',

}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: config[chain] })
            api.add(config[chain], supply)
        }
    }
})