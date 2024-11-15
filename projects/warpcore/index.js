// Contract addresses for token, vaults, and pools
const CONTRACT_ADDRESSES = {
    WARPSPEED_VELVETCAPITAL_VAULT: '0x8177ec2734d0f32dab7ab7269cbbe7d7232d1932',
    WARPCORE_TOKEN: '0xE8E286B378254c4913c0C6964361636384b9D018',
};

// Calculate TVL of Warpcore (Core)
async function tvl(api) {
    const warpcoreCollateral = await api.call({
        abi: 'erc20:balanceOf',
        target: CONTRACT_ADDRESSES.WARPCORE_TOKEN,
        params: [CONTRACT_ADDRESSES.WARPSPEED_VELVETCAPITAL_VAULT],
    });

    api.add(CONTRACT_ADDRESSES.WARPCORE_TOKEN, warpcoreCollateral);

}

module.exports = {
    base: {
        tvl: tvl,
    },
    methodology: 'The TVL encompasses the total value of WarpCore ($Core) that is in the Velvet.Capital Warpspeed Vault on Base.'
}