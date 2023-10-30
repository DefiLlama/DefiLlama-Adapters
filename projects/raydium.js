const { getConnection, sumTokens2, decodeAccount, } = require("./helper/solana");
const { PublicKey, } = require("@solana/web3.js");
const sdk = require('@defillama/sdk');

const CLMM = 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK'
const AmmV4 = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
const AmmStable = '5quBtoiQqxF9Jv6KYKctB59NT3gtJD2Y65kdnB1Uev3h'

async function ammStableTvl() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(AmmStable), {
    filters: [{
      dataSize: 1232
    }]
  })
  const data = accounts.map(i => decodeAccount('raydiumLPStable', i.account))
  const tokenAccounts = data.map(i => [i.baseVault, i.quoteVault]).flat().map(i => i.toString())
  return sumTokens2({ tokenAccounts })
}

async function tvlCLMM() {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(CLMM), {
    filters: [{
      dataSize: 1544
    }]
  })
  const data = accounts.map(i => decodeAccount('raydiumCLMM', i.account))
  const tokenAccounts = data.map(i => [i.vaultA, i.vaultB]).flat().map(i => i.toString())
  return sumTokens2({ tokenAccounts })
}


async function ammV4Tvl() {
  const owner = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'
  return sumTokens2({ owner, getAllTokenAccounts: true })
}

async function ammV2V3() {
  return sumTokens2({ tokenAccounts: [
    // v2
    '8tA74jqYPNmr8pcvZE3FBxmLMDqFMvZryny8XojCD5CE',
    '7t51g6PFAfnBtWqooQhHErneVqQb4SN1QuPnG7iGa87M',
    '5fHS778vozoDDYzzJz2xYG39whTzGGW6bF71GVxRyMXi',
    'CzVe191iLM2E31DBW7isXpZBPtcufRRsaxNRc8uShcEs',
    'G2zmxUhRGn12fuePJy9QsmJKem6XCRnmAEkf8G6xcRTj',
    'H617sH2JNjMqPhRxsu43C8vDYfjZrFuoMEKdJyMu7V3t',
    'CJukFFmH9FZ98uzFkUNgqRn8xUmSBTUETEDUMxZXk6p8',
    'DoZyq9uo3W4WWBZJvPCvfB5cCBFvjU9oq3DdYjNgJNRX',
    'Gej1jXVRMdDKWSxmEZ78KJp5jruGJfR9dV3beedXe3BG',
    'FUDEbQKfMTfAaKS3dGdPEacfcC9bRpa5gmmDW8KNoUKp',
    '3NAqRJFepsd2dae98Yj7uALQxiV1YRcZJoUcuXErK1FF',
    '9RPGJb7pSyiLKKACmeoSgqeypiEymZneBHWbHerQC9Qm',
    '7r5YjMLMnmoYkD1bkyYq374yiTBG9XwBHMwi5ZVDptre',
    '6vMeQvJcC3VEGvtZ2TDXcShZerevxkqfW43yjX14vmSz',
    'CvcqJtGdS9C1jKKFzgCi5p8qsnR5BZCohWvYMBJXcnJ8',
    'AiYm8jzb2WB4HTTFTHX1XCS7uVSQM5XWnMsure5sMeQY',
    // v3
    'DujWhSxnwqFd3TrLfScyUhJ3FdoaHrmoiVE6kU4ETQyL',
    'D6F5CDaLDCHHWfE8kMLbMNAFULXLfM572AGDx2a6KeXc',
    'Eg6sR9H28cFaek5DVdgxxDcRKKbS85XvCFEzzkdmYNhq',
    '8g2nHtayS2JnRxaAY5ugsYC8CwiZutQrNWA9j2oH8UVM',
    'DTQTBTSy3tiy7kZZWgaczWxs9snnTVTi8DBYBzjaVwbj',
    'Bk2G4zhjB7VmRsaBwh2ijPwq6tavMHALEq4guogxsosT',
    'ENjXaFNDiLTh44Gs89ZtfUH2i5MGLLkfYbSY7TmP4Du3',
    '9uzWJD2WqJYSmB6UHSyPMskFGoP5L6hB7FxqUdYP4Esm',
    'Fy6SnHwAkxoGMhUH2cLu2biqAnHmaAwFDDww9k6gq5ws',
    'GoRindEPofTJ3axsonTnbyf7cFwdFdG1A3MG9ENyBZsn',
  ] })
}

module.exports = {
  timetravel: false,
  hallmarks: [[1667865600, "FTX collapse"]],
  solana: {
    tvl: sdk.util.sumChainTvls([tvlCLMM, ammStableTvl, ammV4Tvl, ammV2V3]),
    staking: () => sumTokens2({ tokenAccounts: ['8tnpAECxAT9nHBqR1Ba494Ar5dQMPGhL31MmPJz1zZvY']})
  },
};