const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xEe4fa96b695De795071d40EEad0e8Fd42cdB9951) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl:calculateUsdUniTvl("0xEe4fa96b695De795071d40EEad0e8Fd42cdB9951", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", ["0x245a551ee0F55005e510B239c917fA34b41B3461"], "crypto-com-chain")
    }
}