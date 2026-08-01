const ADDRESSES = require('../helper/coreAssets.json')
async function tvl(_, _1, _2, {api}) {
    const depositedMetis = await api.call({
        abi: 'function totalDeposits() view returns (uint256)',
        target: '0x96C4A48Abdf781e9c931cfA92EC0167Ba219ad8E'
    });

    api.add(ADDRESSES.metis.Metis, depositedMetis);
}

async function goatTvl(api) {
  const {chain, block} = api;
  const {WBTC, DOGEB, BTCB} = ADDRESSES.goat;
  const tokens = ['0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf', DOGEB, BTCB];
  const tokenContracts = await api.multiCall({
    chain,
    block,
    abi: 'function getTokenContracts(address _token) view returns (tuple(address artToken, address depositPool, address withdrawalManager, address baseRewardPool))',
    calls: tokens.map(token => ({
      target: '0x479603DE0a8B6D2f4D4eaA1058Eea0d7Ac9E218d',
      params: token,
    })),
  });
  const totalDeposits = await api.multiCall({
    chain,
    block,
    abi: 'function totalDeposited() view returns (uint256)',
    calls: tokenContracts.map(contracts => ({
      target: contracts.depositPool,
    }))
  });
  tokens.forEach((token, index) =>{
      api.add(
        index === 0 ? WBTC : token,
        totalDeposits[index],
      );
  });
}

module.exports = {
    metis: {
        tvl
    },
    goat: {
        tvl: goatTvl,
    },
};
