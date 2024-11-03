const ADDRESSES = require('../helper/coreAssets.json');

const rUSD = '0x09D4214C03D01F49544C0448DBE3A27f768F2b34';
const srUSD = '0x738d1115B90efa71AE468F1287fc864775e23a31';
const termIssuer = '0x128D86A9e854a709Df06b884f81EeE7240F6cCf7';

const tvl = async (api) => {

    const trUSDTotalDebt = await api.call({ target: termIssuer, abi: 'function totalDebt() external view returns (uint256)' });
    api.add(termIssuer, trUSDTotalDebt);

    const rUSDTotalSupply = await api.call({ target: rUSD, abi: 'function totalSupply() external view returns (uint256)' });
    api.add(rUSD, rUSDTotalSupply);

    const srUSDTotalSupply = await api.call({ target: srUSD, abi: 'function totalSupply() external view returns (uint256)' });
    api.add(srUSD, srUSDTotalSupply / 1e12);
}

module.exports = {
    ethereum: {
        tvl,
        borrowed: async (api) => {
            const borrows = await api.call({
                target: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                abi: 'function balanceOf(address) external view returns (uint256)',
                params: ['0x4809010926aec940b550D34a46A52739f996D75D']
            });
            api.add('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', borrows)
        }
    }
};
