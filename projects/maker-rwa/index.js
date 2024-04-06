const ADDRESSES = require('../helper/coreAssets.json')
// const utils = require('web3-utils');
const sdk = require('@defillama/sdk');
const MakerSCDConstants = require("../maker/abis/makerdao.js");
const MakerMCDConstants = require("../maker/abis/maker-mcd.js");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function getJoins(block, api) {
  // let rely = utils.sha3("rely(address)").substr(0, 10);
  // let relyTopic = utils.padRight(rely, 64);
  let relyTopic = '0x65fae35e00000000000000000000000000000000000000000000000000000000'

  let joins = [];
  let failed = [];
  const failedSet = new Set(failedJoins)

  // get list of auths
  const auths = (
    await getLogs({
      api,
      target: MakerMCDConstants.VAT,
      fromBlock: MakerMCDConstants.STARTBLOCK,
      topics: [relyTopic],
    })
  ).map(i => `0x${i.topics[1].substr(26)}`).filter(i => !failedSet.has(i))

  const ilks = await api.multiCall({
    abi: MakerMCDConstants.ilk,
    calls: auths,
    permitFailure: true,
  });

  ilks.forEach((_, i) => {
    const token = auths[i].toLowerCase()
    if (_) joins.push(token)
    else failed.push(token)
  })

  if (failed.length) sdk.log('failed', failed)

  return joins;
}

async function tvl(api) {
  const block = api.block
  let toa = []

  const blacklistedJoins = [
    '0x7b3799b30f268ba55f926d7f714a3001af89d359',
    '0x41ca7a7aa2be78cf7cb80c0f4a9bdfbc96e81815',
  ]
  if (block > MakerMCDConstants.STARTBLOCK) {
    let joins = await getJoins(block, api);
    const dogSet = new Set(dogs)
    joins = joins.filter(i => !blacklistedJoins.includes(i) && !dogSet.has(i))

    const { output: gems } = await sdk.api.abi.multiCall({
      abi: MakerMCDConstants.gem,
      block, calls: joins.map(i => ({ target: i })),
      permitFailure: true,
    })
    const dogCalls = dogs.map(i => ({ target: i }))

    gems.forEach(({ success, output, input: { target } }) => {
      target = target.toLowerCase()
      if (!success) {
        dogCalls.push({ target })
        return;
      }

      toa.push([output, target])
    })

    const { output: dogRes } = await sdk.api.abi.multiCall({
      abi: MakerMCDConstants.dog,
      calls: dogCalls, block,
      permitFailure: true,
    })

    const failedCalls = dogRes.filter(i => !i.success)
    if (failedCalls.length) {
      failedCalls.forEach(i => sdk.log('Failed both gem and dog calls', i.input.target))
      throw new Error('Failed both gem and dog calls')
    }
  }

  toa = toa.filter(i => i[0].toLowerCase() !== ADDRESSES.ethereum.SAI.toLowerCase())
  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: toa.map(t => t[0]) })

  const owners = []
  toa.map((_, i) => {
    if (!symbols[i].startsWith('RWA')) return;
    // console.log(symbols[i], toa[i])
    owners.push(toa[i][1])
  })
  const ilks = await api.multiCall({ abi: 'function ilk() view returns (bytes32)', calls: owners })
  const res = await api.multiCall({ abi: 'function ilks (bytes32) view returns (uint256 art, uint256 rate, uint256 spot, uint256 line,uint256 dust)', calls:ilks, target:'0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B' })
  res.forEach(i => api.add(ADDRESSES.ethereum.DAI, i.art))

  return api.getBalances()
}

module.exports = {
    methodology: `Counts all the tokens being used as collateral of CDPs.

  On the technical level, we get all the collateral tokens by fetching events, get the amounts locked by calling balanceOf() directly, unwrap any uniswap LP tokens and then get the price of each token from coingecko`,
  start: 1513566671, // 12/18/2017 @ 12:00am (UTC)
  ethereum: {
    tvl
  },
};

