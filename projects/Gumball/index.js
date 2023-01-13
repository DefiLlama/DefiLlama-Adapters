const sdk = require("@defillama/sdk");
const axios = require("axios")

const abi = {
    gbtPrice: "uint256:currentPrice",
    deployLength: "function totalDeployed() view returns (uint256)",
    baseToken: "function BASE_TOKEN() view returns (address base_token)",
    deployInfo: "function deployInfo(uint256) view returns(address gbt, address gnft, address xgbt, bool allowed)"
}

const GumballFactoryContractArbitrum = '0xf5cfBaF55036264B902D9ae55A114d9A22c42750'

const tvl = async () => {

    const balances = {}

    let ethprice = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
    price = ethprice.data.ethereum.usd

    const length = await sdk.api.abi.call({
        abi: abi.deployLength,
        target: GumballFactoryContractArbitrum,
        params: [],
        chain: 'arbitrum'
    })

    let totalEth = 0

    for (let i = 0; i < length.output; i++) {

        const deployInfo = (await sdk.api.abi.call({
            abi: abi.deployInfo,
            target: GumballFactoryContractArbitrum,
            params: [i],
            chain: 'arbitrum'
        })).output

        if (deployInfo.allowed) {
            
            const baseTokenAddress = (await sdk.api.abi.call({
                abi: abi.baseToken,
                target: deployInfo.gbt,
                params: [],
                chain: 'arbitrum'
            })).output

            const deployInfoContracts = [
                deployInfo.gbt,
                deployInfo.gnft,
                deployInfo.xgbt
            ]

            const baseBal = (await sdk.api.abi.multiCall({
                abi: 'erc20:balanceOf',
                calls: deployInfoContracts.map((adr) => ({
                    target: baseTokenAddress,
                    params: [adr],
                })),
                chain: 'arbitrum'
            })).output

            const gbtBal = (await sdk.api.abi.multiCall({
                abi: 'erc20:balanceOf',
                calls: deployInfoContracts.map((adr) => ({
                    target: deployInfo.gbt,
                    params: [adr],
                })),
                chain: 'arbitrum'
            })).output

            const nftBal = (await sdk.api.abi.multiCall({
                abi: 'erc20:balanceOf',
                calls: deployInfoContracts.map((adr) => ({
                    target: deployInfo.gnft,
                    params: [adr],
                })),
                chain: 'arbitrum'
            })).output

            const currentPrice = (await sdk.api.abi.call({
                abi: abi.gbtPrice,
                target: deployInfo.gbt,
                params: [],
                chain: 'arbitrum'
            })).output

            
            baseBal.forEach(bal => {
                totalEth += Number(bal.output)
            })
            gbtBal.forEach(bal => {
                totalEth += Number((bal.output * currentPrice)/1e18)
            })
            nftBal.forEach(bal => {
                totalEth += Number((bal.output * currentPrice)/1e18)
            })
        }
    }

    balances.ethereum = totalEth/1e18

    return balances
}

module.exports = {
    arbitrum: {
        tvl,
    },
    start: 51954296,
    timetravel: true,
    methodology: 'We pull all balances from our 3 collections contracts and convert them to ETH using current coingecko api and return them as total TVL'
}