const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Factory address (0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    candle: {
        tvl:calculateUsdUniTvl("0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95", "candle", "0xcC237fa0A4B80bA47992d102352572Db7b96A6B5", ["0x95A0A7953F9292838C0614D690005D5c716E718E", "0xb750990F953B36F806d0327678eCFB4eEFd16979","0x5c17C48F127D6aE5794b2404F1F8A5CeED419eDf",
                                "0xa018034190943D6c8E10218d9F8E8Af491272411", "0xad43669cbAC863e33449d423261E525de8da0Ff4"], "candle")
    }
}
