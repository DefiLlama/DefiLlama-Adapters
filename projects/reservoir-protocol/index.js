const ADDRESSES = require('../helper/coreAssets.json');

const USDC = ADDRESSES['ethereum'].USDC;
const abi = 'function fundTotalValue() external view returns (uint256)';

const tvl = async (api) => {
    let target;

    target = '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7';
    const ifHV1 = await api.call({ target, abi });

    target = '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80';
    const ifBill = await api.call({ target, abi });

    target = '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10';
    const steakUSDC = await api.call({ target, abi });

    target = '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61';
    const steakRUSD = await api.call({ target, abi });

    api.add(USDC, ifHV1 / 1e12);
    api.add(USDC, ifBill / 1e12);

    api.add(USDC, steakUSDC / 1e12);
    api.add(USDC, steakRUSD / 1e12);
}

module.exports = {
    ethereum: {
        tvl
    }
};
