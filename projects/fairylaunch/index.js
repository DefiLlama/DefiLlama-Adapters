const FACTORY = '0x28163d7943AA6715a9559D468B29c0343412E236';

const LAUNCH_INFO_ABI = {
  components: [
    { name: 'launchId', type: 'uint256' },
    { name: 'creator', type: 'address' },
    { name: 'treasury', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'bondingCurve', type: 'address' },
    { name: 'graduated', type: 'bool' },
    { name: 'createdAt', type: 'uint256' },
    { name: 'graduatedAt', type: 'uint256' },
    { name: 'name', type: 'string' },
    { name: 'symbol', type: 'string' },
    { name: 'metadataUri', type: 'string' },
  ],
  name: 'LaunchInfo',
  type: 'tuple',
};

async function tvl(api) {
  const totalLaunches = await api.call({
    target: FACTORY,
    abi: 'uint256:totalLaunches',
  });

  const bondingCurves = [];

  for (let i = 1; i <= Number(totalLaunches); i++) {
    try {
      const launch = await api.call({
        target: FACTORY,
        abi: {
          inputs: [{ name: 'launchId', type: 'uint256' }],
          name: 'getLaunch',
          outputs: [LAUNCH_INFO_ABI],
          stateMutability: 'view',
          type: 'function',
        },
        params: [i],
      });

      if (!launch.graduated && launch.bondingCurve !== '0x0000000000000000000000000000000000000000') {
        bondingCurves.push(launch.bondingCurve);
      }
    } catch (e) {
      // Ignorar errores individuales
    }
  }

  const ethReserves = await api.multiCall({
    calls: bondingCurves.map(target => ({ target })),
    abi: 'uint256:ethReserve',
    permitFailure: true,
  });

  ethReserves.forEach((reserve) => {
    if (reserve && reserve > 0) {
      api.addGasToken(reserve);
    }
  });
}

module.exports = {
  bsc: {
    tvl,
  },
};