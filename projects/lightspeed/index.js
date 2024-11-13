// Contract addresses for token, vaults, and other relevant CAs
const CONTRACT_ADDRESSES = {
    WARPSPEED_VELVETCAPITAL_VAULT: '0x8177ec2734d0f32dab7ab7269cbbe7d7232d1932',
    LIGHTSPEED_TOKEN: '0xB01CF1bE9568f09449382a47Cd5bF58e2A9D5922'
  };

// Calculate TVL of Warpcore (WARP)
async function tvl(api) {
    const warpcoreCollateral = await api.call({
        abi: 'erc20:balanceOf',
        target: CONTRACT_ADDRESSES.LIGHTSPEED_TOKEN,
        params: [CONTRACT_ADDRESSES.WARPSPEED_VELVETCAPITAL_VAULT],
    });

    api.add(CONTRACT_ADDRESSES.LIGHTSPEED_TOKEN, warpcoreCollateral);

}

module.exports = {
    base: {
        tvl,
    },
    methodology: 'The TVL encompasses the total value of LightSpeed ($Speed) that are in the Velvet.Capital Warpspeed Vault on Base.'
}