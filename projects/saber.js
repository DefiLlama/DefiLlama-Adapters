const {getTokenBalance} = require('./helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount, paiAmount, usdcAmount_2, btcAmount, renBtcAmount, pbtcAmount, renBtcAmount_2,
    hbtcAmount, renBtcAmount_3, ustAmount, daiAmount, busdAmount, fraxAmount, usdcAmount_3, wlunaAmount, renLunaAmount] = await Promise.all([
        //usdc-usdt pool/Users/michaelhuang/Projects/DefiLlama-Adapters/projects 
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "5C1k9yV7y4CjMnKv8eGYDgWND8P89Pdfj79Trk2qmfGo"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "5C1k9yV7y4CjMnKv8eGYDgWND8P89Pdfj79Trk2qmfGo"),
        //pai-usdc pool
        getTokenBalance("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", "7W9KMACQT6UmjRPEUQKXyVf4NjZ9Ux4PHs1e1P5PxDtA"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "7W9KMACQT6UmjRPEUQKXyVf4NjZ9Ux4PHs1e1P5PxDtA"),
        //BTC-renBTC & pBTC-renBTC & hBTC-renBTC pool
        getTokenBalance("SBTCB6pWqeDo6zGi9WVRMLCsKsN6JiR1RMUqvLtgSRv", "Fekck54VF2MdesR74trJteZbiKj1TD5AVQisXr8E7fjG"),
        getTokenBalance("CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", "Fekck54VF2MdesR74trJteZbiKj1TD5AVQisXr8E7fjG"),
        getTokenBalance("DYDWu4hE4MN3aH897xQ3sRTs5EAjJDmQsKLNhbpUiKun", "2wszCpUdVDFrJcP79wpV3FdBmU38UC1YKuoSUBA5mhWu"),
        getTokenBalance("CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", "2wszCpUdVDFrJcP79wpV3FdBmU38UC1YKuoSUBA5mhWu"),
        getTokenBalance("8pBc4v9GAwCBNWPB5XKA93APexMGAS4qMr37vNke9Ref", "G4cRef4AxEjaSV32xqQzDmHqi3iz8112LQwx8oPbZhYb"),
        getTokenBalance("CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", "G4cRef4AxEjaSV32xqQzDmHqi3iz8112LQwx8oPbZhYb"),
        //UST,wDAI,BUSD,FRAX and the USDC that corresponds
        getTokenBalance("CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm", "ASpJBf8HtyrNxaMqFNpjYCqi8SsJC5h56hd3HQUNk6M7"),
        getTokenBalance("FYpdBuyAHSbdaAyD1sKkxyLWbAP8uUW9h6uvdhK74ij1", "2hAy2ubWi3PWrgxSoamzonLy1bUL3BfoqW7u7791Qpj9"),
        getTokenBalance("AJ1W9A9N9dEMdVyoDiam2rV44gnBm2csrPDP7xqcapgX", "FDndRkBVpFoNBHY6Jhx7PgNpysvZjt3P2MZ95vmkSfWa"),
        getTokenBalance("8L8pDf3jutdpdr4m3np68CL9ZroLActrqwxi6s9Ah5xU", "GUotxHmyJVsJYWYoL8Vo6SKQweNRUZMRQcoqDe5PswHt"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "AnKLLfpMcceM6YXtJ9nGxYekVXqfWy8WNsMZXoQTCVQk"),
        //wLUNA-renLUNA pool
        getTokenBalance("2Xf2yAXJfg82sWwdLUo2x9mZXy6JCdszdMZkcF1Hf4KV", "4HP9xSxLcEK64zALBCP36GdfDLrMXorVk4X6DyLrBjbp"),
        getTokenBalance("KUANeD8EQvwpT1W7QZDtDqctLEh2FfSTy5pThE9CogT", "4HP9xSxLcEK64zALBCP36GdfDLrMXorVk4X6DyLrBjbp"),


    ])
    return {
        'usd-coin': usdcAmount + usdcAmount_2 + usdcAmount_3,
        'tether': usdtAmount,
        'renbtc': renBtcAmount + renBtcAmount_2 + rentBtcAmount_3,
        'terrausd': ustAmount,
        'dai': daiAmount,
        'busd': busdAmount,
        'terra-luna': wlunaAmount + renLunaAmount,
        'frax': fraxAmount,
        'usdp': paiAmount,
        'ptokens-btc': pbtcAmount,
        'bitcoin': btcAmount,
        'huobi-btc': hbtcAmount
    }
}

module.exports = {
    tvl
}
