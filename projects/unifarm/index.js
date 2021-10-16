const sdk = require('@defillama/sdk')
const erc20Abi = require('./erc20.json')
const BigNumber = require('bignumber.js')

let ethereumToken = [
    '0xc3Eb2622190c57429aac3901808994443b64B466',
  '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
  '0x03042482d64577A7bdb282260e2eA4c8a89C064B',
  '0xFE3E6a25e6b192A42a44ecDDCd13796471735ACf',
  '0xf8C3527CC04340b208C854E985240c02F7B7793f',
  '0xd084B83C305daFD76AE3E1b4E1F1fe2eCcCb3988',
  '0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4',
  '0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5',
  '0x6e9730EcFfBed43fD876A264C982e254ef05a0DE',
  '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d',
  '0x50DE6856358Cc35f3A9a57eAAA34BD4cB707d2cd',
  '0x72F020f8f3E8fd9382705723Cd26380f8D0c66Bb',
  '0x8c8687fC965593DFb2F0b4EAeFD55E9D8df348df',
  '0x7eaF9C89037e4814DC0d9952Ac7F888C784548DB',
  '0xf7413489c474ca4399eee604716c72879eea3615',
  '0x657b83a0336561c8f64389a6f5ade675c04b0c3b',
  '0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54',
  '0xaf9f549774ecedbd0966c52f250acc548d3f36e5',
  '0x3c03b4ec9477809072ff9cc9292c9b25d4a8e6c6',
  '0xe4fa3c576c31696322e8d7165c5965d5a1f6a1a5',
  '0x40986a85b4cfcdb054a6cbfb1210194fee51af88',
  '0x67b6d479c7bb412c54e03dca8e1bc6740ce6b99c',
  '0x62dc4817588d53a056cbbd18231d91ffccd34b2a',
  '0x80ce3027a70e0a928d9268994e9b85d03bd4cdcf',
  '0x298d492e8c1d909d3f63bc4a36c66c64acb3d695',
  '0x28cca76f6e8ec81e4550ecd761f899110b060e97',
  '0x40821cd074dfecb1524286923bc69315075b5c89',
  '0x1de5e000c41c8d35b9f1f4985c23988f05831057',
  '0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac',
  '0xfc0d6cf33e38bce7ca7d89c0e292274031b7157a',
  '0xfd30c9bea1a952feeed2ef2c6b2ff8a8fc4aad07',
  '0xc8807f0f5ba3fa45ffbdc66928d71c5289249014',
  '0x92ec47df1aa167806dfa4916d9cfb99da6953b8f',
  '0x8A2279d4A90B6fe1C4B30fa660cC9f926797bAA2',
  '0x56a86d648c435dc707c8405b78e2ae8eb4e60ba4',
  '0xa1ed0364d53394209d61ae8bfdb8ff50484d8c91',
  '0xd9b312d77bc7bed9b9cecb56636300bed4fe5ce9',
  '0x993864e43caa7f7f12953ad6feb1d1ca635b875f',
  '0x89bd2e7e388fab44ae88bef4e1ad12b4f1e0911c',
  '0x1614f18fc94f47967a3fbe5ffcd46d4e7da3d787',
  '0xaf691508ba57d416f895e32a1616da1024e882d2',
  '0x8b39b70e39aa811b69365398e0aace9bee238aeb',
  '0x474021845c4643113458ea4414bdb7fb74a01a77',
  '0xe047705117Eb07e712C3d684f5B18E74577e83aC',
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x5F474906637bdCDA05f29C74653F6962bb0f8eDa'
]
let bscToken = [
    '0x9f998d62b81af019e3346af141f90cccd679825e',
  '0x5a41f637c3f7553dba6ddc2d3ca92641096577ea',
  '0x4131b87f74415190425ccd873048c708f8005823',
  '0x1a3057027032a1af433f6f596cab15271e4d8196',
  '0x40986a85b4cfcdb054a6cbfb1210194fee51af88',
  '0x965b0df5bda0e7a0649324d78f03d5f7f2de086a',
  '0x6fc13eace26590b80cccab1ba5d51890577d83b2',
  '0xfd004a476a395108eb1a6e960c962bd856e5b3c6',
  '0x6855f7bb6287f94ddcc8915e37e73a3c9fee5cf3',
  '0x658a109c5900bc6d2357c87549b651670e5b0539',
  '0xA4CB040B85e94F5c0C32ea1151B20D3aB40B3493',
  '0xe4fa3c576c31696322e8d7165c5965d5a1f6a1a5',
  '0xeaf7d8395cce52daef138d39a1cefa51b97c15ae',
  '0x22168882276e5d5e1da694343b41dd7726eeb288',
  '0x6d8734002fbffe1c86495e32c95f732fc77f6f2a',
  '0x16153214e683018d5aa318864c8e692b66e16778',
  '0x0e4b5ea0259eb3d66e6fcb7cc8785817f8490a53',
  '0x0A356f512f6fCE740111ee04Ab1699017a908680',
  '0x3fF2348e44d09f07017BCDaaCc4be575c0Ec467f',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  '0xdbb66eb9f4d737b49ae5cd4de25e6c8da8b034f9',
  '0x4a5a34212404f30c5ab7eb61b078fa4a55adc5a5',
  '0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16',
  '0x846F52020749715F02AEf25b5d1d65e48945649D',
  '0x559cd5b11ca882cedda823ac06275558a92b7064'
]

