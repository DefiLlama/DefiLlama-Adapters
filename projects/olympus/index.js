const BigNumber = require('bignumber.js');
const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');

const OHM_V1 = '0x383518188c0c6d7730d91b2c03a03c837814a899';
const OHM = '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5';
const GOHM = '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f';
const SOHM_V1 = '0x31932e6e45012476ba3a3a4953cba62aee77fbbe';
const SOHM_V2 = '0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f';
const SOHM_V3 = '0x04906695D6D12CF5459975d7C3C03356E4Ccd460';
const WSOHM = '0xCa76543Cf381ebBB277bE79574059e32108e3E65';

const AURA = '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF';
const VEFXS = '0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0';
const JONES = '0x10393c20975cF177a3513071bC110f7962CD67da';

// Address lists: https://docs.olympusdao.finance/main/contracts/addresses 
// https://github.com/OlympusDAO/olympus-protocol-metrics-subgraph/blob/120b50a82d5f4be476201965ee3762710778eb92/subgraphs/ethereum/src/utils/Constants.ts
const OlympusStakings = [
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2", // Old Staking Contract
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a", // V1 Staking Contract
  "0xb63cac384247597756545b500253ff8e607a8020", // V2 Staking Contract
];

// Olympus-controlled multisigs, custodian wallets and yield-farming MSes on Ethereum.
// Augmented at runtime via the Bophades Kernel TRSRY + CHREG modules.
const ethereumOwners = [
  '0x0d33c811d0fcc711bcb388dfb3a152de445be66f',
  '0x0e1177e47151Be72e5992E0975000E73Ab5fd9D4',
  '0x8CaF91A6bb38D55fB530dEc0faB535FA78d98FaD',
  '0x872ebDd8129Aa328C89f6BF032bBD77a4c4BaC7e',
  '0xa9b52a2d0ffdbabdb2cb23ebb7cd879cac6618a6',
  '0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6',
  '0xBA42BE149e5260EbA4B82418A6306f55D532eA47',
  '0xf7deb867e65306be0cb33918ac1b8f89a72109db',
  '0x3dF5A355457dB3A4B5C744B8623A7721BF56dF78',
  '0x408a9A09d97103022F53300A3A14Ca6c3FF867E8',
  '0xDbf0683fC4FC8Ac11e64a6817d3285ec4f2Fc42d',
  '0xdfc95aaf0a107daae2b350458ded4b7906e7f728',
  '0x2d643df5de4e9ba063760d475beaa62821c71681',
  '0x943C1dfA7dA96e54242bD2c78DD3eF5C7b24b18C',
  '0x75E7f7D871F4B5db0fA9B0f01B7422352Ec9618f',
  '0x245cc372c84b3645bf0ffe6538620b04a217988b',
  '0xF65A665D650B5De224F46D729e2bD0885EeA9dA5',
  '0x97b3ef4c558ec456d59cb95c65bfb79046e31fca',
  '0x5db0761487e26B555F5Bfd5E40F4CBC3E1a7d11E',
  '0x0EA26319836fF05B8C5C5afD83b8aB17dd46d063',
  '0xe3312c3f1ab30878d9686452f7205ebe11e965eb',
  '0x061C8610A784b8A1599De5B1157631e35180d818',
  '0x886CE997aa9ee4F8c2282E182aB72A705762399D',
  '0x31f8cc382c9898b273eff4e0b7626a6987c846e8',
  '0x9A315BdF513367C0377FB36545857d12e85813Ef',
  '0xa8687A15D4BE32CC8F0a8a7B9704a4C3993D9613',
  '0xde7b85f52577b113181921a7aa8fc0c22e309475',
  '0x2075e3b46470cfcE124Daaf52b46Dcf965727Dd1',
];

const ethereumTreasuryTokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.DAI,
  '0x028171bca77440897b824ca71d1c56cac55b68a3', // aDAI
  '0x4579a27af00a62c0eb156349f31b345c08386419', // aLUSD
  '0x4f5923fc5fd4a93352581b38b7cd26943012decf', // aEthUSDe
  '0x6df1c1e379bc5a00a7b4c6e67a203333772f45a8', // variableDebtEthUSDT — yield-farming loop liability
  '0x72e95b8931767c79ba4eee721354d6e99a61d004', // variableDebtEthUSDC — yield-farming loop liability
  ADDRESSES.ethereum.FRAX,
  ADDRESSES.ethereum.LUSD,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDe,
  ADDRESSES.ethereum.USDS, 
  ADDRESSES.ethereum.SDAI, 
  ADDRESSES.ethereum.sUSDe, 
  ADDRESSES.ethereum.sUSDS,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.WSTETH,
  ADDRESSES.ethereum.WEETH,
  AURA,
  '0x616e8BfA43F920657B3497DBf40D6b1A02D4608d', // auraBAL
  '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
  ADDRESSES.ethereum.CVX,
  ADDRESSES.ethereum.vlCVX,                  
  '0xd18140b4b819b895a3dba5442f959fa44994af50', // vlCVX v1
  '0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC', // vlAURA 
  ADDRESSES.ethereum.cvxCRV,
  ADDRESSES.ethereum.FXS,
  '0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d', // LQTY
  ADDRESSES.ethereum.LIDO,
  ADDRESSES.ethereum.SUSHI, 
  '0x8798249c2e607446efb7ad49ec89dd1865ff4272', // xSUSHI
  ADDRESSES.ethereum.TOKE,
  '0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B', // TRIBE
  '0xdbdb4d16eda451d0503b854cf79d55697f90c8df', // ALCX
  '0xc55126051b22ebb829d00368f4b12bde432de5da', // BTRFLY v2
  '0x742B70151cd3Bc7ab598aAFF1d54B90c3ebC6027', // rlBTRFLY
  '0xEd1480d12bE41d92F36f5f7bDd88212E381A3677',
  '0xc770eefad204b5180df6a14ee197d99d808ee52d',
  '0xc2544a32872a91f4a553b404c6950e89de901fdb',
  '0x43d4a3cd90ddd2f8f4f693170c9c8098163502ad',
];

