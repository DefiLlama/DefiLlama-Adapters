const sdk = require("@defillama/sdk");
const {sumTokens} = require("../helper/unwrapLPs");
const {BigNumber} = require("bignumber.js");

const tcro = "0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95";
const tokensAndOwners = [
    ["0xe44Fd7fCb2b1581822D0c862B68222998a0c299a", "0x543F4Db9BD26C9Eb6aD4DD1C33522c966C625774"], // WETH
    ["0x062E66477Faf219F25D27dCED647BF57C3107d52", "0x67fD498E94d95972a4A2a44AccE00a000AF7Fe00"], // WBTC
    ["0xc21223249CA28397B4B6541dfFaEcC539BfF0c59", "0xB3bbf1bE947b245Aef26e3B6a9D777d7703F4c8e"], // USDC
    ["0x66e428c3f67a68878562e79A0234c1F83c208770", "0xA683fdfD9286eeDfeA81CF6dA14703DA683c44E5"], // USDT
    ["0xF2001B145b43032AAF5Ee2884e456CCd805F677D", "0xE1c4c56f772686909c28C319079D41adFD6ec89b"] // DAI
]

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    const croBalance = (await sdk.api.eth.getBalance({
        target: tcro,
        block: chainBlocks.cronos,
        chain: "cronos"
    })).output;
    sdk.util.sumSingleBalance(balances, ["crypto-com-chain"], BigNumber(croBalance).div(10 ** 18).toFixed(0));
    await sumTokens(balances, tokensAndOwners, chainBlocks.cronos, "cronos", addr=> {
        if (addr.toLowerCase() === "0xf2001b145b43032aaf5ee2884e456ccd805f677d") {
            return "0x6b175474e89094c44da98b954eedeac495271d0f"
        }
        return `cronos:${addr}`
    });
    return balances;
}

module.exports = {
    cronos: {
        tvl
    }
}