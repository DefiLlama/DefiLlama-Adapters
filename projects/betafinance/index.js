const ADDRESSES = require('../helper/coreAssets.json')

const { getLogs } = require('../helper/cache/getLogs');

const config = {
  ethereum: {
    bank: '0x972a785b390D05123497169a04c72dE652493BE1', fromBlock: 13004429, markets: [
      { underlying: ADDRESSES.ethereum.WETH, bToken: '0x74cAc868f2254f1a6B7ca951f0D86eaC4a65C132' },
      { underlying: ADDRESSES.ethereum.USDT, bToken: '0xBe1c71c94FebcA2673DB2E9BD610E2Cc80b950FC' },
      { underlying: ADDRESSES.ethereum.USDC, bToken: '0xC02392336420bb54CE2Da8a8aa4B118F2dceeB04' },
      { underlying: ADDRESSES.ethereum.DAI, bToken: '0x70540A3178290498B0C6d843Fa7ED97cAe69B86c' },
      { underlying: ADDRESSES.ethereum.WBTC, bToken: '0x01aA4629b756B1222CB5541da0255b4f473F3a11' },
      { underlying: ADDRESSES.ethereum.AAVE, bToken: '0x763C53c462ffD85219755780a22Ad7b7F05a8B4e' },
      { underlying: '0xc00e94Cb662C3520282E6f5717214004A7f26888', bToken: '0xe0AA577ABaBB0aCde6104df939B99729E183A945' },
      { underlying: ADDRESSES.ethereum.UNI, bToken: '0x9e733e5cE6406399ce072d427069a66F706B4374' },
      { underlying: ADDRESSES.ethereum.SUSHI, bToken: '0xd993778FCd8273FA84644bEE9B9c3cB9CC92B15B' },
      { underlying: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975', bToken: '0x70Cca532614F3c79F84a069165825B7455b90F75' },
      { underlying: ADDRESSES.ethereum.MATIC, bToken: '0x23413947Bc16c16C9F9143854afC25Fee2501040' },
      { underlying: ADDRESSES.ethereum.LINK, bToken: '0x13CB01b740C9e5aa93c78CA908cB96a9c67582D7' },
      { underlying: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55', bToken: '0x7B4b412e47A37A52ad32498a2Fc3260F1d2C26dd' },
      { underlying: '0xba100000625a3754423978a60c9317c58a424e3D', bToken: '0x53a69CE5682833F10371a0d4934cf564acb79F2D' },
      { underlying: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C', bToken: '0x775C20D0A779567B6153a2A4b719AC691d7318A0' },
      { underlying: ADDRESSES.ethereum.SNX, bToken: '0xE5215AA84A0938F7B4c165559EDCF65dbEab4729' },
      { underlying: ADDRESSES.ethereum.YFI, bToken: '0x0fC2d94D8A5C85a36cc7183f0d2F745A73E9984d' },
      { underlying: '0x2ba592F78dB6436527729929AAf6c908497cB200', bToken: '0x9fA2f7c0d23330BC171aF83f3038e1ED870b17F8' },
      { underlying: '0xDFDb7f72c1F195C5951a234e8DB9806EB0635346', bToken: '0x9Eadc7e465d2cC7fd2973CE293Ff4054Ab17BE27' },
      { underlying: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', bToken: '0xA952dC25d8454a7611277cD77BE8285cD0192ceE' },
      { underlying: '0x72e364F2ABdC788b7E918bc238B21f109Cd634D7', bToken: '0x322897F8b9eed2533540Fbb74D90ADe74D80fbfA' },
      { underlying: '0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD', bToken: '0x9122c38b11888f24637eCc1FEE7AbC67cF346508' },
      { underlying: '0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6', bToken: '0x265807D818FF14D44b552F5897aBDAd6Eed603E2' },
      { underlying: '0xBe1a001FE942f96Eea22bA08783140B9Dcc09D28', bToken: '0x02A1aac41c855E1d0985235Bca56828ea79cdBcB' },
      { underlying: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b', bToken: '0x8b3Ff556739b19A66077D01DFc5d131ECAac3596' },
      { underlying: '0x0954906da0Bf32d5479e25f46056d22f08464cab', bToken: '0x1451385547b9d13166455f88614B69fcc01934BC' },
      { underlying: '0x4d224452801ACEd8B2F0aebE155379bb5D594381', bToken: '0x76bE26C96bCb14A2Bb08673aD68dd5AD7C358710' },
      { underlying: '0xf4d2888d29D722226FafA5d9B24F9164c092421E', bToken: '0xd0fD064Cad310fe121860a8EBA0eB56D270e90ce' },
      { underlying: ADDRESSES.ethereum.INU, bToken: '0x103ACae4750c3826f1c8e9F1Cb3F43f5FdcD9Ee1' },
      { underlying: '0x632806BF5c8f062932Dd121244c9fbe7becb8B48', bToken: '0xc543a986ba64A196d22f4B7292A77B409066e17E' },
      { underlying: '0xE1Fc4455f62a6E89476f1072530C20CF1A0622dA', bToken: '0x762E7b393a92F75491e7e4c6CAD7219c2B3b9de1' },
      { underlying: ADDRESSES.ethereum.WSTETH, bToken: '0xF10D6b54c8163656747b9434e546BB0067ae8821' },
      { underlying: ADDRESSES.ethereum.RETH, bToken: '0x3a951351f3b906365E364a1299b5F04bEc66E2e7' },
      { underlying: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f', bToken: '0x08ED26B2455eff6bC7894F12a9A36Ec4144523e2' },
      { underlying: '0xf1B99e3E573A1a9C5E6B2Ce818b617F0E664E86B', bToken: '0xE3bb7D6337F869A039cd89Bd089381595A508228' },
      { underlying: '0x5283D291DBCF85356A21bA090E6db59121208b44', bToken: '0xD589943d84F0A633175583B6B0944BD3ab6aF150' },
    ]
  },
  avax: {
    bank: '0xf3a82ddd4fbf49a35eccf264997f82d40510f36b', fromBlock: 8495305, markets: [
      { underlying: ADDRESSES.avax.WAVAX, bToken: '0x7E5DAb815356FA8A0832bB97EA3C0aba295b2949' },
      { underlying: ADDRESSES.avax.USDT_e, bToken: '0xe9d01683e0E03cCD3E7663Ab207391D095cb9ec3' },
      { underlying: ADDRESSES.avax.USDC_e, bToken: '0xaAAD5237FAcD7e61548dc1DE71B26D3431562bf3' },
      { underlying: ADDRESSES.avax.DAI, bToken: '0x2D29dcdBc64658EFd33565731cAFbA48c95Eae76' },
      { underlying: ADDRESSES.avax.WETH_e, bToken: '0xd62eFF4221f83f05843AB1F645F7C0b4E38A6b49' },
      { underlying: ADDRESSES.avax.WBTC_e, bToken: '0x8aEE941d2043d4Ee9327394c810a29c97d13DE52' },
      { underlying: '0xCE1bFFBD5374Dac86a2893119683F4911a2F7814', bToken: '0x7a7426B0d4b95952F81b170a09A26F9eaAC949C2' },
      { underlying: '0x511D35c52a3C244E7b8bd92c0C297755FbD89212', bToken: '0x5837dE0D87Ec40f05E79a27cBa7Dc7Ff96da5980' },
      { underlying: '0x2147EFFF675e4A4eE1C2f918d181cDBd7a8E208f', bToken: '0x4da7A2Cf132E12cd4D3fD2C8a30A076f9e08d7A7' },
    ]
  }
}

Object.keys(config).forEach(chain => {
  const { bank, fromBlock, markets } = config[chain]
  const _getLogs = api => getLogs({ api, target: bank, eventAbi: 'event Create (address indexed underlying, address bToken)', onlyArgs: true, fromBlock, })
  module.exports[chain] = {
    tvl: async (api) => {
      // const logs = await _getLogs(api)
      const logs = markets
      const underlyingTokens = logs.map(log => log.underlying)
      const bTokens = logs.map(log => log.bToken)
      underlyingTokens.forEach(i => bTokens.push(bank))
      underlyingTokens.push(...underlyingTokens)
      return api.sumTokens({ tokensAndOwners2: [underlyingTokens, bTokens] })
    },
    borrowed: async (api) => {
      // const logs = await _getLogs(api)
      const logs = markets
      const underlyingTokens = logs.map(log => log.underlying)
      const bTokens = logs.map(log => log.bToken)
      const loans = await api.multiCall({ abi: 'uint256:totalLoan', calls: bTokens })
      api.addTokens(underlyingTokens, loans)
      return api.getBalances()
    }
  }
})