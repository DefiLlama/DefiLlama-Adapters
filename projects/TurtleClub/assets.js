const ADDRESSES = require('../helper/coreAssets.json');
const { defaultTokens } = require('../helper/cex');

// Gnosis Safe multisigs
const treasuryMultisigs = [
    '0x5b38d8094e896FF29DB9889516bf053f5Cf59f60', // Outbound payments
    '0xB6301976f04E6A58D6E57Ff04144A31D911D3a25', // Inbound payments
    '0x58A916AD66584811C939AA844025036e5078E811', // DeFi Farming
    '0x3F3Ac8C6e85c8659e0af4f4B6ed50f51A1A8e0B1', // Main Ethereum
    '0x184BF40166092A213FA3fEee0ac91dAcd554E2E0', // Old Ethereum
    '0xc033B96f8A66787420b780fF2C6af75E89F4464b', // Old Avalanche and Mantle
    '0x1feE198A3D28B2419bf0Ab4BBbd6cC8f75368216', // Old Linea
    '0x41FC0479A3E67Ac6d26760D1205dC523abee8b94', // Old Mode
    '0x0EFeE436D77258217956Ea3fA0E639e306D74992', // Old Base
    '0xa00991F9Aa65a54dBDE368385771C5613A024693', // Old Blast
];

