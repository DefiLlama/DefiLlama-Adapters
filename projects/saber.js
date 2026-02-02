const { sumTokens2, } = require("./helper/solana");
const { getConfig } = require('./helper/cache')

// The data here comes directly from
// https://registry.saber.so/data/llama.mainnet.json
const blacklistedTokens = new Set([
  'JEFFSQ3s8T3wKsvp4tnRAsUBW7Cqgnf8ukBZC4C8XBm1',
  'AEUT5uFm1D575FVCoQd5Yq891FJEqkncZUbBFoFcAhTV',
  'FACTQhZBfRzC7A76antnpAoZtiwYmUfdAN8wz7e8rxC5',
  'KNVfdSJyq1pRQk9AKKv1g5uyGuk6wpm4WG16Bjuwdma',
  'EU9aLffrTckFCs16da6CppHy63fAxMPF9ih1erQTuuRt',
  'C9xqJe3gMTUDKidZsZ6jJ7tL9zSLimDUKVpgUbLZnNbi',
  'LUNGEjUXyP48nrC1GYY5o4eTAkwm4RdX8BxFUxWJBLB',
  'SBTCB6pWqeDo6zGi9WVRMLCsKsN6JiR1RMUqvLtgSRv',
  '88881Hu2jGMfCs9tMu5Rr7Ah7WBNBuXqde4nR5ZmKYYy',
  'UST98bfV6EASdTFQrRwCBczpehdMFwYCUdLT5tEbhpW',
  'CASHedBw9NfhsLBXq1WNVfueVznx255j8LLTScto3S6s',
  'UST8SCn7jrqsq51odVLqcmvnC658HkqrKrPL3w2hHQ7',
  'FTT9rBBrYwcHam4qLvkzzzhrsihYMbZ3k6wJbdoahxAt',
  '9999j2A8sXUtHtDoQdk528oVzhaKBsXyRGZ67FKGoi7H',
  'KUANeD8EQvwpT1W7QZDtDqctLEh2FfSTy5pThE9CogT',
  'FTT8cGNp3rfTC6c44uPTuEFLqmsVDhjd2BhH65v2uppr',
  'T8KdT8hDzNhbGx5sjpEUxepnbDB1TZoCa7vtC5JjsMw',
  'FTT9GrHBVHvDeUTgLU8FxVJouGqg9uiWGmmjETdm32Sx',
  'SL819j8K9FuFPL84UepVcFkEZqDUUvVzwDmJjCHySYj',
  'BtX7AfzEJLnU8KQR1AgHrhGH5s2AHUTbfjhUQP8BhPvi',
  'BdUJucPJyjkHxLMv6ipKNUhSeY3DWrVtgxAES1iSBAov',
])

async function tvl() {
  const saberPools = await getConfig('saber', "https://registry.saber.so/data/llama.mainnet.json");

  function isValidToken(token) {
    return !blacklistedTokens.has(token)
  }

  const tokenAccounts = saberPools.map(i => {
    // filter out cashio dollars
    const res = []
    if (isValidToken(i.tokenA))
      res.push(i.reserveA)
    if (isValidToken(i.tokenB))
      res.push(i.reserveB)
    return res
  }).flat()
  return sumTokens2({ tokenAccounts, })
}

module.exports = {
  hallmarks: [
    [1667865600, "FTX collapse"]
  ],
  timetravel: false,
  solana: { tvl },
};