let polygonToken = [
    '0xa7305ae84519ff8be02484cda45834c4e7d13dd6',
  '0x438b28c5aa5f00a817b7def7ce2fb3d5d1970974',
  '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c',
  '0xa947239adc5d53aa03e5f661a2e16d7b009fc5a6',
  '0xd99bafe5031cc8b345cb2e8c80135991f12d7130',
  '0x34c1b299a74588d6abdc1b85a53345a48428a521',
  '0xfc5a11d0fe8b5ad23b8a643df5eae60b979ce1bf',
  '0xcb898b0efb084df14dd8e018da37b4d0f06ab26d'
]

const tokens = {

    //Ethereum
    '0xc3Eb2622190c57429aac3901808994443b64B466': 'ORO',
    '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0': 'MATIC',
    '0x03042482d64577A7bdb282260e2eA4c8a89C064B': 'CNTR',
    '0xFE3E6a25e6b192A42a44ecDDCd13796471735ACf': 'REEF',
    '0xf8C3527CC04340b208C854E985240c02F7B7793f': 'FRONT',
    '0xd084B83C305daFD76AE3E1b4E1F1fe2eCcCb3988': 'TVK',
    '0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4': 'ROUTE',
    '0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5': 'ZEE',
    '0x6e9730EcFfBed43fD876A264C982e254ef05a0DE': 'NORD',
    '0x3593D125a4f7849a1B059E64F4517A86Dd60c95d': 'OM',
    '0x50DE6856358Cc35f3A9a57eAAA34BD4cB707d2cd': 'RAZOR',
    '0x72F020f8f3E8fd9382705723Cd26380f8D0c66Bb': 'PLOT',
    '0x8c8687fC965593DFb2F0b4EAeFD55E9D8df348df': 'PAID',
    '0x7eaF9C89037e4814DC0d9952Ac7F888C784548DB': 'ROYA',
    '0xf7413489c474ca4399eee604716c72879eea3615': 'APYS',
    '0x657b83a0336561c8f64389a6f5ade675c04b0c3b': 'PCNT',
    '0xd9c2d319cd7e6177336b0a9c93c21cb48d84fb54': 'HAPI',
    '0xaf9f549774ecedbd0966c52f250acc548d3f36e5': 'RFuel',
    '0x3c03b4ec9477809072ff9cc9292c9b25d4a8e6c6': 'CVR',
    '0xe4fa3c576c31696322e8d7165c5965d5a1f6a1a5': 'GFX',
    '0x40986a85b4cfcdb054a6cbfb1210194fee51af88': 'UFARM',
    '0x67b6d479c7bb412c54e03dca8e1bc6740ce6b99c': 'KYL',
    '0x62dc4817588d53a056cbbd18231d91ffccd34b2a': 'DHV',
    '0x80ce3027a70e0a928d9268994e9b85d03bd4cdcf': 'LKR',
    '0x298d492e8c1d909d3f63bc4a36c66c64acb3d695': 'PBR',
    '0x28cca76f6e8ec81e4550ecd761f899110b060e97': 'ARGO',
    '0x40821cd074dfecb1524286923bc69315075b5c89': 'QUAI',
    '0x1de5e000c41c8d35b9f1f4985c23988f05831057': 'BNF',
    '0x5eaa69b29f99c84fe5de8200340b4e9b4ab38eac': 'RAZE',
    '0xfc0d6cf33e38bce7ca7d89c0e292274031b7157a': 'NTVRK',
    '0xfd30c9bea1a952feeed2ef2c6b2ff8a8fc4aad07': 'KALLY',
    '0xc8807f0f5ba3fa45ffbdc66928d71c5289249014': 'ISP',
    '0x92ec47df1aa167806dfa4916d9cfb99da6953b8f': 'IDV',
    '0x8A2279d4A90B6fe1C4B30fa660cC9f926797bAA2': 'CHR',
    '0x56a86d648c435dc707c8405b78e2ae8eb4e60ba4': 'STACK',
    '0xa1ed0364d53394209d61ae8bfdb8ff50484d8c91': 'TBC',
    '0xd9b312d77bc7bed9b9cecb56636300bed4fe5ce9': 'GAINS',
    '0x993864e43caa7f7f12953ad6feb1d1ca635b875f': 'SDAO',
    '0x89bd2e7e388fab44ae88bef4e1ad12b4f1e0911c': 'NUX',
    '0x1614f18fc94f47967a3fbe5ffcd46d4e7da3d787': 'PAID',
    '0xaf691508ba57d416f895e32a1616da1024e882d2': 'PNODE',
    '0x8b39b70e39aa811b69365398e0aace9bee238aeb': 'PKF',
    '0x474021845c4643113458ea4414bdb7fb74a01a77': 'UNO',
    '0xe047705117Eb07e712C3d684f5B18E74577e83aC': 'BCP',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0x5F474906637bdCDA05f29C74653F6962bb0f8eDa': 'DEFX',

    //BSC 
    '0x9f998d62b81af019e3346af141f90cccd679825e': 'ORO',
    '0x5a41f637c3f7553dba6ddc2d3ca92641096577ea': 'JulD',
    '0x4131b87f74415190425ccd873048c708f8005823': 'bMXX',
    '0x1a3057027032a1af433f6f596cab15271e4d8196': 'ROAD',
    '0x40986a85b4cfcdb054a6cbfb1210194fee51af88': 'UFARM',
    '0x965b0df5bda0e7a0649324d78f03d5f7f2de086a': 'COOK',
    '0x6fc13eace26590b80cccab1ba5d51890577d83b2': 'UMB',
    '0xfd004a476a395108eb1a6e960c962bd856e5b3c6': 'UDO',
    '0x6855f7bb6287f94ddcc8915e37e73a3c9fee5cf3': 'STACK',
    '0x658a109c5900bc6d2357c87549b651670e5b0539': 'FOR',
    '0xA4CB040B85e94F5c0C32ea1151B20D3aB40B3493': 'COLL',
    '0xe4fa3c576c31696322e8d7165c5965d5a1f6a1a5': 'GFX',
    '0xeaf7d8395cce52daef138d39a1cefa51b97c15ae': 'TBC',
    '0x22168882276e5d5e1da694343b41dd7726eeb288': 'WSB',
    '0x6d8734002fbffe1c86495e32c95f732fc77f6f2a': 'NUX',
    '0x16153214e683018d5aa318864c8e692b66e16778': 'PWAR',
    '0x0e4b5ea0259eb3d66e6fcb7cc8785817f8490a53': 'SOKU',
    '0x0A356f512f6fCE740111ee04Ab1699017a908680': 'UFARM',
    '0x3fF2348e44d09f07017BCDaaCc4be575c0Ec467f': 'ORO',
    '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
    '0xdbb66eb9f4d737b49ae5cd4de25e6c8da8b034f9': 'CANU',
    '0x4a5a34212404f30c5ab7eb61b078fa4a55adc5a5': 'MILK2',
    '0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16': 'SMG',
    '0x846F52020749715F02AEf25b5d1d65e48945649D': 'UMB',
    '0x559cd5b11ca882cedda823ac06275558a92b7064': 'UDO',

    // polygon
    '0xa7305ae84519ff8be02484cda45834c4e7d13dd6': 'UFARM',
    '0x438b28c5aa5f00a817b7def7ce2fb3d5d1970974': 'BLZ',
    '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 'ELK',
    '0xa947239adc5d53aa03e5f661a2e16d7b009fc5a6': 'RAZE',
    '0xd99bafe5031cc8b345cb2e8c80135991f12d7130': 'FRM',
    '0x34c1b299a74588d6abdc1b85a53345a48428a521': 'EZ',
    '0xfc5a11d0fe8b5ad23b8a643df5eae60b979ce1bf': 'WHIRL',
    '0xcb898b0efb084df14dd8e018da37b4d0f06ab26d': 'SING'
}