const tokens = {
    ethereum: {
        USDC: ADDRESSES.ethereum.USDC,
        USDT: ADDRESSES.ethereum.USDT,
        ETH: ADDRESSES.null,
        DRV: '0x4f3D0b8C2E5A7F1c6B9d4e8a2e5b8c3f3f3f3f3f',
        SILO: '0x6f80310CA7F2C654691D1383149Fa1A57d8AB1f8',
        IPOR: '0x1e4746dC744503b53b4A082cB3607B169a289090',
        FXN: ADDRESSES.ethereum.FXN,
        LVVA: '0x6243558a24CC6116aBE751f27E6d7Ede50ABFC76',
        USDO: '0x375eA8da180EBb6F5adaA6090FA0aE31346E62bf',
        sUSDS: ADDRESSES.ethereum.sUSDS,
        rEUL: '0xf3e621395fc714B90dA337AA9108771597b4E696',
        EUL: '0xd9Fcd98c322942075A5C3860693e9f4f03AAE07b',
        ezREZ: '0x77B1183e730275f6A8024Ce53d54bcC12B368f60',
        REZ: '0x3B50805453023a91a8bf641e279401a0b23FA6F9',
        USUALX: '0x06B964d96f5dCF7Eae9d7C559B09EDCe244d4B8E',
        USD0: '0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5',
        ynETH: '0x09db87A538BD693E9d08544577d5cCfAA6373A48',
        aEthUSDT: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a',
        rsWETH: '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0',
        SWELL: '0x0a6E7Ba5042B38349e437ec6Db6214AEC7B35676',
        TERM: '0xC3d21f79C3120A4fFda7A535f8005a7c297799bF',
        GEAR: '0xBa3335588D9403515223F109EdC4eB7269a9Ab5D',
        Symbiotic: '0x21DbBA985eEA6ba7F27534a72CCB292eBA1D2c7c', // DC_ETHFI
        wstETH: ADDRESSES.ethereum.WSTETH,
        WETH: ADDRESSES.ethereum.WETH,
        stETH: ADDRESSES.ethereum.STETH,
        cbBTC: ADDRESSES.ethereum.cbBTC,
        FBTC: '0xc96de26018a54d51c097160568752c4e3bd6c364',
        tsSwellRswETH: '0xd4c9AA3FFDDc3EeE1d624849872EA3Eae2529972', // TODO not priced properly
        aEthUSDC: '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c',
        eUSDC_2: '0x797DD80692c3b2dAdabCe8e30C07fDE5307D48a9',
        gtUSDC: '0xdd0f28e19C1780eb6396170735D45153D261490d',
    },
    arbitrum: {
        USDC: ADDRESSES.arbitrum.USDC,
        USDT: ADDRESSES.arbitrum.USDT,
        WETH: ADDRESSES.arbitrum.WETH,
        RAM: '0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418',
        Silo: '0x0341C0C0ec423328621788d4854119B97f44E391',
        SYO: '0x577Fd586c9E6BA7f2E85E025D5824DBE19896656',
        WBTC: ADDRESSES.arbitrum.WBTC,
        ARB: ADDRESSES.arbitrum.ARB,
        'USD₮0': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    avax: {
        USDC: ADDRESSES.avax.USDC,
        USDt: ADDRESSES.avax.USDt,
        WETH_e: ADDRESSES.avax.WETH_e,
        BTC_b: ADDRESSES.avax.BTC_b,
        WAVAX: ADDRESSES.avax.WAVAX,
        PHAR: '0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b',
        BLUB: '0x0f669808d88B2b0b3D23214DCD2a1cc6A8B1B5cd',
        HEFE: '0x18E3605B13F10016901eAC609b9E188CF7c18973',
        GoGoPool: '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3',
        Benqi: ADDRESSES.avax.SAVAX,
    },
    mantle: {
        USDC: ADDRESSES.mantle.USDC,
        USDT: ADDRESSES.mantle.USDT,
        WETH: ADDRESSES.mantle.WETH,
        mETH: ADDRESSES.mantle.mETH,
        cmETH: ADDRESSES.mantle.cmETH,
        WMNT: ADDRESSES.mantle.WMNT,
        abcCLEO: '0xCffbE0E73c750731EdB38C14Bc81A39dAc91819d',
        CLEO: '0xC1E0C8C30F251A07a894609616580ad2CEb547F2',
    },
    linea: {
        USDC: ADDRESSES.linea.USDC,
        USDT: ADDRESSES.linea.USDT,
        ETH: ADDRESSES.null,
        WETH: ADDRESSES.linea.WETH,
        ZERO: '0x78354f8DcCB269a615A7e0a24f9B0718FDC3C7A7',
        oLYNX: '0x63349ba5e1f71252ecd56e8f950d1a518b400b60',
        LYNX: '0x1a51b19CE03dbE0Cb44C1528E34a7EDD7771E9Af',
        NILE: '0xAAAac83751090C6ea42379626435f805DDF54DC8',
        CAKE: '0x0D1E753a25eBda689453309112904807625bEFBe',
        WBTC: '0x3aAB2285ddcDdaD8edf438C1bAB47e1a9D05a9b4',
        FOXY: '0x5FBDF89403270a1846F5ae7D113A989F850d1566',
        CROAK: '0xaCb54d07cA167934F57F829BeE2cC665e1A5ebEF',
        z0weETH: '0x77E305B4D4D3b9DA4e82Cefd564F5b948366A44b', // TODO all ZeroLend not priced properly
        z0WETH: '0xB4FFEf15daf4C02787bC5332580b838cE39805f5',
        z0ezETH: '0x0684FC172a0B8e6A65cF4684eDb2082272fe9050',
        z0rsETH: '0x8d8b70a576113FEEdd7E3810cE61f5E243B01264',
        z0USDT: '0x508C39Cd02736535d5cB85f3925218E5e0e8F07A',
    },
    mode: {
        ION: '0x18470019bF0E94611f15852F7e93cf5D65BC34CA',
        MODE: '0xdfc7c877a950e49d2610114102175a06c2e3167a',
        ICL: '0x95177295A394f2b9B04545FFf58f4aF0673E839d',
    },
    base: {
        WETH: ADDRESSES.base.WETH,
        USDC: ADDRESSES.base.USDC,
        AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
        USDT: ADDRESSES.base.USDT,
        SKYA: '0x623cD3a3EdF080057892aaF8D773Bbb7A5C9b6e9',
        ETH: ADDRESSES.null,
    },
    scroll: {
        USDT: ADDRESSES.scroll.USDT,
        WETH: ADDRESSES.scroll.WETH,
        NURI: '0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769',
        SCR: '0xd29687c813D741E2F938F4aC377128810E217b1b',
    },
    swellchain: {
        SWELL: ADDRESSES.swellchain.SWELL,
        tsSwellETH: '0x7fE118Bee84900fAED30dAb9ecFbeAD633392f05', // TODO not priced properly
    },
    blast: {
        HYPER: '0xEC73284E4EC9bcea1A7DDDf489eAA324C3F7dd31',
    },
    polygon: {
        DEFI: '0x18c3eb88c972390120Bb4AbD2F705c48f62E212C',
    },
    berachain: {
        rEUL: '0x56C44d2F484A61ce92Fa0BCc849feB37aBfeB59C', // TODO not priced properly, no balances either
        EUL: '0xEb9b5f4EB023aE754fF59A04c9C038D58606DAC6',
    }
};

const exceptions = {
    ethereum: [
        { token: tokens.ethereum.rEUL, use: tokens.ethereum.EUL },
        { token: tokens.ethereum.ezREZ, use: tokens.ethereum.REZ }, // TODO ezREZ not priced properly
        // { token: tokens.ethereum.tsSwellRswETH, use: ADDRESSES.null },
        { token: tokens.ethereum.eUSDC_2, use: tokens.ethereum.USDC },
    ],
    linea: [
        { token: tokens.linea.oLYNX, use: tokens.linea.LYNX },
        // { token: tokens.linea.z0WETH, use: tokens.linea.ETH },
        // { token: tokens.linea.z0ezETH, use: tokens.linea.ETH },
        // { token: tokens.linea.z0rsETH, use: tokens.linea.ETH },
        // { token: tokens.linea.z0weETH, use: tokens.linea.ETH },
        // { token: tokens.linea.z0USDT, use: tokens.linea.USDT },
    ],
    swellchain: [
        // { token: tokens.swellchain.tsSwellETH, use: ADDRESSES.null }, // TODO not priced properly
    ],
};

const treasuryNFTs = {
    avax: [
        { name: 'PHAR', veNft: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', baseToken: tokens.avax.PHAR, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // Pharaoh Exchange - vePHAR
        { name: 'PHAR', veNft: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', baseToken: tokens.avax.PHAR, owner: '0xB6301976f04E6A58D6E57Ff04144A31D911D3a25' }, // Pharaoh Exchange - vePHAR
    ],
    linea: [
        { name: 'NILE', veNft: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', baseToken: tokens.linea.NILE, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // NILE - veNILE
        { name: 'Lynex', veNft: '0x8D95f56b0Bac46e8ac1d3A3F12FB1E5BC39b4c0c', baseToken: tokens.linea.LYNX, owner: '0x58A916AD66584811C939AA844025036e5078E811', useLocked: false }, // veLYNX
        { name: 'Lynex', veNft: '0x8D95f56b0Bac46e8ac1d3A3F12FB1E5BC39b4c0c', baseToken: tokens.linea.LYNX, owner: '0x1feE198A3D28B2419bf0Ab4BBbd6cC8f75368216', useLocked: false }, // veLYNX
        // { name: '', veNft: '0x398f0a3e303Afd3cAe2b602D6bBe01b1C1AF4749', baseToken: '??', owner: '0x1feE198A3D28B2419bf0Ab4BBbd6cC8f75368216' }, // WIZ
    ],
    arbitrum: [
        { name: 'RAMSES', veNft: '0xAAA343032aA79eE9a6897Dab03bef967c3289a06', baseToken: tokens.arbitrum.RAM, owner: '0xB6301976f04E6A58D6E57Ff04144A31D911D3a25' }, // RAMSES - veNFT
        { name: 'RAMSES', veNft: '0xAAA343032aA79eE9a6897Dab03bef967c3289a06', baseToken: tokens.arbitrum.RAM, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // RAMSES - veNFT
        // { name: '', veNft: '0x33545b31c30dffe3164dadf8b10a80a72307ee36', baseToken: tokens.arbitrum.RAM, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // $ARB AIRDROP?
        // { name: '', veNft: '0xf2a20438704a424b22bd6d71a87772ce9deec3be', baseToken: tokens.arbitrum.RAM, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // $ARB AIRDROP?
    ],
    mantle: [
        { name: 'Cleopatra', veNft: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', baseToken: tokens.mantle.CLEO, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // Cleopatra - veCLEO
        { name: 'Cleopatra', veNft: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', baseToken: tokens.mantle.CLEO, owner: '0xB6301976f04E6A58D6E57Ff04144A31D911D3a25' }, // Cleopatra - veCLEO
    ],
    scroll: [
        { name: 'NURI', veNft: '0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F', baseToken: tokens.scroll.NURI, owner: '0x58A916AD66584811C939AA844025036e5078E811' }, // NURI - veNURI
    ],
    mode: [
        // { name: 'MODE', veNft: '0x06ab1Dc3c330E9CeA4fDF0C7C6F6Fb6442A4273C', baseToken: tokens.mode.MODE, owner: '0x41FC0479A3E67Ac6d26760D1205dC523abee8b94', useLocked: false },
    ]
};

const vaultContracts = [
    '0x294eecec65A0142e84AEdfD8eB2FBEA8c9a9fbad', // tacETH
    '0x6Bf340dB729d82af1F6443A0Ea0d79647b1c3DDf', // tacBTC
    '0x699e04F98dE2Fc395a7dcBf36B48EC837A976490', // tacUSD
];

module.exports = {
    defaultTokens,
    tokens,
    treasuryMultisigs,
    exceptions,
    treasuryNFTs,
    vaultContracts,
};
