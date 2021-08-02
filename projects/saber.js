const {getTokenBalance} = require('./helper/solana')

async function tvl() {
    const [usdcAmount, usdtAmount, paiAmount, usdcAmount_2,
          btcAmount, renBtcAmount, pbtcAmount, renBtcAmount_2, hbtcAmount, renBtcAmount_3,
          ustAmount, daiAmount, busdAmount, fraxAmount, usdkAmount, usdcAmount_3,
          wlunaAmount, renLunaAmount, husdAmount, usdcAmount_4, fttAmount, wfttAmount, wsrmAmount, srmAmount,
          ibBtcAmount, btcAmount_2, ibBtcAmount_2] = await Promise.all([
        //usdc-usdt
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
        getTokenBalance("CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", "D231Uoh24bXtUtWN51ZbFAFSBmGT3zuuEAHZNuCmtRjN"),
        //UST,wDAI,BUSD,FRAX, USDK and the USDC that corresponds
        getTokenBalance("CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm", "ASpJBf8HtyrNxaMqFNpjYCqi8SsJC5h56hd3HQUNk6M7"),
        getTokenBalance("FYpdBuyAHSbdaAyD1sKkxyLWbAP8uUW9h6uvdhK74ij1", "2hAy2ubWi3PWrgxSoamzonLy1bUL3BfoqW7u7791Qpj9"),
        getTokenBalance("AJ1W9A9N9dEMdVyoDiam2rV44gnBm2csrPDP7xqcapgX", "FDndRkBVpFoNBHY6Jhx7PgNpysvZjt3P2MZ95vmkSfWa"),
        getTokenBalance("8L8pDf3jutdpdr4m3np68CL9ZroLActrqwxi6s9Ah5xU", "GUotxHmyJVsJYWYoL8Vo6SKQweNRUZMRQcoqDe5PswHt"),
        getTokenBalance("2kycGCD8tJbrjJJqWN2Qz5ysN9iB4Bth3Uic4mSB7uak", "5iGwpfXgTX2zqQuagzwLtMWEg1e8Rju7tkjYUbbHXvgj"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "AnKLLfpMcceM6YXtJ9nGxYekVXqfWy8WNsMZXoQTCVQk"),
        //wLUNA-renLUNA pool
        getTokenBalance("2Xf2yAXJfg82sWwdLUo2x9mZXy6JCdszdMZkcF1Hf4KV", "4HP9xSxLcEK64zALBCP36GdfDLrMXorVk4X6DyLrBjbp"),
        getTokenBalance("KUANeD8EQvwpT1W7QZDtDqctLEh2FfSTy5pThE9CogT", "4HP9xSxLcEK64zALBCP36GdfDLrMXorVk4X6DyLrBjbp"),
        //HUSD-USDC pool
        getTokenBalance("BybpSTBoZHsmKnfxYG47GDhVPKrnEKX31CScShbrzUhX", "ELnY6YAb1oSPGuARAV8rBJq44AXgT69GJhvWNfuabq9B"),
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "G4gRGymKo7MGzGZup12JS39YVCvy8YMM6KY9AmcKi5iw"),
        //FTT-wFTT pool
        getTokenBalance("AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3", "2ffwMLE4dxSv59eYXhfhfuS81kz6gzf6DZjdBxRHZz9A"),
        getTokenBalance("GbBWwtYTMPis4VHb8MrBbdibPhn28TSrLB53KvUmb7Gi", "DGPFLHMzcfLeANN5m6gVoMFpo38KuU85tAGFHpLfn3gM"),
        //SRM-wSRM pool
        getTokenBalance("2jXy799YnEcRXneFo2GEAB6SDRsAa767HpWmktRr1DaP", "BdvYL4rH3CqJ6eX6d7iC4snNZZvJQXR67T8dHNTUeSmz"),
        getTokenBalance("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", "BdvYL4rH3CqJ6eX6d7iC4snNZZvJQXR67T8dHNTUeSmz"),
        //ibBTC-BTC pool & ibBTC from ibBTC-renBTC pool (the renBTC has same address as renBTC from hBTC-renBTC pool)
        getTokenBalance("66CgfJQoZkpkrEgC1z4vFJcSFc4V6T5HqbjSSNuqcNJz", "4PHvSwhw8Gz26UZfgSjDLx8JLpJnh2kpNCtssgGUKQFe"),
        getTokenBalance("9999j2A8sXUtHtDoQdk528oVzhaKBsXyRGZ67FKGoi7H", "4PHvSwhw8Gz26UZfgSjDLx8JLpJnh2kpNCtssgGUKQFe"),
        getTokenBalance("66CgfJQoZkpkrEgC1z4vFJcSFc4V6T5HqbjSSNuqcNJz", "3rjYaVP4fkv4BVQsA7aaC7DZUdogkna7ACGaAhiuNYfi"),
        


    ])
    return {
        'bitcoin': btcAmount + ibBtcAmount + btcAmount_2 + ibBtcAmount_2,
        'usd-coin': usdcAmount + usdcAmount_2 + usdcAmount_3 + usdcAmount_4,
        'renbtc': renBtcAmount + renBtcAmount_2 + renBtcAmount_3,
        'terra-luna': wlunaAmount + renLunaAmount,
        'tether': usdtAmount,
        'terrausd': ustAmount,
        'dai': daiAmount,
        'busd': busdAmount,
        'frax': fraxAmount,
        'usdp': paiAmount,
        'ptokens-btc': pbtcAmount,
        'huobi-btc': hbtcAmount,
        'husd': husdAmount,
        'usdk': usdkAmount,
        'ftx-token': fttAmount + wfttAmount,
        'serum': wsrmAmount + srmAmount
    }
}

module.exports = {
    tvl,
    methodology: `To obtain the TVL of Saber we make on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the token is found. The pool addresses are hardcoded. This returns the amount of the tokens held in each contract. We then use Coingecko to get the price of each token in USD to export the sum of all tokens.`,
}
