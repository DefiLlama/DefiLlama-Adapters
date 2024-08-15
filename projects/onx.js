
const { staking } = require('./helper/staking')
const ADDRESSES = require('./helper/coreAssets.json')


const config = {
  polygon: { vaults: [
    //dualMaticUsdc
    ['0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827', '0x36D14424Cc5a18893e93A0f8FdD42DC40562887E'],
    //dualMaticEth
    ['0xadbf1854e5883eb8aa7baf50705338739e558e5b', '0xfe51dE20719d05152Ace63a069446Bb5C89511DB'],
    //dualMaticUsdt
    ['0x604229c960e5cacf2aaeac8be68ac07ba9df81c3', '0x067E7586Eb8733bF108167C15cBAbee4c629C37A'],
    //dualMaticQuick
    ['0x019ba0325f1988213d448b3472fa1cf8d07618d7', '0x849031F78970639F8Dc9Dc3E962e0d0079D1051c'],
    //EthUsdc
    ['0x853ee4b2a13f8a742d64c8f088be7ba2131f670d', '0x185A1cfdb7173b224d08E61F1Cb21Fd5Fd6ee8CD'],
    //wBtcEth
    ['0xdc9232e2df177d7a12fdff6ecbab114e2231198d', '0xf1ba3ef65262ee4058462e65a3a09a7571193400'],
    //ethUsdt
    ['0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046', '0x353856185fBB65a098b971B6d492CC3c245D9a59'],
    //quickEth
    ['0x1bd06b96dd42ada85fdd0795f3b4a79db914add5', '0x9767218525A443AE1B04A2a84Cf2f6D646C2fA06'],
    //aaveEth
    ['0x90bc3e68ba8393a3bf2d79309365089975341a43', '0xbB760a23924a23e5270c659349c753d16e7C1078'],
    //ethDai
    ['0x4a35582a710e1f4b2030a3f826da20bfb6703c09', '0x0d553115D2c1E2b734d66De1Eba4BAe1a88cB175'],
    //wbtcUsdc
    ['0xf6a637525402643b0654a54bead2cb9a83c8b498', '0x248Eecc8286A8C6484B4A87e1F32f0bc2d7971D4'],
    //linkEth
    ['0x5ca6ca6c3709e1e6cfe74a50cf6b2b6ba2dadd67', '0x58bC3B5949C6784819A606645d616D8D2dA7594B'],
    //usdcQuick
    ['0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb', '0x7E9dA60002dAF64778C78Ac90dD5bdc9391acb00'],
    //usdcUsdt
    ['0x2cf7252e74036d1da831d11089d326296e64a728', '0x1a130be9a0E9046936E5461D3e8727b6aF7d0C2C'],
    //avaxMatic
    ['0xeb477ae74774b697b5d515ef8ca09e24fee413b5', '0x8D20fB2F4F96E897Fed7E3E50f8A403aFc59dA23'],
    //solMatic
    ['0x898386dd8756779a4ba4f1462891b92dd76b78ef', '0x0A1EfAF7dd833F9D8EF9f2f095bf1d6C725FF110'],
    //bnbUsdc
    ['0x40a5df3e37152d4daf279e0450289af76472b02e', '0x43bE6849BC355735D77238AcfDBcEB7bE8673f02'],
    //ftmMatic
    ['0xd2b61a42d3790533fedc2829951a65120624034a', '0xF020de990036D5aE107860592Bde0E53892F1531'],
    //daiUsdc
    ['0xf04adbf75cdfc5ed26eea4bbbb991db002036bdd', '0x260e6fB68C787CdA2E9ea104f9e3a3923E4119f6'],
    //daiUsdt
    ['0x59153f27eefe07e5ece4f9304ebba1da6f53ca88', '0x32B750721Ad93f62b21402526354d53ac46953C2'],
  ] },
  avax: { vaults: [
    //usdcAvax
    ['0xa389f9430876455c36478deea9769b7ca4e3ddb1', '0x8025d4deDa0C7512d44438a7DC597612B4108F07'],
    //wethAvax
    ['0xfe15c2695f1f920da45c30aae47d11de51007af9', '0xf7AcA362510b327bDAca693611353b6a837cBDB2'],
    //avaxUsdte
    ['0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256', '0x897Fb124aCdF5A685d9258645ffee0058464817A'],
    //joeAvax [not available]
    ['0x454e67025631c065d3cfad6d71e6892f74487a15', '0x02e9bc3EF29A3f51EdE6e4c4F70fdcb894CD6Cf5'],
    //wBtcAvax
    ['0xd5a37dc5c9a396a03dd1136fc76a1a02b1c88ffa', '0x8922E41342C6160fAf4dC40f2c1fCFCd94E98779'],
    //linkAvax
    ['0x6f3a0c89f611ef5dc9d96650324ac633d02265d3', '0x55F42961b3aD4E2A08f1780C7434dd8EC5f7FcE4'],
    //joeUsdce
    ['0x67926d973cd8ee876ad210faaf7dffa99e414acf', '0xD9F63Cc588822cD3eF802D900808E946d13CE609'],
    //bnbAvax
    ['0xeb8eb6300c53c3addbb7382ff6c6fbc4165b0742', '0x4decafaCD4591e52f85e8FE69F82F2400176BB33'],
    //joeUsdte
    ['0x1643de2efb8e35374d796297a9f95f64c082a8ce', '0xfD127Bc3b6153b043fFD8d7f38272593700b124c'],
    // //spellAvax [not available]
    ['0x62cf16bf2bc053e7102e2ac1dee5029b94008d99', '0x9eE877279DFE8e5F20614db88e50CD72B4efDEAD'],
    // //xavaAvax [not available]
    ['0x72c3438cf1c915ecf5d9f17a6ed346b273d5bf71', '0x54720637Fa477eD87Cd06F674247a649A5168eB6'],
    //linkeUsdce
    ['0xb9f425bc9af072a91c423e31e9eb7e04f226b39d', '0x62CA6F1640776070ECa70E09d9AF27352a43a5D8'],
    //wethUsdce
    ['0x199fb78019a08af2cb6a078409d0c8233eba8a0c', '0x2C858E3181988f2E4458f14768aE204E5BF2Ee0e'],
    //pefiAvax [not available]
    ['0xb78c8238bd907c42be45aebdb4a8c8a5d7b49755', '0x276F74C24Cc4443Ecb4967Db77572BE50aeD4117'],
    //wbtceAvax
    ['0x62475f52add016a06b398aa3b2c2f2e540d36859', '0x008E6bf114D686713dC233487e360A158433e519'],
    //aaveAvax
    ['0xc3e6d9f7a3a5e3e223356383c7c055ee3f26a34f', '0xE7c34e1946A10a3A28BEd4B0Cb5B7F0d85F5368D'],
    //qiAvax
    ['0x2774516897ac629ad3ed9dcac7e375dda78412b9', '0x0240269d999301d03aAe390104584F7517f52ECd'],
    // //avaxBoo [not available]
    ['0xebf50b8089a0c5e7c5de23f644fcd723818f65b3', '0xB4a805Ad532BB92501507C9eAc27FD0BAe4d68A1'],
    // //maiAvax [not available]
    ['0x23ddca8de11eccd8000263f008a92e10dc1f21e8', '0x2071fD6779B701aa71c4a48b8f37970160e5FE75'],
    // //h20Avax [not available]
    ['0x9615a11eaa912eae869e9c1097df263fc3e105f3', '0x6b42A98af10C2E94a6951c94b8Ac5B5EEB23c8AF'],
  ] },
  fantom: { vaults: [
    //xBoo
    ['0x841fad6eae12c286d1fd18d1d525dffa75c7effe', '0x95d0d6A7D75A5b086d2823C38F6Dd80a50fD0d93',],
    //BooFtm
    ['0xec7178f4c41f346b2721907f5cf7628e388a7a58', '0x62CA6F1640776070ECa70E09d9AF27352a43a5D8'],
    //UsdcFtm
    ['0x2b4c76d0dc16be1c31d4c1dc53bf9b45987fc75c', '0x6b42A98af10C2E94a6951c94b8Ac5B5EEB23c8AF'],
    //fUsdtFtm
    ['0x5965E53aa80a0bcF1CD6dbDd72e6A9b2AA047410', '0xC033338F7605B1555b1d3FC2a3626b2b76a0E042'],
    //DaiFtm
    ['0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428', '0xf1Ba3EF65262ee4058462E65A3A09a7571193400'],
    //btc
    ['0xFdb9Ab8B9513Ad9E419Cf19530feE49d412C3Ee3', '0x0f16CBDaF6c8115cDde59876cF232903E95D488A'],
    //eth
    ['0xf0702249F4D3A25cD3DED7859a165693685Ab577', '0x7396241a8a45E6252A2b5bBB571CBdfF599E16F1'],
    //link
    ['0x89d9bC2F2d091CfBFc31e333D6Dc555dDBc2fd29', '0x8D20fB2F4F96E897Fed7E3E50f8A403aFc59dA23'],
    //aave
    ['0xeBF374bB21D83Cf010cC7363918776aDF6FF2BF6', '0xE663F7d6AFB3A3Ef458D5c4a068E29368a46Eb87'],
    //sushi
    ['0xf84E313B36E86315af7a06ff26C8b20e9EB443C3', '0x32B750721Ad93f62b21402526354d53ac46953C2'],
    //crv
    ['0xB471Ac6eF617e952b84C6a9fF5de65A9da96C93B', '0x424B1AE0AF693d4577dde25081E970cb656013C7'],
    //bnb
    ['0x956DE13EA0FA5b577E4097Be837BF4aC80005820', '0x1fA1B8D94B922e3C9821f66363a75237c36096af'],
    //any
    ['0x5c021D9cfaD40aaFC57786b409A9ce571de375b4', '0xE41718b549B935358A2f62acbD289F3dcccABB18'],
    //mim
    ['0x6f86e65b255c9111109d2D2325ca2dFc82456efc', '0xfB271303B157d2e3d91CF86C7956eb46180d62E5'],
    //yfi
    ['0x0845c0bFe75691B1e21b24351aAc581a7FB6b7Df', '0x4CddFEf40f13F16520b7f98f269f772560A8fb9a'],
    //btcEth
    ['0xEc454EdA10accdD66209C57aF8C12924556F3aBD', '0x58bC3B5949C6784819A606645d616D8D2dA7594B'],
    //spell
    ['0x78f82c16992932EfDd18d93f889141CcF326DBc2', '0x4aFa2C780d0d2b139886A532d1D1959f4D316ee7'],
    //joe
    ['0xd518737Ff601c2A7C67F55EbbEb0a4e3fF5C0C35', '0xbE0093F744287Ea0478cc75c6320043a8b79E845'],
  ] },
}

