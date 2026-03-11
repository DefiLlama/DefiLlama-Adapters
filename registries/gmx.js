const { gmxExports, gmxExportsV2 } = require('../projects/helper/gmx')
const { buildProtocolExports } = require('./utils')

function gmxExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (typeof config === 'string') {
      // Simple vault address string
      result[chain] = { tvl: gmxExports({ vault: config }) }
    } else if (config.eventEmitter) {
      // gmxExportsV2 style
      result[chain] = { tvl: gmxExportsV2(config) }
    } else if (config.vault) {
      // gmxExports with options
      result[chain] = { tvl: gmxExports(config) }
    }
  })
  return result
}

const configs = {
  // === Simple gmxExports (v1) - TVL only ===
  '10kdex': {
    scroll: '0x2C145157e59CfB69a4607643D178B015E6A3004a',
  },
  'basetrade': {
    base: '0x3a384968A2fea56d0394F9B349ab8D0c839ddc04',
  },
  'beamex': {
    moonbeam: '0x73197B461eA369b36d5ee96A1C9f090Ef512be21',
  },
  'covo-finance': {
    polygon: '0x22F688efeFB9c158De4FD62F2C9c08BF79542030',
  },
  'dpex': {
    polygon: '0x24AfB3B27156E71e68e292E4aD71Db827F83f05C',
  },
  'equity': {
    fantom: '0x0Fb84ADB9c16D28b92c09c382CaadbDdD8e354c4',
  },
  'gplx': {
    hallmarks: [
      ['2023-06-21', 'Token supply compromise'],
      ['2023-08-24', 'Protocol relauch'],
    ],
    pulse: '0x4a305E6F8724Cb5F0106C8CdC90e9C6CA6429083',
  },
  'grizzly-trade': {
    bsc: '0x606E4922b259fe28c10e6731e8317705AA1e253B',
  },
  'kkex': {
    zklink: '0xC8F6494bD11A12Dd6B676EC87C8b878a1D90e641',
  },
  'lemonX': {
    core: '0xC2acC8e5Be6613f53C71AE5E386D39a40a4761aA',
  },
  'lexer-markets': {
    arbitrum: '0x355a5a46b27d849d75f65e7766dc1f00faa0be88',
  },
  'lif3-trade': {
    fantom: '0x58e3018B9991aBB9075776537f192669D69cA930',
    bsc: '0x089Bd994241db63a5dc5C256481d1722B23EF8d0',
  },
  'loxodrome-perp': {
    iotex: '0x13904291B7d3e87d23070d22Bc34FA514F99Db18',
  },
  'madmex': {
    polygon: '0xE990519F19DCc6c1589A544C331c4Ec046593e7A',
  },
  'modemax-perp-v2': {
    mode: '0xc3d266Af004B2556f2f900e88e9C73Ac42978AE6',
  },
  'nex': {
    aurora: '0x5827094484b93989D1B75b12a57989f49e3b88B0',
    optimism: '0x5827094484b93989D1B75b12a57989f49e3b88B0',
  },
  'omt-finance': {
    onus: '0x9a10B55FdE534e7809345D9DE0191a2b01E2F399',
  },
  'omnidex-perpetuals': {
    telos: '0x8F23134EBc390856E01993dE9f7F837bcD93014a',
  },
  'openworld': {
    arbitrum: '0xec45801399EB38B75A3bf793051b00bb64fF3eF8',
  },
  'opx': {
    optimism: '0xb94C36A74c8504Dea839C119aeaF2e615364253F',
  },
  'phame': {
    pulse: '0x3dC4033fF5c04FdE3369937434961ca47AC7cA26',
  },
  'PRINT3R': {
    base: '0x102B73Ca761F5DFB59918f62604b54aeB2fB0b3E',
    mode: '0x3901B2e6d966dA5772A634a632bccCc83DC5Cf4C',
  },
  'quickswap-perps': {
    polygon_zkevm: '0x99b31498b0a1dae01fc3433e3cb60f095340935c',
  },
  'rollup-fi': {
    era: '0xefdE2AeFE307A7362C7E0E3BE019D1491Dc7E163',
  },
  'satoshi-perps': {
    core: '0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207',
  },
  'shrike-perps': {
    polygon_zkevm: '0x3371195e36f45cBDc6cC0EF9e94d87AC8424621D',
  },
  'swapbased-perp': {
    base: '0x210b49f74040A385840a3276E81bA9010954d064',
  },
  'synthswap-perps': {
    base: '0xB70cf5E6eCd1733448912A9f251D35A17aF94fF6',
  },
  'taraperps': {
    tara: '0xCCA1234b65FF576572E6D278aE6cacfF6989D93D',
  },
  'volta-markets': {
    core: '0x66249e4477940D40A3CE92552401A9Cc61a14474',
  },
  'yyex': {
    btr: '0x16Aa605Ca2cBE921AAC6C4838c1109b3cf9d444F',
  },

  // === gmxExports (v1) with staking ===
  'amped': {
    start: '2024-06-06',
    lightlink_phoenix: {
      vault: '0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb',
      staking: ['0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0', '0xca7F14F14d975bEFfEe190Cd3cD232a3a988Ab9C'],
    },
    bsc: {
      vault: '0xdcFaaf6f3bb71B270404992853588BE9B7fc89EA',
      staking: ['0x9fe50b66fc34cA06BbC684fF13242d61c860F190', '0x16DF3d8978d17fE725Dc307aD14FdE3B12E6Da75'],
    },
    sonic: {
      vault: '0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da',
      staking: ['0xE8b485031343D7F38d59C92fA25805A4e72C6a4a', '0x4Cae73a23078e7A94D1e828Fa3bABa5080c04FcA'],
    },
    berachain: {
      vault: '0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48',
      staking: ['0xE65668F745F546F061b4fC925A31Cb1F6512c32A', '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4'],
    },
    base: {
      vault: '0xed33E4767B8d68bd7F64c429Ce4989686426a926',
      staking: ['0x9e45B1f3983e5BD6480C39f57F876df0eda8EA74', '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4'],
    },
    sseed: {
      vault: '0x7f27Ce4B02b51Ea3a433eD130259F8A173F7c6C7',
      staking: ['0x5ac57B6034590E53fC214Dd31E30b7C7D9D627C9', '0x9951bC662dFA91DE9a893d68055B6f086669b025'],
    },
  },
  'baymax': {
    avax: {
      vault: '0x6De10cA248723Ea0B8c2dC72920C3B2bB417dAb4',
      staking: ['0x42526FaAf9400c08DA7CE713388eed29273d65dE', '0x18706c65b12595EDB43643214EacDb4F618DD166'],
    },
  },
  'bfx': {
    bsc: {
      vault: '0xDDC99EE89f9556749e8e8916eEa5d3bBA8D6F13d',
      staking: ['0x0F0b54d7446110210513295336E4A85dDA65e40D', '0x491347561CEc563aD7D91135F92dBdC700277505'],
    },
  },
  'bluespade': {
    cronos: {
      vault: '0x26e5FbFbfd38a27D5777C9C9CC5543e687E637D8',
      staking: ['0xbCCE1c2efDED06ee73183f8B20f03e452EF8495D', '0x1542bA4CA0fb6D1B4476a933B292002fd1959A52'],
    },
    polygon: {
      vault: '0xd6f70237f501891C3E1634544F36E026250c2D3F',
      staking: ['0xb710f0D97023340eB3faBC4259FEAdf3bBeDdf05', '0x759d34685468604c695De301ad11A9418e2f1038'],
    },
  },
  'bmx': {
    methodology: 'BMX Classic liquidity is calculated by the value of tokens in the BLT/MLT pool. TVL also includes BMX staked.',
    base: {
      vault: '0xec8d8D4b215727f3476FF0ab41c406FA99b4272C',
      staking: ['0x3085F25Cbb5F34531229077BAAC20B9ef2AE85CB', '0x548f93779fBC992010C07467cBaf329DD5F059B7'],
    },
    sonic: '0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF',
    mode: {
      vault: '0xff745bdB76AfCBa9d3ACdCd71664D4250Ef1ae49',
      staking: ['0x773F34397d5F378D993F498Ee646FFe4184E00A3', '0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb'],
    },
  },
  'cadence-protocol': {
    hallmarks: [
      ['2024-02-28', 'Cadence Perpetuals Launch'],
    ],
    canto: {
      vault: '0xbB975222F04C1992A39A27b19261646FD6547919',
      staking: ['0x05FA19c543aAA066EC7F67526b1c0a4fa3b9fEEE', '0x8F20150205165C31D9b29C55a7B01F4911396306'],
    },
  },
  'cranium': {
    fantom: {
      vault: '0x76cA86C73CE0F03eac0052C4FC5eacdb10D9663f',
      staking: ['0x2b402AeDd4ccC193DC2A50c281Fb8945ddaD9760', '0xfa5992A8A47aF7029e04eC6a95203AD3f301460b'],
    },
  },
  'damx': {
    fantom: {
      vault: '0xD093eeE7c968CEef2df96cA9949eba1a1A9b2306',
      staking: ['0xECef79f974182f4E9c168E751101F23686Bdc6dF', '0x0Ec581b1f76EE71FB9FEefd058E0eCf90EBAb63E'],
    },
  },
  'flux-exchange': {
    fantom: {
      vault: '0xc050733A325eEe50E544AcCbD38F6DACEd60ea6D',
      staking: ['0x136F1bD4Bb930cD931Ed30310142c2f03a946AC0', '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'],
    },
    era: {
      vault: '0x09Aa1138dfdfF855Df18DDAf08e92186D213700e',
      staking: ['0xFae2784FaE4D47316B487Bc0087a7C78D4809753', '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'],
    },
  },
  'golden-finance': {
    zeta: {
      vault: '0xea8bC5EF6327f666823AefC56Cd2afe47cD2d0d7',
    },
  },
  'gmx': {
    hallmarks: [
      ['2022-01-07', 'Avalanche GMX Launch'],
    ],
    arbitrum: {
      vault: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
      staking: ['0x908C4D94D34924765f1eDc22A1DD098397c59dD4', '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a'],
    },
    avax: {
      vault: '0x9ab2De34A33fB459b538c43f251eB825645e8595',
      staking: ['0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342', '0x62edc0692BD897D2295872a9FFCac5425011c661'],
    },
  },
  'ktx': {
    bsc: {
      vault: '0xd98b46C6c4D3DBc6a9Cc965F385BDDDf7a660856',
      staking: ['0x5d1459517ab9FfD60f8aDECdD497ac94DD62d3FD', '0x545356d4d69d8cD1213Ee7e339867574738751CA'],
    },
    mantle: {
      vault: '0x2e488D7ED78171793FA91fAd5352Be423A50Dae1',
      staking: ['0x1D29411f42bEd70d1567B4B6B4638Ee46Bae7146', '0x779f4E5fB773E17Bc8E809F4ef1aBb140861159a'],
    },
    arbitrum: {
      vault: '0xc657A1440d266dD21ec3c299A8B9098065f663Bb',
      staking: ['0xC7011480CEa31218cb18b9ADbEF7d78Fc684C935', '0x487f6baB6DEC7815dcd7Dfa2C44a8a17bd3dEd27'],
    },
  },
  'meridian-trade': {
    base: {
      vault: '0x853a8cE6B6338f5B0A14BCfc97F9D68396099C9C',
      blacklistedTokens: ['0x5e06ea564efcb3158a85dbf0b9e017cb003ff56f'],
    },
    meter: '0x95cd3F1DE20A29B473FcC1773069316a424c746D',
  },
  'minerva': {
    optimism: {
      vault: '0x7EF6f8abAc00689e057C9ec14E34aC232255a2fb',
      staking: ['0x21563764f5641ffcb89f25560644e39947b21be0', '0xE4d8701C69b3B94A620ff048e4226C895b67b2c0'],
    },
  },
  'mirakle': {
    hallmarks: [
      ['2023-08-03', 'Mirakle Launch'],
    ],
    fuse: {
      vault: '0x2EB12e4B1057ef2d0C300C41493B599B028dB00f',
      staking: ['0x8F7bCecC354037Bcf63DB11A336dA5d49b1316d8', '0x4b9aE621E54BF1ecFe39366BCA0018d97A2D510b'],
    },
  },
  'morphex-old': {
    methodology: 'Morphex liquidity is calculated by the value of tokens in the MLP pool. TVL also includes MPX staked.',
    fantom: {
      vault: '0x3CB54f0eB62C371065D739A34a775CC16f46563e',
      staking: ['0xa4157E273D88ff16B3d8Df68894e1fd809DbC007', '0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb'],
    },
  },
  'mycelium': {
    methodology: 'We count liquidity in Perpetual Swaps based on the value of tokens in the MLP pool.',
    arbitrum: {
      vault: '0xDfbA8AD57d2c62F61F0a60B2C508bCdeb182f855',
      staking: ['0xF9B003Ee160dA9677115Ad3c5bd6BB6dADcB2F93', '0xC74fE4c715510Ec2F8C61d70D397B32043F55Abe'],
    },
  },
  'nether-fi': {
    base: {
      vault: '0xAd378C374f7996235E927e693eDea32605C0A61F',
      staking: ['0x6ffC50886775D4A26AF1B0f88F9df61267e69aec', '0x60359A0DD148B18d5cF1Ddf8Aa1916221ED0cbCd'],
    },
  },
  'palmswap': {
    bsc: {
      vault: '0x0cD6709ba5972eDc64414fd2aeC7F8a891718dDa',
      permitFailure: true,
      staking: ['0x53ce47f3a148Fcb1F96E1Bf6F0a47D041D8d3788', '0x29745314B4D294B7C77cDB411B8AAa95923aae38'],
    },
  },
  'realperp': {
    manta: {
      vault: '0xEA5C751039e38e1d2C0b8983D4F024e3bc928bc4',
      staking: ['0x10e878aDbCbD35e4356F5272Ae9537814d17A76c', '0x9576ca6D15E7CcCe184fA7523085d21A554B1b52'],
    },
  },
  'sobax-io': {
    polygon: {
      vault: '0x0e1D69B5888a0411Fe0A05a5A4d2ACED4305f67c',
      staking: ['0xa326cF15E65FDEA84E63506ed56c122bC9E9A4BE', '0x0709E962221dd8AC9eC5c56f85ef789D3C1b9776'],
    },
    zeta: {
      vault: '0x0523f9FCa4c42A205dA7d57E9E7E65EeEE990d64',
      staking: ['0xb1ADD1d94Bc7f05C5AefCFCA2558AD0ae49D269b', '0xb36377f643f67e5f9775f62b624e8907c214de3c'],
    },
  },
  'spacedex-io': {
    hallmarks: [
      ['2023-03-09', 'BSC SpaceDex Launch'],
      ['2023-04-03', 'Arbitrum SpaceDex Launch'],
    ],
    arbitrum: {
      vault: '0xA2D4719b29991271F3a6f06C757Ce31C6731491E',
      staking: ['0xdb3aE24F01E8a0AF40CEd355B7262BbdbFdF715A', '0xA822CfD3AcbC0eB1a1Aba073B3355aCaF756ef7F'],
    },
    bsc: {
      vault: '0x24Ed2bf2c1E76C621164d93B73debD10cdC4BBD0',
      staking: ['0x7B8f0a523E8B929EB854749096e1b032189e0f26', '0x37D39950f9C753d62529DbF68fCb4DCa4004fBFd'],
    },
  },
  'syrupfinance': {
    hallmarks: [
      ['2023-02-01', 'Rug Pull'],
    ],
    bsc: {
      vault: '0x47E3d600C6A58f262Bc6C0159D2C9cA75aaE12D0',
      staking: ['0x024CcD75EF4f772a3431e444c42Ee99452Afca01', '0xdef49c195099e30e41b2df7dad55e0bbbe60a0c5'],
    },
  },
  'tethys-perpetual': {
    metis: {
      vault: '0xD2032462fd8A45C4BE8F5b90DE25eE3631ec1c2C',
      staking: ['0xA3c1694EfCd4389Ce652D521d2be28c912250a53', '0x69fdb77064ec5c84FA2F21072973eB28441F43F3'],
    },
  },
  'zkdx-finance': {
    era: {
      vault: '0xBC918775C20959332c503d51a9251C2405d9cF88',
      staking: ['0xA258D1CfeCaDD96C763dfa50284525f1529cfB35', '0x7b3e1236c39ddD2e61cF6Da6ac6D11193238ccB0'],
    },
    metis: '0x79C365bA484CBa73F3e9cB04186ddCc0DEBFB00c',
    telos: '0x17D3FdF3b017C96782dE322A286c03106C75C62E',
  },

  // === gmxExports (v1) with pool2 ===
  'voodoo-trade': {
    fantom: {
      vault: '0x40cbDDAED8b0d7Ee3cF347aAb09Bf4a8cFa15F01',
      pool2: ['0xBf47b011C36F29e7C65b6cf34c1d838EA1b67069', '0xC42437A6da389D88799A9e706da3EA6628342295'],
    },
  },
  'voodoo-trade-base': {
    base: {
      vault: '0x4F188Afdc40e6D2Ddddf5fd1b2DF7AEF7Da52f50',
      pool2: ['0x1DD46Dd21F152f97848b32D504de491E696bA1C5', '0xbF65A2775F0a091a8e667a1c1345c427C9D86761'],
    },
  },

  // === gmxExports (v1) with blacklistedTokens only ===
  'handlefi-fxpreps': {
    misrepresentedTokens: true,
    arbitrum: {
      vault: '0x1785e8491e7e9d771b2A6E9E389c25265F06326A',
      blacklistedTokens: [
        '0x7E141940932E3D13bfa54B224cb4a16510519308',
        '0x3d147cD9aC957B2a5F968dE9d1c6B9d0872286a0',
        '0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F',
        '0x116172B2482c5dC3E6f445C16Ac13367aC3FCd35',
        '0xF4E8BA79d058fFf263Fd043Ef50e1010c1BdF991',
        '0x2C29daAce6Aa05e3b65743EFd61f8A2C448302a3',
        '0x8C414cB8A9Af9F7B03673e93DF73c23C1aa05b4e',
        '0x398B09b68AEC6C58e28aDe6147dAC2EcC6789737',
        '0x1AE27D9068DaDf10f611367332D162d184ed3414',
        '0x95e0e6230e9E965A4f12eDe5BA8238Aa04a85Bc6',
        '0x55a90F0eB223f3B2C0C0759F375734C48220decB',
      ],
    },
  },

  // === gmxExportsV2 ===
  'gmx-v2': {
    arbitrum: {
      eventEmitter: '0xc8ee91a54287db53897056e12d9819156d3822fb',
      fromBlock: 107737756,
    },
    avax: {
      eventEmitter: '0xDb17B211c34240B014ab6d61d4A31FA0C0e20c26',
      fromBlock: 32162455,
    },
    btnx: {
      eventEmitter: '0xAf2E131d483cedE068e21a9228aD91E623a989C2',
      fromBlock: 117906,
    },
  },
  'modemax-perp': {
    mode: {
      eventEmitter: '0xd63352120c45378682d705f42a9F085E79E3c888',
      fromBlock: 25655,
    },
  },
  'nlx': {
    core: {
      eventEmitter: '0x29792F84224c77e2c672213c4d942fE280D596ef',
      fromBlock: 13558258,
    },
  },
}

module.exports = buildProtocolExports(configs, gmxExportFn)
