const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCakePerShare)",
    "poolLength": "uint256:poolLength",
    "symbol": "string:symbol",
    "reserveToken": "address:reserveToken",
    "totalReserve": "uint256:totalReserve",
    "state": "function state() view returns (address _masterChef, uint256 _pid, address _rewardToken, address _routingToken, address _reserveToken, address _treasury, address _collector, address _exchange, uint256 _minimalGulpFactor, uint256 _forceGulpRatio, uint256 _performanceFee, bool _emergencyMode)"
  };const config = {
  bsc: {
    autoGem: "0xE02CE329281664A5d2BC0006342DC84f6c384663",
    DAI: ADDRESSES.bsc.DAI,
    pools: [
      "0x13e7a6691fe00de975cf27868386f4ae9aed3cdc",
      "0xc2e8c3c427e0a5baaf512a013516aecb65bd75cb",
    ],
    singlePSM: ADDRESSES.bsc.BUSD,
  },
  fantom: {
    DAI: ADDRESSES.fantom.DAI,
    pools: [
      "0x30463d33735677b4e70f956e3dd61c6e94d70dfe",
      "0xaebd31E9FFcB222feE947f22369257cEcf1F96CA",
    ],
  },
  avax: {
    DAI: ADDRESSES.avax.DAI,
    singlePSM: ADDRESSES.avax.USDC_e,
    autoGem: "0x65764167EC4B38D611F961515B51a40628614018",
  }
}

const tvl = async (api) => {
  const { pools = [], autoGem, DAI, singlePSM } = config[api.chain] ?? {}

  const stakeLpTokens = (await api.multiCall({ abi: abi.state, calls: pools, })).map((stkLp) => stkLp._reserveToken);
  const stakeLpTokens_bal = (await api.multiCall({ abi: abi.totalReserve, calls: pools, }))
  api.add(stakeLpTokens, stakeLpTokens_bal)
  if (autoGem) await api.sumTokens({ tokens: [singlePSM], owner: autoGem })

  if (api.chain === 'avax') {
    const bal = await api.call({  abi: 'uint256:totalReserve', target: '0x88Cc23286f1356EB0163Ad5bdbFa639416e4168d' })
    api.add(DAI, bal)
  } else if (api.chain === 'fantom') {
    const bal = await api.call({  abi: 'uint256:totalReserve', target: '0xA561fa603bf0B43Cb0d0911EeccC8B6777d3401B' })
    const want = await api.call({  abi: 'address:want', target: '0x3f569724cce63f7f24c5f921d5ddcfe125add96b' })
    const wantBal = await api.call({  abi: 'uint256:balance', target: '0x3f569724cce63f7f24c5f921d5ddcfe125add96b' })
    const lQDRBal = await api.call({  abi: 'erc20:balanceOf', target: '0x3ae658656d1c526144db371faef2fff7170654ee', params: '0x814c66594a22404e101fecfecac1012d8d75c156' })
    api.add('0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9', lQDRBal)
    api.add(DAI, bal)
    api.add(want, wantBal)
  }
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})