async function tvl(api) {
  const { vaults } = config[api.chain]
  const pools = vaults.map(i => i[1])
  const tokens = vaults.map(i => i[0])
  const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: pools })
  api.addTokens(tokens, bals)
}

const tokenAddresses = {
  onx: "0xe0ad1806fd3e7edf6ff52fdb822432e847411033",
  sOnx: "0xa99f0ad2a539b2867fcfea47f7e71f240940b47c",
  onxFarm: "0x168f8469ac17dd39cd9a2c2ead647f814a488ce9",
  onxTripleFarm: "0x30D1A19EA928cCf46634cBC2944D2D89Be636f22",
  onxWethSushiPair: "0x62f22A47e5D2F8b71cC44fD85863753618312f67",
  pool: "0x47F3E6C1Ef0cBe69502167095b592e61de108BaA",
  aethToken: "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb",
  onsToken: "0xfC97C0c12438B6E4CF246cD831b02FeF4950DCAD",
  oneVault: "0x3BdF1977d87EDAD8e0617efCEa958F6d43A4C30E",
  onePools: [
      '0x54c532E367031F56c401C6024aC4ABEfF2b03534',
      '0xbc2346C3c7F3998A12A1c8E7Be44734EcC832763',
      '0xe64796FCc97c33A2193Ba60f013F3fA5D4712d56',
      '0xe659fA84e0C687760245046BA63329d44320997c',
      '0x19Eb6536777713aCdAcA8dd9A3AD9843D74E9E3b',
      '0x1B72255a11DF705Bb598E670830E03A19F2D242f',
      '0x7058EE5467edef417746aab0B8cabbbE36eF1798',
      '0x9792eE4c36a622a8CF9566b037c57519A9fe8a56',
  ]
}