const addressToSymbol = (address) => {
    console.log(tokens[address])
    return tokens[address]
}

const _tvl = async (timestamp, ethBlock, chainBlocks, chain, targetAddress) => {
    const block = chainBlocks[chain];
    var tokens = [];

    if (chain==='ethereum') {
        tokens = ethereumToken
    } else if (chain === 'bsc') {
        tokens = bscToken
    } else {
        tokens = polygonToken
    }

    const multiCallResult = await sdk.api.abi.multiCall({
        calls: tokens.map((address) => ({
          target: address,
          params: [targetAddress],
        })),
        block,
        abi: erc20Abi[5],
        chain,
      })

    var results = await multiCallResult.output
    var result = results.filter(item => {
        return item.output !== '0' 
    })

    var objects = {};

    for ( i = 0; i < result.length; i++) {
        objects[result[i].input.target] = result[i].output
    }
    return objects
}

const arrayToObject = (array, chain) =>
   array.reduce((obj, item) => {
       for (const [rawKey, value] of Object.entries(item)) {
        //    const symbol = addressToSymbol(key)
        const key = chain + ':' + rawKey
           if (obj[key]) {
            const numbertoString = parseInt(value) + parseInt(obj[key])
            obj[key] = numbertoString.toLocaleString('fullwide', {useGrouping:false})
           } else {
            obj[key] = value
           }
       }
     return obj
   }, {})

