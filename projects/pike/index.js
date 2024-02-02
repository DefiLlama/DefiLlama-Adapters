const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(timestamp, block, _, { api }) {
    console.log(block);
    if (api.chainId === 1) {
        const ethBalance = (await api.provider.getBalance('0xFC7599cfFea9De127a9f9C748CCb451a34d2F063', block));
        const usdcBalance = await api.call({ abi: 'erc20:balanceOf', params: ['0x54FD7bA87DDBDb4b8a28AeE34aB8ffC4004687De'], target: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', block: block })
        api.addTokens([ADDRESSES.ethereum.WETH, ADDRESSES.ethereum.USDC], [ethBalance, usdcBalance])
    }
    if (api.chainId === 8453) {
        const ethBalance = (await api.provider.getBalance('0xFC7599cfFea9De127a9f9C748CCb451a34d2F063', block));
        const usdcBalance = await api.call({ abi: 'erc20:balanceOf', params: ['0xA9452cA8281556DAfA4C0d3DA3dcaAa184941032'], target: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', block: block })
        api.addTokens([ADDRESSES.base.WETH, ADDRESSES.base.USDC], [ethBalance, usdcBalance])
    }
    if (api.chainId === 10) {
        const opBalance = await api.call({ abi: 'erc20:balanceOf', params: ['0x1E65e48532f6Cf9747774777F3f1F6dC6cf0D81b'], target: '0x4200000000000000000000000000000000000042', block: block })
        const usdcBalance = await api.call({ abi: 'erc20:balanceOf', params: ['0x7856493B59cdb1685757A6DcCe12425F6a6666a0'], target: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', block: block })
        api.addTokens([ADDRESSES.optimism.OP, ADDRESSES.optimism.USDC], [opBalance, usdcBalance])
    }
    if (api.chainId === 42161) {
        const arbBalance = await api.call({ abi: 'erc20:balanceOf', params: ['0x1E65e48532f6Cf9747774777F3f1F6dC6cf0D81b'], target: '0x912ce59144191c1204e64559fe8253a0e49e6548', block: block })
        const usdcBalance = await api.call({ abi: 'erc20:balanceOf', params: ['0x7856493B59cdb1685757A6DcCe12425F6a6666a0'], target: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', block: block })
        api.addTokens([ADDRESSES.arbitrum.ARB, ADDRESSES.arbitrum.USDC], [arbBalance, usdcBalance])
    }
}

module.exports = {
    doublecounted: false,
    methodology:
        "Counts the amount of tokens using PikeTokens",
    ethereum: { tvl, },
    base: { tvl, },
    optimism: { tvl, },
    arbitrum: { tvl, },
};
