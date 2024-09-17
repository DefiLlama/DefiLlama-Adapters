const ADDRESSES = require('../helper/coreAssets.json');

const rUSD = '0x09D4214C03D01F49544C0448DBE3A27f768F2b34';
const srUSD = '0x738d1115B90efa71AE468F1287fc864775e23a31';
const termIssuer = '0x128D86A9e854a709Df06b884f81EeE7240F6cCf7';

const tvl = async (api) => {

    const trUSDTotalDebt = await api.call({ target: termIssuer, abi: 'function totalDebt() external view returns (uint256)' });

    api.add(ADDRESSES['ethereum'].USDC, trUSDTotalDebt / 1e12);

    const rUSDTotalSupply = await api.call({ target: rUSD, abi: 'function totalSupply() external view returns (uint256)' });

    api.add(ADDRESSES['ethereum'].USDC, rUSDTotalSupply / 1e12);

    const srUSDTotalSupply = await api.call({ target: srUSD, abi: 'function totalSupply() external view returns (uint256)' });

    api.add(ADDRESSES['ethereum'].USDC, srUSDTotalSupply / 1e12);
}

module.exports = {
    ethereum: { tvl }
};
