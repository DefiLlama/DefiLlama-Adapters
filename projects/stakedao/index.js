const abi = require('./abi.json')
const { sumTokens2, PANCAKE_NFT_ADDRESS } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');

const STRATEGIES_ENDPOINT = 'https://api.stakedao.org/api/strategies';
const LOCKERS_ENDPOINT = 'https://api.stakedao.org/api/lockers';

const PANCAKESWAP_MASTERCHEF_V3 = '0x556B9306565093C855AEA9AE92A594704c2Cd59e'
const PANCAKESWAP_MASTERCHEF_V3_ARBITRUM = '0x5e09ACf80C0296740eC5d6F643005a4ef8DaA694'

const CONFIG = {
  ethereum: {
    sanctuary: '0xaC14864ce5A98aF3248Ffbf549441b04421247D3',
    arbStrat: '0x20D1b558Ef44a6e23D9BF4bf8Db1653626e642c3',
    veSdt: '0x0C30476f66034E11782938DF8e4384970B6c9e8a',
    sdtToken: '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F',
    vePendle: '0x4f30A9D41B80ecC5B94306AB4364951AE3170210',
    veMAV: '0x4949ac21d5b2a0ccd303c20425eeb29dccba66d8',
    vaults: [
      '0xB17640796e4c27a39AF51887aff3F8DC0daF9567', // crv3_vault_v2 
      '0xCD6997334867728ba14d7922f72c893fcee70e84', // eurs_vault_v2 
      '0x5af15DA84A4a6EDf2d9FA6720De921E1026E37b7', // frax_vault_v2 
      '0x99780beAdd209cc3c7282536883Ef58f4ff4E52F', // frax_vault2_v2 
      '0xa2761B0539374EB7AF2155f76eb09864af075250', // eth_vault_v2 
      '0xbC10c4F7B9FE0B305e8639B04c536633A3dB7065', // steth_vault_v2
    ],
    lockers: {
      curve: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
      balancer: '0xea79d1A83Da6DB43a85942767C389fE0ACf336A5',
      pendle: '0xD8fa8dC5aDeC503AcC5e026a98F32Ca5C1Fa289A',
      yearn: '0xF750162fD81F9a436d74d737EF6eE8FC08e98220',
      pancakeswap: '0xB7F79090190c297F59A2b7D51D3AEF7AAd0e9Af3'
    }
  },
  polygon: {},
  avax: {},
  bsc: {
    VE_CAKE: '0x5692DB8177a81A6c6afc8084C2976C9933EC1bAB',
    lockers: {
      pancakeswap: '0x1e6f87a9ddf744af31157d8daa1e3025648d042d'
    }
  },
  arbitrum: {
    lockers: {
      curve: '0x52f541764E6e90eeBc5c21Ff570De0e2D63766B6',
      pancakeswap: '0xE5244b1A263ce45CF1E51DfA97469711E9bAD68d'
    }
  },
}

const abis = {
  positionData: 'function positionData(address arg0) view returns (uint128 amount, uint128 end)',
  lockups: 'function lockups(address,uint256) view returns (uint256 amount, uint256 end, uint256 points)',
  lockupCount: 'function lockupCount(address) view returns (uint256)',
  balances: 'function balances(uint256) view returns(uint256)',
  tokenPerShare: 'function tokenPerShare() view returns(uint256 _token0PerShare, uint256 _token1PerShare)',
}

async function getStrategies(api, lockers) {
  const chainId = api.chainId;
  const extractors = {
    pendle: (s) => s.lpToken?.address,
    default: (s) => s.gaugeAddress,
  };

  const responses = await Promise.all(
    Object.keys(lockers).map((key) =>
      getConfig(`sakedao/${api.chain}-${key}`, `${STRATEGIES_ENDPOINT}/${key}/${chainId}.json`)
    )
  );

  return responses.flatMap((resp, i) => {
    const key = Object.keys(lockers)[i];
    const getAddress = extractors[key] || extractors.default;

    return resp.deployed
      .map((strat) => [getAddress(strat), lockers[key]])
      .filter(([token, owner]) => token && owner);
  });
}

const tvl = async (api) => {
  const { vaults = {}, lockers = {}, vePendle, veMAV } = CONFIG[api.chain]

  // ➜ ERC4626 vaults
  await api.erc4626Sum({ calls: vaults })

  // ➜ Strategies
  const strategies = await getStrategies(api, lockers)

  // ➜ Lockers infos
  const lockerStrategies = (await get(LOCKERS_ENDPOINT)).parsed
  const lockersInfos = lockerStrategies
    .filter(l => l.chainId === api.chainId)
    .map(l => ({ contract: l.modules.locker, veToken: l.modules.veToken, token: l.token.address }));

  const calls = [], callsPendle = [], callsMAV = [];
  lockersInfos.forEach(({ veToken, contract }) => {
    if (veToken === vePendle) return callsPendle.push({ target: veToken, params: contract });
    if (veToken.toLowerCase() === veMAV) return callsMAV.push({ veToken, contract });
    calls.push({ target: veToken, params: contract });
  });

  const lockerBals = await api.multiCall({ abi: abi.locked, calls, permitFailure: true });
  const lockerPendleBal = await api.multiCall({ abi: abis.positionData, calls: callsPendle });
  const counts = await api.multiCall({ calls: callsMAV.map(({ veToken, contract }) => ({ target: veToken, params: [contract] })), abi: abis.lockupCount });

  const lockerMAVBal = await Promise.all(
    counts.map(async (count, i) => {
      const { veToken, contract } = callsMAV[i];

      const lockups = await Promise.all(
        Array.from({ length: count }, (_, idx) => api.call({ abi: abis.lockups, target: veToken, params: [contract, idx] }))
      );

      return lockups.reduce((sum, l) => sum + (l.amount), 0);
    })
  );

  lockersInfos.forEach(({ veToken, token }) => {
    if (veToken === vePendle) return api.add(token, lockerPendleBal.shift()?.amount ?? 0);
    if (veToken.toLowerCase() === veMAV) return api.add(token, lockerMAVBal.shift() ?? 0);
    api.add(token, lockerBals.shift()?.amount ?? 0);
  });

  return sumTokens2({
    api,
    tokensAndOwners: strategies,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, lockers.pancakeswap]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3 },
    resolveLP: true
  })
}

