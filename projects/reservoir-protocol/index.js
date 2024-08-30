const rUSD = '0x09D4214C03D01F49544C0448DBE3A27f768F2b34';
const srUSD = '0x738d1115B90efa71AE468F1287fc864775e23a31';
const trUSD = '0x128D86A9e854a709Df06b884f81EeE7240F6cCf7';

const tvl = async (api) => {

    let tvl;
    let target;

    target = trUSD;
    tvl = await api.call({ target, abi: 'function totalDebt() external view returns (uint256)' });

    api.add(target, tvl);

    target = rUSD;
    tvl = await api.call({ target, abi: 'function totalSupply() external view returns (uint256)' });

    api.add(target, tvl);

    target = srUSD;
    tvl = await api.call({ target, abi: 'function totalSupply() external view returns (uint256)' });

    api.add(target, tvl);
}

module.exports = {
    ethereum: { tvl }
};
