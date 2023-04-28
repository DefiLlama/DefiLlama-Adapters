const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const chain = "kava";
const owner = "0xc732471083342a842a728221878327c8DeE8aEDB";
const tokens = [
    {symbol: "WKAVA", address: "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b" },
    {symbol: "ETH", address: "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D" },
    {symbol: "USDC", address: "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f" },
    {symbol: "USDT", address: "0xB44a9B6905aF7c801311e8F4E76932ee959c663C" },
]

async function getTVL() {
    let balance = 0;
    tokens.forEach( async(token) => {
        const target = token.address;
        const tokenDecimal = await sdk.api.erc20.decimals(token.address, chain);
        const tokenBal = await sdk.api.erc20.balanceOf({ target, owner, chain });
        balance += BigNumber(tokenBal.output).dividedBy(BigNumber(10).pow(tokenDecimal.output)).toNumber();
    });
    return balance;
}

module.exports = {
    kava: {
      tvl: getTVL()
    }
}