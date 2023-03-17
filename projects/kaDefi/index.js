const sdk = require('@defillama/sdk');

const WkavaKafiLpAddress = "0xA4Bea6f776f483a304FD6980F8F8c861AB24DE07";
const ERC20ContractWkavaAddress = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const ERC20ContractKafiAddress = "0x7356deD08af181869B492fcd641f4aEfB74De3E7";
const POL_Pool_One = "0xdf65B85E43dBa1F153325e7e4A0682B7DeBBFe0f";
const POL_Pool_Two = "0x738d2b4b59A0A3AA4086bC44C40a45845bB73FCC";

async function tvl(timestamp, block, chainBlocks, { api }) {
    const chain = "kava";
    const balances = {};

    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [POL_Pool_One],
    });

    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalance, chain);


    const collateralPower = await api.call({
        abi: 'uint256:totalPower',
        target: POL_Pool_Two,
        params: [],
    });

    const lpWkavaBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [WkavaKafiLpAddress],
    });
    const lpKafiBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractKafiAddress,
        params: [WkavaKafiLpAddress],
    });

    const collateralBalanceTwo = (lpWkavaBalance / lpKafiBalance) * collateralPower;

    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalanceTwo, chain);


    return balances;
}

module.exports = {
    timetravel: false,
    kava: {
        tvl,
    }
};


