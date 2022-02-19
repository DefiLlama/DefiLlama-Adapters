const { getBlock } = require("../helper/getBlock")
const { chainExports } = require("../helper/exports")
const sdk = require('@defillama/sdk')
const { sumTokens } = require("../helper/unwrapLPs")
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');
const { getProvider } = require("@defillama/sdk/build/general")
const { chainToCoingeckoId } = require("@defillama/sdk/build/computeTVL")

if (!getProvider("astar")) {
    config.setProvider("astar", new ethers.providers.StaticJsonRpcProvider(
        "https://rpc.astar.network:8545",
        {
            name: "astar",
            chainId: 592,
        }
    ))
}

const bridgeContractV1 = "0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"

// Bridge and token contract addresses are taken from https://cbridge-docs.celer.network/reference/contract-addresses
const liquidityBridgeContractsV2 = {
    // NOTE: Some chains have addresses before and after the liquidity bridge upgrade / migration
    ethereum: ["0xc578Cbaf5a411dFa9F0D227F97DaDAa4074aD062", "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    bsc: ["0x5d96d4287D1ff115eE50faC0526cf43eCf79bFc6", "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF"],
    arbitrum: ["0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF", "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca"],
    polygon: ["0xa251c4691C1ffd7d9b128874C023427513D8Ac5C", "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"],
    avax: ["0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573", "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4"],
    fantom: ["0x3795C36e7D12A8c252A20C5a7B455f7c57b60283", "0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF"],
    optimism: ["0x6De33698e9e9b787e09d3Bd7771ef63557E148bb", "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401"],
    boba: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    harmony: ["0x78a21C1D3ED53A82d4247b9Ee5bF001f4620Ceec"],
    moonbeam: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    moonriver: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    celo: ["0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573"],
    metis: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    aurora: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    xdai: ["0x3795C36e7D12A8c252A20C5a7B455f7c57b60283"],
    okexchain: ["0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98"],
    heco: ["0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573"],
    oasis: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    astar: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    shiden: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"],
    syscoin: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C"]
}

const peggedVaultContracts = {
    ethereum: ["0xB37D31b2A74029B5951a2778F959282E2D518595"],
    boba: ["0x8db213bE5268a2b8B78Af08468ff1EA422073Da0"],
    celo: ["0xD9d1034ef3d21221F008C7e96346CA999966752C"],
    polygon: ["0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA"],
    bsc: ["0x78bc5Ee9F11d133A08b331C2e18fE81BE0Ed02DC"],
    avax: ["0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820"],
    fantom: ["0x7D91603E79EA89149BAf73C9038c51669D8F03E9"],
    arbitrum: ["0xFe31bFc4f7C9b69246a6dc0087D91a91Cb040f76"],
    heco: ["0x5d96d4287D1ff115eE50faC0526cf43eCf79bFc6"],
    shiden: ["0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573"],
    syscoin: ["0x1E6b1ceAF75936f153ABB7B65FBa57AbaE14e6CE"],
    optimism: ["0xbCfeF6Bb4597e724D720735d32A9249E0640aA11"]
}

const tokens = [{
    // USDT
    ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    bsc: "0x55d398326f99059ff775485246999027b3197955",
    arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    xdai: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
    okexchain: "0x382bb369d343125bfb2117af9c149795c6c65c50",
    avax: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    optimism: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
    fantom: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    heco: "0xa71edc38d189767582c38a3145b5873052c3e47a",
    moonbeam: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
    moonriver: "0xb74527786818aE18B69B6A823960bfAF3906182F",
    astar: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
    oasis: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
    celo: "0xB0d8cF9560EF31B8Fe6D9727708D19b31F7C90Dc",
    syscoin: "0x6de33698e9e9b787e09d3bd7771ef63557e148bb",
    aurora: "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
}, {
    // USDC
    ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    bsc: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    arbitrum: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    xdai: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
    okexchain: "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85",
    avax: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    optimism: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
    fantom: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    heco: "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b",
    moonbeam: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    moonriver: "0x693B47a7fC3d33AE9eBec15e5F42f2dB480066f3",
    astar: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    oasis: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
    celo: "0x48421FF1c6B93988138130865C4B7Cce10358271",
    syscoin: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    aurora: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
}, {
    // BUSD
    ethereum: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    bsc: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    moonbeam: "0xCb4A7569a61300C50Cf80A2be16329AD9F5F8F9e",
    astar: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
}, {
    // DAI
    ethereum: "0x6b175474e89094c44da98b954eedeac495271d0f",
    bsc: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    polygon: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    avax: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    optimism: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    astar: "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb",
    oasis: "0x5a4Ba16C2AeB295822A95280A7c7149E87769E6A",
    syscoin: "0x8D982783040e3ccC0C04cC7B88B9637ce7286C50",
}, {
    // WETH
    ethereum: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    bsc: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    arbitrum: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    polygon: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    avax: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    fantom: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
    optimism: "0x4200000000000000000000000000000000000006",
    moonbeam: "0x6959027f7850Adf4916ff5Fdc898d958819E5375",
    moonriver: "0xf6a939e773fa4A63fd53f86bbbB279CaAD955035",
    astar: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
    oasis: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    celo: "0x1FBD282fdcF0C6FA9c77Eb61f95535dE3CCB8B78",
    syscoin: "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c",
}, {
    // WBTC
    ethereum: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    arbitrum: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    polygon: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    avax: "0x50b7545627a5162F82A992c33b87aDc75187B218",
    fantom: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
    moonbeam: "0x8a4B4C2aCAdeAa7206Df96F00052e41d74a015CE",
    astar: "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
    metis: "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4",
    syscoin: "0x86c28C9a6f2DC3C156AA2ad450F0F9d3A5Dec12e",
}, {
    // DODO
    ethereum: "0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd",
    bsc: "0x67ee3cb086f8a16f34bee3ca72fad36f7db929e2",
    arbitrum: "0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581",
    moonriver: "0xE9460BD2FFB12b668fA32919C785C239f974D37C",
}, {
    // MCB
    ethereum: "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42",
    arbitrum: "0x4e352cf164e64adcbad318c3a1e222e9eba4ce42",
}, {
    // CELR
    ethereum: "0x4f9254c83eb525f9fcf346490bbb3ed28a81c667",
    bsc: "0x1f9f6a696c6fd109cd3956f45dc709d2b3902163",
    arbitrum: "0x3a8B787f78D775AECFEEa15706D4221B40F345AB",
    metis: "0x516e6D96896Aea92cE5e78B0348FD997F13802ad",
    moonbeam: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
}, {
    // IF
    ethereum: "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
    bsc: "0xb0e1fc65c1a741b4662b813eb787d369b8614af1",
}, {
    // LYRA
    ethereum: "0x01ba67aac7f75f647d94220cc98fb30fcc5105bf",
    optimism: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
}, {
    // IMX
    ethereum: "0x7b35ce522cb72e4077baeb96cb923a5529764a00",
    arbitrum: "0x9c67ee39e3c4954396b9142010653f17257dd39c",
    polygon: "0x60bb3d364b765c497c8ce50ae0ae3f0882c5bd05",
    avax: "0xeA6887e4a9CdA1B77E70129E5Fba830CdB5cdDef",
    harmony: "0xbd8064cdb96c00a73540922504f989c64b7b8b96",
    moonriver: "0x900f1Ec5819FA087d368877cD03B265Bf1802667",
}, {
    // DOMI
    ethereum: "0x45C2F8c9B4c0bDC76200448cc26C48ab6ffef83F",
    bsc: "0xBBCA42c60b5290F2c48871A596492F93fF0Ddc82",
    avax: "0xFc6Da929c031162841370af240dEc19099861d3B",
}, {
    // PEOPLE
    ethereum: "0x7a58c0be72be218b41c608b7fe7c5bb630736c71",
    bsc: "0x1305b25842778041c4ae0c9e7C264A617c619FD4",
    avax: "0xcdA140dE9873E8F912f12c864Be786442DE8a818",
    fantom: "0xb74527786818aE18B69B6A823960bfAF3906182F",
    harmony: "0x63B0B80ee068D3CF46392c34025FA13a1F3B3F80",
    moonriver: "0x31d95c7fc6b5520B4BdCD78Efa689dD1CCa5741E",
    celo: "0xCb4A7569a61300C50Cf80A2be16329AD9F5F8F9e",
    metis: "0x4a63Afc71427807586dA190Bb0D3adB461fF9589",
    okexchain: "0xA354846BB4379E581F47814928073778Ed03d48A",
    xdai: "0x8db213bE5268a2b8B78Af08468ff1EA422073Da0",
    heco: "0x3bbaDFf9aeee4a74D3Cf6da05C30868C9Ff85BB8",
}, {
    // SOS
    ethereum: "0x3b484b82567a09e2588a13d54d032153f0c0aee0",
    bsc: "0xBcC128D5221b518e50a1823d374310bDF404f867",
    avax: "0x63B0B80ee068D3CF46392c34025FA13a1F3B3F80",
    fantom: "0xAB0C1da69e383edB087D09b1eFD333321e5d6493",
    harmony: "0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820",
    moonriver: "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
    celo: "0xa8961Be06550c09C1bC14c483F3932B969eFf5E0",
    metis: "0x5d96d4287D1ff115eE50faC0526cf43eCf79bFc6",
    okexchain: "0x8db213bE5268a2b8B78Af08468ff1EA422073Da0",
    xdai: "0xD606367757BC5E35F53e616EA50F3103Ef6b8498",
    heco: "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401",
}, {
    // BOBA
    ethereum: "0x42bbfa2e77757c645eeaad1655e0911a7553efbc",
    boba: "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7",
}, {
    // OLO
    boba: "0x5008F837883EA9a07271a1b5eB0658404F5a9610",
    ethereum: "0xBaDE2a874e27b5B0920DA93EfE6845036C6fb5A4",
    bsc: "0xa4918c50aadBa9EDCaf302562739c1b1C1367AA9",
}, {
    // XTK
    ethereum: "0x7f3edcdd180dbe4819bd98fee8929b5cedb3adeb",
    arbitrum: "0xF0A5717Ec0883eE56438932b0fe4A20822735fBa",
}, {
    // xXTKa
    ethereum: "0x314022E24ceD941781DC295682634B37Bd0d9cFc",
    arbitrum: "0xd8083e393985530b7cf6798d44a2f1536e211ab6",
}, {
    // METIS
    ethereum: "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e",
    metis: "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
}, {
    // CVP
    ethereum: "0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1",
    bsc: "0x5ec3adbdae549dce842e24480eb2434769e22b2e",
}, {
    // CEC
    ethereum: "0x9e564eb5550E1A9b1448D916fd85a8d876661bdC",
    bsc: "0x957c49a76b3e008637ca1cce23188a8ce884911e",
}, {
    // STND
    ethereum: "0x9040e237c3bf18347bb00957dc22167d0f2b999d",
    metis: "0xc12caC7090baa48Ec750CceeC57C80768F6ee58E",
}, {
    // WOO
    ethereum: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
    bsc: "0x4691937a7508860f876c9c0a2a617e7d9e945d4b",
    arbitrum: "0xcafcd85d8ca7ad1e1c6f82f651fa15e33aefd07b",
    polygon: "0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603",
    avax: "0xabc9547b534519ff73921b1fba6e672b5f58d083",
    fantom: "0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a",
}, {
    // DF
    ethereum: "0x431ad2ff6a9c365805ebad47ee021148d6f7dbe0",
    bsc: "0x4a9a2b2b04549c3927dd2c9668a5ef3fca473623",
    arbitrum: "0xaE6aab43C4f3E0cea4Ab83752C278f8dEbabA689",
    optimism: "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3",
}, {
    // USX
    ethereum: "0x0a5e677a6a24b2f1a2bf4f3bffc443231d2fdec8",
    bsc: "0xb5102cee1528ce2c760893034a4603663495fd72",
    arbitrum: "0x641441c631e2F909700d2f41FD87F0aA6A6b4EDb",
    optimism: "0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9",
}, {
    // PERP
    ethereum: "0xbc396689893d065f41bc2c6ecbee5e0085233447",
    bsc: "0x4e7f408be2d4e9d60f49a64b89bb619c84c7c6f5",
    arbitrum: "0x753d224bcf9aafacd81558c32341416df61d3dac",
    optimism: "0x9e1028f5f1d5ede59748ffcee5532509976840e0",
}, {
    // KROM
    ethereum: "0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789",
    arbitrum: "0x55ff62567f09906a85183b866df84bf599a4bf70",
    polygon: "0x14Af1F2f02DCcB1e43402339099A05a5E363b83c",
    optimism: "0xf98dcd95217e15e05d8638da4c91125e59590b07",
}, {
    // TCR
    ethereum: "0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050",
    arbitrum: "0xa72159fc390f0e3c6d415e658264c7c4051e9b87",
}, {
    // PERL
    ethereum: "0xeca82185adce47f39c684352b0439f030f860318",
    bsc: "0x0f9e4d49f25de22c2202af916b681fbb3790497b",
}, {
    // BMI
    ethereum: "0x725c263e32c72ddc3a19bea12c5a0479a81ee688",
    bsc: "0x3e1b4Ff4AE3Ab8f0Cb40a34a6ad3fC817F7dA2b6",
    polygon: "0x3e1b4Ff4AE3Ab8f0Cb40a34a6ad3fC817F7dA2b6",
}, {
    // oneDODO
    ethereum: "0xcA37530E7c5968627BE470081d1C993eb1dEaf90",
    bsc: "0x2C30B4cB4b3001afa5b8c43c5a7CA548067562A0",
}, {
    // cUSD
    celo: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    bsc: "0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB",
}, {
    // WSYS
    syscoin: "0xd3e822f3ef011Ca5f17D82C956D952D8d7C3A1BB",
    ethereum: "0xF3C96924d85566C031ddc48DbC63B2d71da6D0f6",
    bsc: "0x6822A778726CD2f0d4A1Cfaca2D04654e575cC82",
}, {
    // PSP
    ethereum: "0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5",
    bsc: "0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5",
}, {
    // WXT
    ethereum: "0xa02120696c7b8fe16c09c749e4598819b2b0e915",
    avax: "0xfcDe4A87b8b6FA58326BB462882f1778158B02F1",
    polygon: "0xBBCA42c60b5290F2c48871A596492F93fF0Ddc82",
}, {
    // PKEX
    ethereum: "0xe6f143a0e0a8f24f6294ce3432ea10fad0206920",
    astar: "0x1fE622E91e54D6AD00B01917351Ea6081426764A",
    shiden: "0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98",
}, {
    // ZLK
    moonriver: "0x0f47ba9d9bde3442b42175e51d6a367928a1173b",
    moonbeam: "0x3fd9b6c9a24e09f67b7b706d72864aebb439100c",
}, {
    // FRAX
    ethereum: "0x853d955acef822db058eb8505911ed77f175b99e",
    bsc: "0xB5df797468E6e8f2Cb293Cd6e32939366e0F8733",
    polygon: "0x5427fefa711eff984124bfbb1ab6fbf5e3da1820",
    avax: "0x693B47a7fC3d33AE9eBec15e5F42f2dB480066f3",
    fantom: "0xB0d8cF9560EF31B8Fe6D9727708D19b31F7C90Dc",
    arbitrum: "0x330066cf308Cea289f74585e85fA001048E8A5C0",
    harmony: "0xa8961Be06550c09C1bC14c483F3932B969eFf5E0",
    boba: "0xB0d8cF9560EF31B8Fe6D9727708D19b31F7C90Dc",
    moonriver: "0x8c75adB1D9f38F6C2AF54BE8120F598b9dba446C",
    aurora: "0x22953AF8b73f4f876FC09e836a14a1f64B209FEF",
    optimism: "0xea129aE043C4cB73DcB241AAA074F9E667641BA0",
    moonbeam: "0xC5Ef662b833De914B9bA7a3532C6BB008a9b23a6",
},  {
    // FXS
    ethereum: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
    bsc: "0xFC27e5d3fBdFcE33fE3226d368b75E59e9CdcA7E",
    polygon: "0x2a98d03d1a593f0f3e0aa7c17b24fca68302051e",
    avax: "0xdb84EA36FcddfE5febae7da8b2806EffE9C8B353",
    fantom: "0x153A59d48AcEAbedbDCf7a13F67Ae52b434B810B",
    arbitrum: "0x1215107d442d70D43DC5EAd1Bfd2268525015c4f",
    harmony: "0x194Ad4574808D3E840221BeedF2209dfBc10b6ea",
    boba: "0x5803457E3074E727FA7F9aED60454bf2F127853b",
    moonriver: "0xC1d6E421a062Fdbb26C31Db4a2113dF0F678CD04",
    aurora: "0xAB0C1da69e383edB087D09b1eFD333321e5d6493",
    optimism: "0x1619DE6B6B20eD217a58d00f37B9d47C7663feca",
    moonbeam: "0x54f2980A851376CcBC561Ab4631dF2556Ad03386",
}, {
    // MAI
    polygon: "0xa3fa99a148fa48d14ed51d610c367c61876997f1",
    avax: "0x61f85fF2a2f4289Be4bb9B72Fc7010B3142B5f41",
    harmony: "0x6fa10d3052372118e976948184abacab569209ee",
    moonriver: "0x48421FF1c6B93988138130865C4B7Cce10358271",
}, {
    // ATL
    bsc: "0x1fD991fb6c3102873ba68a4e6e6a87B3a5c10271",
    polygon: "0xb98e169C37ce30Dd47Fdad1f9726Fb832191e60b",
    avax: "0x90fBE9dfe76F6EF971c7A297641dfa397099a13e",
}, {
    // BNB
    bsc: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    aurora: "0xc6bc09a723F2314ad22642B6e33AD2ed6BbA3C9C",
    oasis: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
    astar: "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52",
    syscoin: "0xc6bc09a723F2314ad22642B6e33AD2ed6BbA3C9C",
}, {
    // AVAX
    avax: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    aurora: "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4",
    oasis: "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb",
}, {
    // FTM
    fantom: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    oasis: "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52",
    aurora: "0x1fE622E91e54D6AD00B01917351Ea6081426764A",
}, {
    // AMY
    arbitrum: "0x8fbd420956fdd301f4493500fd0bcaaa80f2389c",
    oasis: "0x78a21C1D3ED53A82d4247b9Ee5bF001f4620Ceec",
    ethereum: "0x30a667dF8562a2460F45AC297D833a36FEaC0C2F",
}, {
    // GHX
    ethereum: "0x728f30fa2f100742c7949d1961804fa8e0b1387d",
    bsc: "0xbd7B8e4de08D9b01938F7FF2058F110ee1E0E8d4",
}, {
    // SAFLE
    polygon: "0x04b33078ea1aef29bf3fb29c6ab7b200c58ea126",
    ethereum: "0x3f95E5099CF3A125145212Afd53039B8d8C5656e",
    bsc: "0x73afC23510b40dcbEABc25fFBc8C2976eD9f950c",
}, {
    // WREVA
    bsc: "0xec81aa154d470c6857219b529de3f1d755ee2ae7",
    ethereum: "0xeb883d9478af15c2C176030849D8Fa31169b63b9",
    polygon: "0x4A52b891eC0670f547BEDAc5959cA3e9FDEd4849",
    fantom: "0x66acEA0f41656711f58FF840c8857e3E5356F64F",
    avax: "0xa4918c50aadBa9EDCaf302562739c1b1C1367AA9",
    arbitrum: "0x746Ba48fC973596d0077573BDa6185cA3BB9c3dC",
}, {
    // MARK
    heco: "0x779a8134750809F79Cf0Ba48ee0fF1A5c41a8fDC",
    okexchain: "0x1fE622E91e54D6AD00B01917351Ea6081426764A",
}, {
    // PLATO
    heco: "0x4668e0E7cC545De886aBF038067F81cD4DC0924b",
    okexchain: "0xC5Ef662b833De914B9bA7a3532C6BB008a9b23a6",
}, {
    // SDN
    shiden: "0x0f933dc137d21ca519ae4c7e93f87a4c8ef365ef",
    astar: "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4",
}, {
    // CONV
    ethereum: "0xc834fa996fa3bec7aad3693af486ae53d8aa8b50",
    moonbeam: "0x8006320739fC281da67Ee62eB9b4Ef8ADD5C903a",
}, {
    // TSD
    avax: "0x4fbf0429599460d327bd5f55625e30e4fc066095",
    ethereum: "0x212137aDFABbC3525f73183022a403c70c4E8ae6",
    bsc: "0xF8bFeac18A838acE22110e499922623D54ea26DA",
}, {
    // MATIC
    polygon: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    astar: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
}, {
    // AAVE
    ethereum: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    astar: "0xfcDe4A87b8b6FA58326BB462882f1778158B02F1",
}, {
    // CRV
    ethereum: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    astar: "0x7756a83563f0f56937A6FdF668E7D9F387c0D199",
}, {
    // AVG
    ethereum: "0xa41f142b6eb2b164f8164cae0716892ce02f311f",
    bsc: "0x19aa65f85a70eC127edd8A63B1932d1F63FcCB3A",
}, {
    // AELIN
    optimism: "0x61baadcf22d2565b0f471b291c475db5555e0b76",
    ethereum: "0xa9C125BF4C8bB26f299c00969532B66732b1F758",
}]

// Some tokens have different decimals on certain chains.
const chainsWithDifferentDecimals = ['bsc', 'okexchain', 'heco']
const tokensWithDifferentDecimals = [
    // USDT
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // USDC
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
]
// Some tokens don't have Ethereum address registered on Coingecko.
const tokensUsingNonEthereumAddress = {
    // USX
    '0x0a5e677a6a24b2f1a2bf4f3bffc443231d2fdec8': 'bsc'
}

function chainTvl(chain) {
    return async (time, ethBlock, chainBlocks) => {
        const block = await getBlock(time, chain, chainBlocks, true)
        const balances = {}
        await Promise.all(tokens.map(async token => {
            if (token[chain] === undefined) {
                return
            }
            let balanceV1
            balanceV1 = await sdk.api.erc20.balanceOf({
                chain,
                block: block,
                target: token[chain],
                owner: bridgeContractV1
            })
            let tokenAddress
            // Use the Ethereum address if possible.
            // Also do special handling for tokens with different decimals on some chains.
            if ((!token.ethereum ||
                    (tokensWithDifferentDecimals.includes(token.ethereum) &&
                        chainsWithDifferentDecimals.includes(chain))) &&
                chainToCoingeckoId[chain]) {
                tokenAddress = chain + ':' + token[chain]
            } else if (tokensUsingNonEthereumAddress[token.ethereum]) {
                // Use the address on a specific chain
                const chainToUse  = tokensUsingNonEthereumAddress[token.ethereum]
                tokenAddress = chainToUse + ':' + token[chainToUse]
            } else {
                tokenAddress = token.ethereum
            }
            sdk.util.sumSingleBalance(balances, tokenAddress, balanceV1.output)
            if (liquidityBridgeContractsV2[chain] !== undefined) {
                await sumTokens(balances, liquidityBridgeContractsV2[chain].map(b=>[token[chain], b]), block, chain, ()=>tokenAddress)
            }
            if (peggedVaultContracts[chain] !== undefined) {
                await sumTokens(balances, peggedVaultContracts[chain].map(b=>[token[chain], b]), block, chain, ()=>tokenAddress)
            }
        }))
        return balances
    }
}

const chains = tokens.reduce((allChains, token) => {
    Object.keys(token).forEach(chain => allChains.add(chain))
    return allChains
}, new Set())

module.exports = chainExports(chainTvl, Array.from(chains))
