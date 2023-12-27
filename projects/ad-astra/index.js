const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

module.exports={
    ethereum:{
        tvl: sumTokensExport({
            owner: '0x92a26975433a61cf1134802586aa669bab8b69f3',
            tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.BUSD, '0xdc9Ac3C20D1ed0B540dF9b1feDC10039Df13F99c', ],
            logCalls: true
        })
    }
}