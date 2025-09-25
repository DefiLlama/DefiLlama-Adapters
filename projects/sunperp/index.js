const ADDRESSES = require('../helper/coreAssets.json');

const chefContract = "TEubMt2TNag5NN1JXVaeysUk8GNTTYmtVX";

async function tvl(api) {

    const usdtBalance = await api.call({
        abi: 'function balanceOf(address account) external view returns (uint256)',
        target: ADDRESSES.tron.USDT,
        params: [chefContract],
    });

    api.add(ADDRESSES.tron.USDT, usdtBalance);
}

module.exports = {
    methodology: 'Counts Number in The SunPerp Vault.',
    tron: { tvl }
}
