const ADDRESSES = require('../helper/coreAssets.json');

const chefContract = "TEubMt2TNag5NN1JXVaeysUk8GNTTYmtVX";

async function tvl(api) {

    const usdtBalance = await api.call({
        abi: 'function balanceOf(address account) external view returns (uint256)',
        target: ADDRESSES.tron.USDT,
        params: [chefContract],
    });

    const wallet1 = await api.call({
        abi: 'function balanceOf(address account) external view returns (uint256)',
        target: ADDRESSES.tron.USDT,
        params: ["TK8v6HPniRKYixj6Egby712nr5R3xrYYCT"],
    });

    const wallet2 = await api.call({
        abi: 'function balanceOf(address account) external view returns (uint256)',
        target: ADDRESSES.tron.USDT,
        params: ["TYRmcmmKvjL1SFQbvPQtJU1YcaXEnH8dvT"],
    });

    api.add(ADDRESSES.tron.USDT, usdtBalance);
    api.add(ADDRESSES.tron.USDT, wallet1);
    api.add(ADDRESSES.tron.USDT, wallet2);

}


module.exports = {
    methodology: 'Counts Number in The SunPerp Vault.',
    tron: { tvl }
}