const dogs = [
  '0x832dd5f17b30078a5e46fdb8130a68cbc4a74dc0',
  '0x9dacc11dcd0aa13386d295eaeebbd38130897e6f',
  '0xc67963a226eddd77b91ad8c421630a1b0adff270',
  '0x71eb894330e8a4b96b8d6056962e7f116f50e06f',
  '0xc2b12567523e3f3cbd9931492b91fe65b240bc47',
  '0x0227b54adbfaeec5f1ed1dfa11f54dcff9076e2c',
  '0x3d22e6f643e2f4c563fd9db22b229cbb0cd570fb',
  '0xdc90d461e148552387f3ab3ebee0bdc58aa16375',
  '0x006aa3eb5e666d8e006aa647d4afab212555ddea',
  '0xf5c8176e1eb0915359e46ded16e52c071bb435c0',
  '0x2bb690931407dca7ece84753ea931ffd304f0f38',
  '0x81c5cdf4817dbf75c7f08b8a1cdab05c9b3f70f7',
  '0x6aac067bb903e633a422de7be9355e62b3ce0378',
  '0x3713f83ee6d138ce191294c131148176015bc29a',
  '0x834719bea8da68c46484e001143bdde29370a6a3',
  '0x8723b74f598de2ea49747de5896f9034cc09349e',
  '0x9f6981ba5c77211a34b76c6385c0f6fa10414035',
  '0x93ae03815baf1f19d7f18d9116e4b637cc32a131',
  '0x2ac4c9b49051275acb4c43ec973082388d015d48',
  '0x4fc53a57262b87abda61d6d0db2be7e9be68f6b8',
  '0xb15afab996904170f87a64fe42db0b64a6f75d24',
  '0x6aa0520354d1b84e1c6abfe64a708939529b619e',
  '0xb0ece6f5542a4577e2f1be491a937ccbbec8479e',
  '0x854b252ba15eafa4d1609d3b98e00cc10084ec55',
  '0xe4b82be84391b9e7c56a1fc821f47569b364dd4a',
  '0x046b1a5718da6a226d912cfd306ba19980772908',
  '0x5590f23358fe17361d7e4e4f91219145d8ccfcb3',
  '0x0f6f88f8a4b918584e3539182793a0c276097f44',
  '0xfc9d6dd08bee324a5a8b557d2854b9c36c2aec5d',
  '0xbcb396cd139d1116bd89562b49b9d1d6c25378b0',
  '0xa47d68b9db0a0361284fa04ba40623fcbd1a263e',
  '0x66609b4799fd7ce12ba799ad01094abd13d5014d',
  '0x9b3310708af333f6f379fa42a5d09cbaa10ab309',
  '0x5322a3551bc6a1b39d5d142e5e38dc5b4bc5b3d2',
  '0x29342f530ed6120bdb219d602dafd584676293d1',
  '0x5048c5cd3102026472f8914557a1fd35c8dc6c9e',
  '0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457a',
  '0xa93b98e57dde14a3e301f20933d59dc19bf8212e',
  '0xe30663c6f83a06edee6273d72274ae24f1084a22',
  '0x39f29773dcb94a32529d0612c6706c49622161d1',
  '0xf93cc3a50f450ed245e003bfecc8a6ec1732b0b2',
  '0xb55da3d3100c4ebf9de755b6ddc24bf209f6cc06',
  '0x1926862f899410bfc19fefb8a3c69c7aed22463a',
  '0x3ea60191b7d5990a3544b6ef79983fd67e85494a',
  '0x27ca5e525ea473ed52ea9423cd08ccc081d96a98',
  '0xd9e758bd239e5d568f44d0a748633f6a8d52cbbb',
]

const failedJoins = [
  '0xbaa65281c2fa2baacb2cb550ba051525a480d3f4',
  '0x65c79fcb50ca1594b025960e539ed7a9a6d434a3',
  '0x19c0976f590d67707e62397c87829d896dc0f1f1',
  '0x197e90f9fad81970ba7976f33cbd77088e5d7cf7',
  '0x78f2c2af65126834c51822f56be0d7469d7a523e',
  '0xab14d3ce3f733cacb76ec2abe7d2fcb00c99f3d5',
  '0xbe8e3e3618f7474f8cb1d074a26affef007e98fb',
  '0x4d95a049d5b0b7d32058cd3f2163015747522e99',
  '0xa41b6ef151e06da0e34b009b86e828308986736d',
  '0xa5679c04fc3d9d8b0aab1f0ab83555b301ca70ea',
  '0xc7bdd1f2b16447dcf3de045c4a039a60ec2f0ba3',
  '0x88f88bb9e66241b73b84f3a6e197fbba487b1e30',
  '0xbb856d1742fd182a90239d7ae85706c2fe4e5922',
  '0x29cfbd381043d00a98fd9904a431015fef07af2f',
  '0x135954d155898d42c90d2a57824c690e0c7bef1b',
  '0x1eb4cf3a948e7d72a198fe073ccb8c7a948cd853',
  '0x2cc583c0aacdac9e23cb601fda8f1a0c56cdcb71',
  '0x09e05ff6142f2f9de8b6b65855a1d56b6cfe4c58',
  '0xa4c22f0e25c6630b2017979acf1f865e94695c4b',
  '0x0e2e8f1d1326a4b9633d96222ce399c708b19c28',
  '0x60744434d6339a6b27d73d9eda62b6f66a0a04fa',
  '0x12f36cdea3a28c35ac8c6cc71d9265c17c74a27f',
]