const getEthereumStaking = staking(tokenAddresses.sOnx, tokenAddresses.onx)

const getEthereumBorrows = async (api) => {
  api.add(ADDRESSES.null, await api.call({ target: tokenAddresses.pool, abi: 'uint256:totalBorrow' }))
}

async function getEthereumPoolTvl(api) {
  const pools = ['0xAdb6d1cB866a52C5E8C1e79Ff8e0559c12F4D7a3']
  const tokens = ['0x0652687e87a4b8b5370b05bc298ff00d205d9b5f']
  const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: pools })
  api.addTokens(tokens, bals)
  return api.sumTokens({ owners: [tokenAddresses.onxFarm, tokenAddresses.onxTripleFarm], tokens: ['0x0652687e87a4b8b5370b05bc298ff00d205d9b5f', tokenAddresses.onxWethSushiPair] })
}

async function ethTvl(api) {
  await Promise.all([addFarmTvl, addOnePoolTvl, addVaultTvl, addOneVaultTvl, ethStakeTvl].map(i => i()))

  async function ethStakeTvl() {
    let totalStake = await api.call({ target: tokenAddresses.pool, abi: 'uint256:totalStake' })
    let totalBorrow = await api.call({ target: tokenAddresses.pool, abi: 'uint256:totalPledge' })
    api.add(ADDRESSES.null, totalStake - totalBorrow)
  }


  async function addVaultTvl() {
    const vaults = [
      ['0xceff51756c56ceffca006cd410b03ffc46dd3a58', '0x2abCe7c4C77e215fcCc189E02Fc5D2A30b52a06a'],
      ['0x397ff1542f962076d0bfe58ea045ffa2d347aca0', '0x637c871C559ade45b37074fCF3B8081Ec81c55FC'],
      ['0x06da0fd433c1a5d7a4faa01111c044910a184553', '0xeAaE5CEfce1092eb3eA1DA7622B3cF4fb20B8b81'],

      ['0x795065dcc9f64b5614c407a6efdc400da6221fb0', '0xdC6f222c4504C43225a89b84E3aae15Ad0DFDF0F'],
      ['0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7', '0x10A8dc3C0Db7BDFE1Db36d113c2685e60daaFEb8'],
      ['0xfa5bc40c3bd5afa8bc2fe6b84562fee16fb2df5f', '0x6901Aac9813f3EfAae32F44E9b579f08A12707AD'],
      ['0x1241f4a348162d99379a23e73926cf0bfcbf131e', '0x121eF4eEc2bb4D5eD91347166F02c0763af1C49A'],
      ['0x088ee5007c98a9677165d78dd2109ae4a3d04d0c', '0x431b1F5356EcAc2D86b2313907B747B16D11066f'],

      ['0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f', '0x5EA1b54C522f279ecC0182d9b35229d6435D42b7'],
      ['0xd75ea151a61d06868e31f8988d28dfe5e9df57b4', '0x9DB4AFCABdB25C89424c88e720dD47D6be43BdBe'],
      ['0xc40d16476380e4037e6b1a2594caf6a6cc8da967', '0xbd3a37e3690ad4e145c39983D0Aaf8bd5f5e2F29'],
      ['0x31503dcb60119a812fee820bb7042752019f2355', '0x8d47f6fd4602B1ecF7928C0f1AEF9C215E3596b4'],
      ['0x31503dcb60119a812fee820bb7042752019f2355', '0x8d47f6fd4602B1ecF7928C0f1AEF9C215E3596b4'],

      ['0xba13afecda9beb75de5c56bbaf696b880a5a50dd', '0x659217CdA99658AeBA399B4a79FB03D96B3c46bC'],
      ['0xf55c33d94150d93c2cfb833bcca30be388b14964', '0xcedB7921013A012c5538C0d2925a90AA817Bef4D'],
    ]
    const pools = vaults.map(i => i[1])
    const tokens = vaults.map(i => i[0])
    const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: pools })
    api.addTokens(tokens, bals)
  }

  async function addFarmTvl() {
    const farm = '0x168f8469ac17dd39cd9a2c2ead647f814a488ce9'
    const pools = await api.fetchList({ lengthAbi: 'uint256:poolLength', itemAbi: 'function poolInfo(uint256) view returns (address token, uint256,uint256,uint256)', target: farm })
    return api.sumTokens({ owner: farm, tokens: pools.map(i => i.token), blacklistedTokens: ['0x0652687e87a4b8b5370b05bc298ff00d205d9b5f', tokenAddresses.onxWethSushiPair] })
  }
  async function addOnePoolTvl() {
    const pools = tokenAddresses.onePools
    const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: pools })
    return api.sumTokens({ tokensAndOwners2: [tokens, pools] })
  }

  async function addOneVaultTvl() {
    const vault = tokenAddresses.oneVault
    const aETH = await api.call({ abi: 'address:aEth', target: vault })
    const aETHb = await api.call({ abi: 'address:aETHb', target: vault })
    return api.sumTokens({ tokens: [aETH, aETHb], owner: vault })
  }
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: ethTvl,
    staking: getEthereumStaking,
    pool2: getEthereumPoolTvl,
    borrowed: getEthereumBorrows,
  },
  polygon: { tvl, },
  avax: { tvl, },
  fantom: { tvl, },
};