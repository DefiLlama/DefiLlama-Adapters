const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

// Tokens are discovered from each orderbook's own deposit events, so a new
// token listed on Raindex counts without an adapter change.
const DEPOSIT_ABI = {
  3: 'event Deposit(address sender, address token, uint256 vaultId, uint256 amount)',
  4: 'event Deposit(address sender, address token, uint256 vaultId, uint256 amount)',
  5: 'event DepositV2(address sender, address token, bytes32 vaultId, uint256 depositAmountUint256)',
  6: 'event DepositV2(address sender, address token, bytes32 vaultId, uint256 depositAmountUint256)',
}

const config = {
  arbitrum: [
    { address: "0x90caf23ea7e507bb722647b0674e50d8d6468234", version: 3, fromBlock: 190448527 },
    { address: "0x550878091b2b1506069f61ae59e3a5484bca9166", version: 4, fromBlock: 255993123 },
    { address: "0x59401C9302E79Eb8AC6aea659B8B3ae475715e86", version: 4, fromBlock: 342952010 },
    { address: "0x8df8075e4077dabf1e95f49059e4c1eea33094ab", version: 5, fromBlock: 376113653 },
  ],
  base: [
    { address: "0x2aee87d75cd000583daec7a28db103b1c0c18b76", version: 3, fromBlock: 11835726 },
    { address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7", version: 4, fromBlock: 18963726 },
    { address: "0xa2f56f8f74b7d04d61f281be6576b6155581dcba", version: 4, fromBlock: 16501326 },
    { address: "0x32aCbdF51abe567C91b7a5cd5E52024a5Ca56844", version: 4, fromBlock: 18790926 },
    { address: "0x80DE00e3cA96AE0569426A1bb1Ae22CD4181dE6F", version: 4, fromBlock: 18618126 },
    { address: "0x7A44459893F99b9d9a92d488eb5d16E4090f0545", version: 4, fromBlock: 18229326 },
    { address: "0x881cf4c0764e733d9c387f3858ee87cca04affe0", version: 4, fromBlock: 34299726 },
    { address: "0x7692BA8446Bb8B3140A2c02df073080BeD0a7F8E", version: 4, fromBlock: 32269326 },
    { address: "0x498Ff70C5f67e63e53b74551DE31387cf2813986", version: 5, fromBlock: 41082126 },
    { address: "0x52ceb8ebef648744ffdde89f7bc9c3ac35944775", version: 5, fromBlock: 36589326 },
    { address: "0xe522cB4a5fCb2eb31a52Ff41a4653d85A4fd7C9D", version: 6, fromBlock: 41686926 },
  ],
  bsc: [
    { address: "0xb1d6d10561d4e1792a7c6b336b0529e4bfb5ea8f", version: 3, fromBlock: 36975501 },
    { address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7", version: 4, fromBlock: 42461436 },
  ],
  ethereum: [
    { address: "0xf1224a483ad7f1e9aa46a8ce41229f32d7549a74", version: 3, fromBlock: 19158375 },
    { address: "0x0eA6d458488d1cf51695e1D6e4744e6FB715d37C", version: 4, fromBlock: 21031734 },
  ],
  flare: [
    { address: "0xb06202aA3Fe7d85171fB7aA5f17011d17E63f382", version: 3, fromBlock: 22035885 },
    { address: "0xcee8cd002f151a536394e564b84076c41bbbcd4d", version: 4, fromBlock: 29249326 },
    { address: "0xaa3b14Af0e29E3854E4148f43321C4410db002bC", version: 4, fromBlock: 28500146 },
    { address: "0xA2Ac77b982A9c0999472c1De378A81d7363d926F", version: 4, fromBlock: 28500146 },
    { address: "0x582d9e838FE6cD9F8147C66A8f56A3FBE513a6A2", version: 4, fromBlock: 26646164 },
  ],
  linea: [
    { address: "0x22410e2a46261a1b1e3899a072f303022801c764", version: 4, fromBlock: 10072712 },
    { address: "0xF97DE1c2d864d90851aDBcbEe0A38260440B8D90", version: 4, fromBlock: 7360700 },
  ],
  matchain: [
    { address: "0x40312EDAB8Fe65091354172ad79e9459f21094E2", version: 4, fromBlock: 3840012 },
  ],
  polygon: [
    { address: "0xde5abe2837bc042397d80e37fb7b2c850a8d5a6c", version: 3, fromBlock: 52562132 },
    { address: "0x34200e026fbac0c902a0ff18e77a49265ca6ac99", version: 3, fromBlock: 45798865 },
    { address: "0xd3edafeb9eaa454ce26e60a66ccda73939c343a4", version: 3, fromBlock: 49392797 },
    { address: "0xc95a5f8efe14d7a20bd2e5bafec4e71f8ce0b9a6", version: 3, fromBlock: 54627539 },
    { address: "0x95c9bf235435b660aa69f519904c3f175aab393d", version: 3, fromBlock: 49352857 },
    { address: "0xdcdee0e7a58bba7e305db3abc42f4887ce8ef729", version: 3, fromBlock: 50671355 },
    { address: "0x16d518706d666c549da7bd31110623b09ef23abb", version: 3, fromBlock: 50828814 },
    { address: "0x7d2f700b1f6fd75734824ea4578960747bdf269a", version: 4, fromBlock: 61994401 },
    { address: "0x2f209e5b67a33b8fe96e28f24628df6da301c8eb", version: 4, fromBlock: 59649848 },
    { address: "0xb8CD71e3b4339c8B718D982358cB32Ed272e4174", version: 4, fromBlock: 60558376 },
    { address: "0x001B302095D66b777C04cd4d64b86CCe16de55A1", version: 4, fromBlock: 60558376 },
    { address: "0xAfD94467d2eC43D9aD39f835BA758b61b2f41A0E", version: 4, fromBlock: 59649848 },
    { address: "0x8a3c8e610d827093f7437e0c45efa648563c0dda", version: 5, fromBlock: 76700871 },
  ],
  robinhood: [
    { address: "0x37FC0EFec37D19f8A221aa4F8F7600C9ba2AcD20", version: 6, fromBlock: 59557818 },
  ],
}

async function tvl(api) {
  const tokensAndOwners = []
  for (const { address, version, fromBlock } of config[api.chain]) {
    const logs = await getLogs({ api, target: address, eventAbi: DEPOSIT_ABI[version], onlyArgs: true, fromBlock, useIndexer: true })
    const tokens = new Set(logs.map(log => log.token.toLowerCase()))
    tokens.forEach(token => tokensAndOwners.push([token, address]))
  }
  return sumTokens2({ api, tokensAndOwners, permitFailure: true })
}

module.exports = {
  methodology: 'Balance of every token ever deposited into a Raindex orderbook contract, held by that contract.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
