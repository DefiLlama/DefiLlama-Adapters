const sdk = require('@defillama/sdk');

const ERC20ContractWkavaAddress = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";

const POL_Pool_One = "0x12450E12A7eC069b51b46C92Ac122D90DbD9A99D";
const POL_Pool_Two = "0x9aedc0D09E0Ede60Ba5B5F969a955937af024c44";

async function tvl(timestamp, block, chainBlocks, { api }) {
    const chain = "kava";
    const balances = {};

    const collateralBalanceOne = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [POL_Pool_One],
    });
    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalanceOne, chain);


    const collateralBalanceTwo = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [POL_Pool_Two],
    });
    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalanceTwo, chain);

    return balances;
}

module.exports = {
    timetravel: false,
    kava: {
        tvl,
    }
};