const chains = {
  ethereum: {
    owners: ethereumOwners,
    treasuryTokens: ethereumTreasuryTokens,
    ownTokens: [OHM_V1, OHM, GOHM, SOHM_V1, SOHM_V2, SOHM_V3, WSOHM],
    special: {
      bophadesKernel: '0x2286d7f9639e8158FaD1169e76d1FbC38247f54b',
      keycodes: { TRSRY: '0x5452535259', CHREG: '0x4348524547' },
      veFxs: {
        token: VEFXS,
        underlying: ADDRESSES.ethereum.FXS,
        owners: ['0xde7b85f52577b113181921a7aa8fc0c22e309475'],
      },
      convexRewardPools: [
        '0x3fe65692bfcd0e6cf84cb1e7d24108e434a7587e',
        '0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e',
        '0x7e880867363A7e321f5d260Cade2B0Bb2F717B02',
        '0xd683C7051a28fA150EB3F4BD92263865D4a67778',
        '0x27A8c58e3DE84280826d615D80ddb33930383fE9',
      ],
    },
  },
  arbitrum: {
    owners: [ '0x012BBf0481b97170577745D2167ee14f63E2aD4C'],
    treasuryTokens: [
      ADDRESSES.null,
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.FRAX,
      JONES,
      '0xfb9E5D956D889D91a82737B9bFCDaC1DCE3e1449', // LQTY
      '0x93b346b6bc2548da6a1e7d98e9a421b42541425b', // LUSD
      '0x539bde0d7dbd336b79148aa742883198bbf60342', // MAGIC
      ADDRESSES.arbitrum.USDC,
      '0xa684cd057951541187f288294a1e1c2646aa2d24', // VSTA
      ADDRESSES.arbitrum.WETH,
    ],
    ownTokens: [
      '0xf0cb2dc0db5e6c66B9a70Ac27B06b878da017028', // OHM (Arb)
      '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1', // gOHM (Arb)
    ],
    special: {
      jonesStaking: '0xb94d1959084081c5a11C460012Ab522F5a0FD756'
    },
  },
  base: {
    owners: ['0x18a390bD45bCc92652b9A91AD51Aed7f1c1358f5'],
    treasuryTokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
    ownTokens: ['0x060cb087a9730E13aa191f31A6d86bFF8DfcdCC0'], // OHM (Base)
  },
  berachain: {
    owners: [
      '0x91494D1BC2286343D51c55E46AE80C9356D099b5',
      '0xb1fA0Ac44d399b778B14af0AAF4bCF8af3437ad1',
      '0xe22b2d431838528BcaD52d11C4744EfCdc907a1c',
      '0x082689241b09c600b3eaf3812b1d09791e7ded5a', // THJ Custodian
      '0xb65e74f6b2c0633e30ba1be75db818bb9522a81a',
    ],
    treasuryTokens: [
      ADDRESSES.null,
      '0x9b6761bf2397Bb5a6624a856cC84A3A14Dcd3fe5', // iBERA
      '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
      '0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe',
      ADDRESSES.berachain.USDC,
      ADDRESSES.berachain.HONEY,
      ADDRESSES.berachain.WBERA,
    ],
    ownTokens: ['0x18878Df23e2a36f81e820e4b47b4A40576D3159C'], // OHM (Berachain)
  },
  fantom: {
    owners: ['0x2bc001ffeb862d843e0a02a7163c7d4828e5fb10'], // Cross-Chain Fantom custodian
    treasuryTokens: [
      ADDRESSES.fantom.WFTM,
      '0x74b23882a30290451a17c44f4f05243b6b58c76d', // wETH (multichain bridge)
      '0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9', // LQDR
      '0xdc301622e621166bd8e82f2ca0a26c13ad0be355', // FRAX (multichain)
      '0x841fad6eae12c286d1fd18d1d525dffa75c7effe', // BOO
      '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e', // BEETS
      "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
      "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    ],
    ownTokens: ['0x91fa20244fb509e8289ca630e5db3e9166233fdc'], // gOHM (Fantom)
  },
};

const normalize = a => a && a.toLowerCase();
const isAddress = a => !!a && /^0x[a-f0-9]{40}$/.test(normalize(a)) && normalize(a) !== ADDRESSES.null;
const addressSet = (arr = []) => new Set(arr.filter(Boolean).map(normalize));

// Discover the live TRSRY and cross-chain treasury contracts from the Bophades Kernel.
// Olympus can upgrade the TRSRY module via Kernel migration — never hardcode it.
async function discoverOwners(api, chainConfig) {
  const owners = [...(chainConfig.owners || [])];
  const special = chainConfig.special || {};

  if (api.chain === 'ethereum' && special.bophadesKernel) {
    const keycodeAbi = 'function getModuleForKeycode(bytes5 keycode_) view returns (address)';
    const trsry = await api.call({ target: special.bophadesKernel, abi: keycodeAbi, params: [special.keycodes.TRSRY] });
    if (isAddress(trsry)) owners.push(trsry);

    const chreg = await api.call({ target: special.bophadesKernel, abi: keycodeAbi, params: [special.keycodes.CHREG] });
    if (isAddress(chreg)) {
      const count = await api.call({ target: chreg, abi: 'uint256:registryCount' });
      if (count) {
        const addrs = await api.multiCall({
          target: chreg,
          calls: Array.from({ length: Number(count) }, (_, i) => i),
          abi: 'function registry(uint256) view returns (address)',
          permitFailure: true,
        });
        owners.push(...addrs.filter(isAddress));
      }
    }
  }

  return [...addressSet(owners)];
}

async function addVeFxs(api, special) {
  if (!special.veFxs) return;
  const { token, underlying, owners } = special.veFxs;
  const locks = await api.multiCall({
    target: token,
    calls: owners,
    abi: 'function locked(address) view returns (int128 amount, uint256 end)',
    permitFailure: true,
  });
  locks.forEach(lock => {
    const amount = lock && (lock.amount ?? lock[0]);
    if (amount && new BigNumber(amount).gt(0)) api.add(underlying, amount.toString());
  });
}

async function addJonesStaking(api, special, owners) {
  if (!special.jonesStaking) return;

  const calls = owners.map(o => {return {target: special.jonesStaking, params: [0, o]}})
  const balances = await api.multiCall({owners, calls, abi: 'function userInfo(uint,address) returns(uint,int)'})
  balances.forEach(b => { if (b) api.add(JONES, b.amount ?? b[0]) });
}

function buildTvl(mode) {
  return async function(api) {
    const chainConfig = chains[api.chain];
    if (!chainConfig) return {};

    const owners = await discoverOwners(api, chainConfig);
    const ownSet = addressSet(chainConfig.ownTokens);
    const blacklist = mode === 'ownTokens' ? [] : [...ownSet];
    const tokens = mode === 'ownTokens' ? chainConfig.ownTokens : chainConfig.treasuryTokens;
    const convexRewardPools = mode === 'tvl' ? chainConfig.special?.convexRewardPools : undefined;
    
    if ((tokens?.length || convexRewardPools?.length) && owners.length) {
      await sumTokens2({
        api,
        owners,
        tokens,
        convexRewardPools,
        resolveLP: true,
        permitFailure: true,
        blacklistedTokens: blacklist,
      });
    }

    if (mode === 'tvl' && chainConfig.special) {
      await addVeFxs(api, chainConfig.special);
      await addJonesStaking(api, chainConfig.special, owners);
    }
  };
}

module.exports = {
  start: '2021-03-24',
  timetravel: false,
  hallmarks: [
    ["2021-03-24", "Olympus Launch"],
    ["2021-10-19", "OHM v2 Migration begins"],
    ["2022-01-21", "Inverse Bonds"],
    ["2022-04-30", "Fei Protocol Hack"],
    ["2022-11-17", "Range-Bound Stability Launch"],
    ["2023-07-23", "Cooler Loans Launch"],
    ["2024-09-20", "Yield Repurchase Facility"],
    ["2024-10-01", "On-Chain Governance"],
    ["2024-11-20", "Emissions Manager Launch"],
    ["2025-01-15", "Cooler v2 Launch"],
    ["2025-12-01", "Convertible Deposits Launch"],
    ["2026-01-08", "CD Lending and Limit Orders"],
  ],
  methodology: "Total value held by treasury addresses and staking contracts excluding protocol-owned OHM and Protocol-Owned Liquidity. Cooler Loans debt is tracked by the dedicated cooler-loans adapter.",
  ethereum: {
    tvl: buildTvl('tvl'),
    staking: staking(OlympusStakings, [OHM, OHM_V1]),
    ownTokens: buildTvl('ownTokens'),
  },
  arbitrum: { tvl: buildTvl('tvl') },
  base: { tvl: buildTvl('tvl') },
  berachain: { tvl: buildTvl('tvl') },
  fantom: { tvl: buildTvl('tvl') },
};
