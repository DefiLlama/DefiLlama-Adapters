const sdk = require('@defillama/sdk');

const WkavaKastLpAddress = "0x821dd423c744cAa452C0Ae1651a9388009efbE5b";

const ERC20ContractWkavaAddress = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const ERC20ContractKastAddress = "0x32a57dCa514Cc601d3DDEe974f57Db9Dc2CfE83b";

const POL_Pool_One = "0x12450E12A7eC069b51b46C92Ac122D90DbD9A99D";
const POL_Pool_Two = "0x9aedc0D09E0Ede60Ba5B5F969a955937af024c44";
const POL_Pool_Three = "0x486F6f8cF46EC5CC584ec3f08C494E55a8484111";

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



    const collateralPower = await api.call({
        abi: 'uint256:totalPower',
        target: POL_Pool_Three,
        params: [],
    });

    const lpWkavaBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractWkavaAddress,
        params: [WkavaKastLpAddress],
    });
    const lpKastBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: ERC20ContractKastAddress,
        params: [WkavaKastLpAddress],
    });

    const collateralBalanceThree = (lpWkavaBalance / lpKastBalance) * collateralPower;

    await sdk.util.sumSingleBalance(balances, ERC20ContractWkavaAddress, collateralBalanceThree, chain);

    return balances;
}

module.exports = {
    timetravel: false,
    kava: {
        tvl,
    }
};
