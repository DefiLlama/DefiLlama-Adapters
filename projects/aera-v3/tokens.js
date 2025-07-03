const { ethers } = require('ethers');

// Ideally, these would be derived from on-chain data, but the transfer logs are too slow to process.
const tokens = [
    { chain: 'ethereum', address: '0x0404fd1a77756eb029f06b5cdea88b2b2ddc2fee', symbol: 'elixirUSDC' },
    { chain: 'ethereum', address: '0x132e6c9c33a62d7727cd359b1f51e5b566e485eb', symbol: 'resolvUSDC' },
    { chain: 'ethereum', address: '0x58d97b57bb95320f9a05dc918aef65434969c2b2', symbol: 'MORPHO' },
    { chain: 'ethereum', address: '0x7204b7dbf9412567835633b6f00c3edc3a8d6330', symbol: 'csUSDC' },
    { chain: 'ethereum', address: '0x8eb67a509616cd6a7c1b3c8c21d48ff57df3d458', symbol: 'gtUSDCcore' },
    { chain: 'ethereum', address: '0xa0804346780b4c2e3be118ac957d1db82f9d7484', symbol: 'bbqUSDT' },
    { chain: 'ethereum', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' },
    { chain: 'ethereum', address: '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f', symbol: 'eUSD' },
    { chain: 'ethereum', address: '0xa8875aaebc4f830524e35d57f9772ffacbdd6c45', symbol: 'midasUSDC' },
    { chain: 'ethereum', address: '0xbeefff209270748ddd194831b3fa287a5386f5bc', symbol: 'bbqUSDC' },
    { chain: 'ethereum', address: '0xc080f56504e0278828a403269db945f6c6d6e014', symbol: 'gteUSDc' },
    { chain: 'ethereum', address: '0xc582f04d8a82795aa2ff9c8bb4c1c889fe7b754e', symbol: 'gtusdcf' },
    { chain: 'ethereum', address: '0xc83e27f270cce0a3a3a29521173a83f402c1768b', symbol: 'USDQ' },
    { chain: 'ethereum', address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', symbol: 'cbBTC' },
    { chain: 'ethereum', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
    { chain: 'base', address: '0x23479229e52ab6aad312d0b03df9f33b46753b5e', symbol: 'exmUSDC' },
    { chain: 'base', address: '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812', symbol: 'wUSDM' },
    { chain: 'base', address: '0x616a4e1db48e22028f6bbf20444cd3b8e3273738', symbol: 'smUSDC' },
    { chain: 'base', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC' },
    { chain: 'base', address: '0xbeef010f9cb27031ad51e3333f9af9c6b1228183', symbol: 'steakUSDC' },
    { chain: 'base', address: '0xbeef03f0bf3cb2e348393008a826538aadd7d183', symbol: 'steakUSDM' },
    { chain: 'base', address: '0xbeefa74640a5f7c28966cba82466eed5609444e0', symbol: 'bbqUSDC' },
    { chain: 'base', address: '0xc0c5689e6f4d256e861f65465b691aeecc0deb12', symbol: 'gtUSDCc' },
    { chain: 'base', address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', symbol: 'cbBTC' },
    { chain: 'base', address: '0xee8f4ec5672f09119b96ab6fb59c27e1b7e44b61', symbol: 'gtUSDCp' },
]

async function getTokens(api) {
    const chain = api.chain;
    const tokensForChain = tokens.filter(token => token.chain === chain).map(token => ethers.getAddress(token.address));
    return tokensForChain;
}

module.exports = {
    getTokens,
}