const ethereum = async (timestamp, ethBlock, chainBlocks) => {
    let balance = []
    await Promise.all([
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xAf414C28FB7a33f736E5E55e102eB7954e95868C'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x0862eD7f6B2bc350508B29542511249b7E11A0a0'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x152A8d34c5C4540645443A63Bd8C1d395543BdC2'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x559CD5B11Ca882CEDda823Ac06275558A92b7064'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xab6FfA6A5D5589378A21dbb30dF2940E0320d1Cd'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xfc0962c00efa1a1d7c51e68f7de865119219cec9'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x50E90d8E1c012A98fB4bA3246447f27035A8780A'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x4460788bc43dab5f4e530ec9dfa1dd8c483f188c'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xC364572a61b05Ce0095F5Ca91F762eBeF7ab9494'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x80d0540c7971922bde062e434ad7618bc2ac50bb'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x3d41675d0e5b610cfea98998129780753bd664b5'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xc2b00a388bf9eb2b02e0230d3afe0e16788196ce'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x53fe82a7334c6f3683d5b39f49f0f7be19823a64'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x6fd0bbf295965db381f1d5b353ff3e523c771dd6'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x1c14eb2f2bf443557fc131b3f6f4e929c0081346'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x32d72d6cc98436ef983be7f5288ab2ca63480fe4'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xd5f119145bdf66998f3c33ae0fe529ad546c67f5'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xa1f28581129f27c11ee0c6c421a4fbf29c3e9bc7'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x1f8a2a32fE05736e1f85f5E37a4F83E652a8206a'),
        // proxy
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xd23499e0Dc02C35d47D5284c85Cf4917D2454d2F'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x2c09B8eA4606247Bf5AEC77B063c894334C6d205'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xAf414C28FB7a33f736E5E55e102eB7954e95868C'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xe4Be53c29c852e474ffdBE5555dE64BF143B613E'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0xC364572a61b05Ce0095F5Ca91F762eBeF7ab9494'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x50572512c65DbC570634926309BF61fB19C2364c'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x920a203e0C9F55d747F6b7Ea76ff96715725335a'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x0F525981710E9d627f880D1e04C1F432317c84FF'),
        _tvl(timestamp, ethBlock, chainBlocks, 'ethereum', '0x4d1cEC3f30aD9b1a7f69e510016a5D790cFA6fC0')
    ]).then((values)=> {balance = values})
    return arrayToObject(balance, 'ethereum')
}

