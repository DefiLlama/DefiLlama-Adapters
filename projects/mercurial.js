const {getTokenBalance} = require('./helper/solana')



async function fetch() {
    const [usdcAmount, usdtAmount, paiAmount, ustPoolUsdc, ustPoolUsdt, ustPoolUst] = await Promise.all([
        //pai3pool
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR" ),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR" ),
        getTokenBalance("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS", "2dc3UgMuVkASzW4sABDjDB5PjFbPTncyECUnZL73bmQR" ),
        //ust3Pool
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D" ),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D" ),
        getTokenBalance("CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm", "FDonWCo5RJhx8rzSwtToUXiLEL7dAqLmUhnyH76F888D" ),
    ])
    return usdcAmount + usdtAmount + paiAmount + ustPoolUsdc + ustPoolUsdt + ustPoolUst
    
    
}

module.exports = {
    fetch
}