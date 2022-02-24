const { masterChefExports, standardPoolInfoAbi, addFundsInMasterChef } = require('../helper/masterchef')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const shareValue= {"inputs":[],"name":"getShareValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
const xSCREAM = "0xe3D17C7e840ec140a7A51ACA351a482231760824"
const xCREDIT = "0xd9e28749e80D867d5d14217416BFf0e668C10645"
const shareTarot = {"inputs":[{"internalType":"uint256","name":"_share","type":"uint256"}],"name":"shareValuedAsUnderlying","outputs":[{"internalType":"uint256","name":"underlyingAmount_","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}
const xTAROT = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4"

const fBEET = "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1"

async function tvl(time, ethBlock, chainBlocks) {
    const balances = {}
    const chain = 'fantom'
    const block = chainBlocks[chain]
    const calldata = {
        chain, block
    }
    const transform = addr => `fantom:${addr}`
    await addFundsInMasterChef(balances, "0xa7821c3e9fc1bf961e280510c471031120716c3d", block, chain, 
        transform, standardPoolInfoAbi, [], true, true, "0xc165d941481e68696f43ee6e99bfb2b23e0e3114")
    
    const screamShare = await sdk.api.abi.call({
        ...calldata,
        target: xSCREAM,
        abi: shareValue
    })
    sdk.util.sumSingleBalance(balances, transform("0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"), 
        BigNumber(screamShare.output).times(balances[transform(xSCREAM)]).div(1e18).toFixed(0))
    delete balances[transform(xSCREAM)]

    const creditShare = await sdk.api.abi.call({
        ...calldata,
        target: xCREDIT,
        abi: shareValue
    })
    sdk.util.sumSingleBalance(balances, transform("0x77128dfdd0ac859b33f44050c6fa272f34872b5e"), 
        BigNumber(creditShare.output).times(balances[transform(xCREDIT)]).div(1e18).toFixed(0))
    delete balances[transform(xCREDIT)]

    const tarotShare = await sdk.api.abi.call({
        ...calldata,
        target: xTAROT,
        abi: shareTarot,
        params: balances[transform(xTAROT)]
    })
    sdk.util.sumSingleBalance(balances, transform("0xc5e2b037d30a390e62180970b3aa4e91868764cd"), 
        tarotShare.output)
    delete balances[transform(xTAROT)]

    sdk.util.sumSingleBalance(balances, transform("0xf24bcf4d1e507740041c9cfd2dddb29585adce1e"), 
        balances[transform(fBEET)])
    delete balances[transform(fBEET)]
    return balances
}

module.exports={
    fantom:{
        tvl
    }
}

//module.exports = masterChefExports("0xa7821c3e9fc1bf961e280510c471031120716c3d", "fantom", "0xc165d941481e68696f43ee6e99bfb2b23e0e3114", false,standardPoolInfoAbi)