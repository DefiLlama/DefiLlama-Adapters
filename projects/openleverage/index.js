const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
    ethereum: '0x03bf707deb2808f711bb0086fc17c5cafa6e8aaf',
    bsc: '0x6A75aC4b8d8E76d15502E69Be4cb6325422833B4',
    kcc: '0xEF6890d740E1244fEa42E3D1B9Ff515C24c004Ce',
    arbitrum: '0x2925671dc7f2def9e4ad3fa878afd997f0b4db45'
}
module.exports = {};

Object.keys(config).forEach(chain => {
    const openLevAddr = config[chain]
    module.exports[chain] = {
        tvl: async (_, _b, _cb, { api, }) => {
            const data = await api.fetchList({  lengthAbi: 'uint256:numPairs', itemAbi: "function markets(uint16) view returns (address pool0, address pool1, address token0, address token1, uint16 marginLimit, uint16 feesRate, uint16 priceDiffientRatio, address priceUpdater, uint256 pool0Insurance, uint256 pool1Insurance)", target:openLevAddr })
            const tokensAndOwners = data.map(i => [
                [i.token0, openLevAddr],
                [i.token0, i.pool0],
                [i.token1, openLevAddr],
                [i.token1, i.pool1],
            ]).flat()
            return sumTokens2({ api, tokensAndOwners })
        }
    }
})