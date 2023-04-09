// beekava
const sdk = require('@defillama/sdk');

const WkavaBeekLpAddress = "0x6F95ff58Cdbf17594882E7EF948687aC81c2fEE0";

const ERC20ContractWkavaAddress = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const ERC20ContractBeekAddress = "0xb520e9C5123A450828c190cb6073583a5ecd0d74";

const POL_Pool_One = "0x00635507895D30801f60a2859990420013068ee0";
const POL_Pool_Two = "0x339522a317E74ac1f7D4d8D9bDc3181a9801416E";
const POL_Pool_Three = "0x8470991Ce998d336146104549A04690082f2B372";

async function tvl(timestamp, block, chainBlocks, { api }) {
    const chain = "kava";
    const balances = {};


    const collateralPowerOne = await api.call({
        abi: 'uint256:totalPower',
        target: POL_Pool_One,
        params: [],
    });
    const collateralTotalSupplyOne = await api.call({
        abi: 'erc20:totalSupply',
        target: WkavaBeekLpAddress,
        params: [],
    });
    const collateralBalanceOne = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [WkavaBeekLpAddress],
    });
    const collateralBalance = collateralPowerOne / collateralTotalSupplyOne * collateralBalanceOne * 2;
    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalance, chain);


    const collateralBalanceTwo = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [POL_Pool_Two],
    });
    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalanceTwo, chain);


    const collateralPower = await api.call({
        abi: 'uint256:totalPower',
        target: POL_Pool_Three,
        params: [],
    });
    const lpWkavaBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [WkavaBeekLpAddress],
    });
    const lpBeekBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractBeekAddress,
        params: [WkavaBeekLpAddress],
    });
    const collateralBalanceThree = (lpWkavaBalance / lpBeekBalance) * collateralPower;
    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalanceThree, chain);


    return balances;
}

module.exports = {
    timetravel: false,
    kava: {
        tvl,
    }
};