const bsc = async (timestamp, ethBlock, chainBlocks) => {
    let balance = []

    await Promise.all([
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0xeE32c30C1fAa0364d3022B6Ca2456363DadAF71b'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x207c678457617bc8c8ab06f9088efc1dcd45887c'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x8Fd3298c3981Df23a94DDaa4b1325c7087661568'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0xfd70c4a2280731fa7c63ee720d8da58898322ab7'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x69B63a145597F39Ed1703f6aeEB2B832BB92f670'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x33038f836d1edc7021534d0c7eeb84d58e3327a6'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x349d55f12fb166a926214ca0195a07a16fa4ccb1'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x6d57d0f3549dd22513c98eee1a9b1bdeabeeb555'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0xD746eE9a18F0E8F37D151229c123A980f2b5dBcF'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x02e5de0ae2fc71e79dbd9e81c39edaca06ff4de2'),
        // proxy
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0xd23499e0Dc02C35d47D5284c85Cf4917D2454d2F'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x2c09B8eA4606247Bf5AEC77B063c894334C6d205'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0xAf414C28FB7a33f736E5E55e102eB7954e95868C'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x50572512c65DbC570634926309BF61fB19C2364c'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0xe4Be53c29c852e474ffdBE5555dE64BF143B613E'),
        _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x920a203e0C9F55d747F6b7Ea76ff96715725335a')
    ]).then((values)=> {balance = values})
    return arrayToObject(balance, 'bsc')
}

const polygon = async (timestamp, ethBlock, chainBlocks) => {
    let balance = []
    await Promise.all([
        _tvl(timestamp, ethBlock, chainBlocks, 'polygon', '0xee32c30c1faa0364d3022b6ca2456363dadaf71b'),
        _tvl(timestamp, ethBlock, chainBlocks, 'polygon', '0x207c678457617bc8c8ab06f9088efc1dcd45887c')
    ]).then((values)=> {balance = values})
    return arrayToObject(balance, 'polygon')
}

module.exports = {
    ethereum: {
        tvl: ethereum
    },
    bsc: {
        tvl: bsc
    },
    polygon: {
        tvl: polygon
    },
}