const ADDRESSES = require('../helper/coreAssets.json')
const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, } = require("../helper/solana");
const idl = require('./idl.json')

async function tvl() {
  const provider = getProvider()
  const programId = idl.metadata.address;
  const program = new Program(idl, programId, provider)
  const userAccounts = await program.account.userAccount.all()
  const ammAccounts = await program.account.ammAccount.all()
  let usdcBalance = ammAccounts.map(i => i.account.totalLiquidityUsdc).reduce((a, i) => a + (i / 1e6), 0)
  const balances = {
    'usd-coin': usdcBalance
  }

  const tokens = [
    ADDRESSES.solana.USDC,  // USDC
  ]

  const serumPCVaults = [
    "38WWL1VwNmMPqVg51U1VrpW2ytrWMJJCwtemvgt8raSu",
    "DYMoBxD7kZ8dsRz5sDassSoSxGH9LeCSwLRYyAtp3QG5",
    "4AVQH2MHvU2hBDZ8nDe9Wg6r98un6KpjmjMM2N21pY5d",
    "FogPyqBdiTEWZVud3XVpqPMoW8Gfd7osB4jTitoodrzo",
    "BPWwKZd95fAiDKuit72TWNPqkFwtHiHkgb5LrRc6EABs",
    "8o8auMW3vy4qhGcd9a1BUkForN4spz2cWaztNgyMzKtP",
    "6P4XFpiuV6gUo2MiKAPEnWt7gDSxH6F872dbJBzCESyg",
    "2xPo4TLK66wA8Uy1uHRsYmXizcXbBKAhaFHHuWBh6M1n",
    "HxiAa3msfgczD75qXEWM5FeqsgAwGvX7ycM5sopP3LYc",
    "6usPMgY7vGxQSTJ3Xfd5HsziD6dcfzMxWXZtHZ2Qgidh",
    "BTV3Xm7SMH5YxHYKvaBBtwGXxAoMXVMyr5Kz3yScdyHT",
    "6ErKVzqLwq6oZriVMkCQLsP2a6U8pJ9YUQpnijBdnyxq",
    "9MovPBQYQJSfxYaEA7UDs8pvBmAtjLXb7ycFwZUKjc26",
    "5XeZa78PipX7b93BGDDwv6fWnjVeL4s6epicCDais8fD",
    "F3G9AMW6CYMSJtGFYL7qcLTo3enfui9gquTvpFRb4F14",
    "8d2oaNY2tkRXXoEifar64FkH9rvTGqVEcaZd1aYWmx9Q",
    "8tJE3sQLUZLe89CfQfeeypnDYsizmkMxALnxwWwMcqrS",
    "8ggcSPawAgzNEQ8RUtspPCZZvTpeT3bFEw7tMQvydch",
    "H8yssBnCci6b6w2aMJsMzXFX9dQzDAT6XxbxEuwKhSzA",
    "649nbpVo6iEU7jMzpMJmQQ9H7vzNLPnyg6YDUbE2vJGe",
    "3UsAjfdEzJWo7WyCvV5cqk4xKG2FR9JKHM7MiRxu8t9D",
    "81AaLXcFUFnU1bEajrM9tGcfNKej4wEUqeo17K3DNw5G",
    "9kuVJFwtvpZR466De9nZYTHZJHBVjA52p1pCt7EUgbff",
    "2PbrkRgZpKmADRrYvTshooC3YqGFewt1JguaP8wAtQrZ",
    "FsctDV8armyXZAVidRXQJ1SCMTD5r299PQY5eVNs5x3d",
    "JDYCZomM2Ew1urspaQGqBLXao1Ur3gb27gTTG9yZQhKd",
    "9rkoEntjgEu1vX92cSCyUpnymRUEUoNRsL1WnT5XMftr",
    "DzXUm5eGk6GdA4HkakMfjPskV2LUST3eoX49goTKUWHM",
    "HpfnM4hganS3Vgz1RwgGstdFA4uRkDKkiUDKqFZpdDvd",
    "FzmPZafEkEheA8gGkuhZXe6RBrEUEprqBpL44VuzK9p9",
    "4i4TCmqjRbhV1E7e556GR6d9ePpUjXRC8pN57nRw17Ce",
    "FQt1fLVLSH47Tnc2GU4ErcgAqtVC6wtSvRFJYkYrzmAK"
  ]

  const owners = userAccounts.map(i => i.publicKey)
  return sumTokens2({ balances, tokens, owners, tokenAccounts: serumPCVaults })
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl: () => ({}),
  },
  hallmarks: [
    ['2022-08-30', 'OptiFi mainnet program was closed by mistake'],
  ],
};

module.exports.deadFrom = '2022-09-02'
