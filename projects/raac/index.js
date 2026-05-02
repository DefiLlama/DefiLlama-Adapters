const {abi} = require("./abi");

const tokenBlenderContract = "0x7a7f847fb60b0000e24cce07298dc73df8b8e56a"

async function tvl(api) {
    const tokens = await api.call({
        abi: abi.supportedToken,
        target: tokenBlenderContract
    })
    
    const [balances] = await Promise.all([
        api.multiCall({ abi: abi.getTokenReserveBalance, calls: tokens, target: tokenBlenderContract }),
    ]);

    api.addTokens(tokens, balances);
}

module.exports = {
    methodology: `Counts the tokens locked in the Token Blender contract. Each token balance represents 1-ounce of XAU.`,
    ethereum: {
        tvl,
    }
}; 