async function staking(api) {
  const { sanctuary, arbStrat, veSdt, sdtToken } = CONFIG[api.chain]
  return sumTokens2({ api, owners: [sanctuary, arbStrat, veSdt,], tokens: [sdtToken] })
}

async function getBSCStrategies(api) {
  const chainId = api.chainId
  const resp = await getConfig('stakedao/bsc-cake', `${STRATEGIES_ENDPOINT}/pancakeswap/${chainId}.json`);
  const strats = resp.deployed.filter((strat) => strat.version !== '3');

  const deposits = await api.multiCall({ abi: 'uint256:totalSupply', calls: strats.map((s) => s.sdGauge.address) });

  const stableStrats = [];
  const defaultStrats = [];

  strats.forEach((strat, i) => {
    strat.deposits = deposits[i];
    if (strat.version === 'stable') stableStrats.push(strat);
    else if (strat.version === '2') api.add(strat.lpToken.address, deposits[i]);
    else defaultStrats.push(strat);
  });

  // ➜ Stables
  if (stableStrats.length) {
    const [stableLPsupplies, stableToken0Bals, stableToken1Bals] = await Promise.all([
      api.multiCall({ abi: 'erc20:totalSupply', calls: stableStrats.map((s) => s.lpToken.address) }),
      api.multiCall({ abi: abis.balances, calls: stableStrats.map((s) => ({ target: s.pool, params: 0 })) }),
      api.multiCall({ abi: abis.balances, calls: stableStrats.map((s) => ({ target: s.pool, params: 1 })) }),
    ]);

    stableStrats.forEach((strat, i) => {
      const ratio = strat.deposits / stableLPsupplies[i];
      api.add(strat.coins[0].address, ratio * stableToken0Bals[i]);
      api.add(strat.coins[1].address, ratio * stableToken1Bals[i]);
    });
  }

  // ➜ Default
  if (defaultStrats.length) {
    const dGauges = defaultStrats.map((s) => s.gaugeAddress);
    const dLpTokens = defaultStrats.map((s) => s.lpToken.address);

    const [adapterAddress, tokenPerShares, dLpSupplies] = await Promise.all([
      api.multiCall({ abi: 'address:adapterAddr', calls: dGauges }),
      api.multiCall({ abi: abis.tokenPerShare, calls: dGauges }),
      api.multiCall({ abi: 'erc20:totalSupply', calls: dLpTokens }),
    ]);

    defaultStrats.forEach((strat, i) => {
      const ratio = strat.deposits / dLpSupplies[i];
      api.add(strat.coins[0].address, ratio * tokenPerShares[i]._token0PerShare);
      api.add(strat.coins[1].address, ratio * tokenPerShares[i]._token1PerShare);
    });
  }
}

const bscTvl = async (api) => {
  const { VE_CAKE, lockers } = CONFIG[api.chain]

  // ➜ CakeLocker
  const [cakeLock] = await api.multiCall({ abi: abi.locks, calls: [{ target: VE_CAKE, params: lockers.pancakeswap }] });
  api.add('0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', cakeLock.amount);

  // ➜ LP Strategies
  await getBSCStrategies(api);

  return sumTokens2({
    api,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, lockers.pancakeswap]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3 },
  });
}

const arbitrumTvl = async (api) => {
  const { lockers } = CONFIG[api.chain]

  // ➜ Strategies
  const strategies = await getStrategies(api, lockers);

  return sumTokens2({
    api,
    tokensAndOwners: strategies,
    uniV3nftsAndOwners: [[PANCAKE_NFT_ADDRESS, lockers.pancakeswap]],
    uniV3ExtraConfig: { nftIdFetcher: PANCAKESWAP_MASTERCHEF_V3_ARBITRUM },
  });
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl, staking },
  bsc: { tvl: bscTvl },
  arbitrum: { tvl: arbitrumTvl },
  polygon: { tvl: (api) => { return api.erc4626Sum({ calls: ['0x7d60F21072b585351dFd5E8b17109458D97ec120'] })} },
  avax: { tvl: (api) => { return api.erc4626Sum({ calls: ['0x0665eF3556520B21368754Fb644eD3ebF1993AD4'] })} },
}