const { call } = require("../helper/chain/ton");
const { Cell } = require("@ton/core")
const { sleep } = require('../helper/utils')

async function getTvlInPoolAndVault() {
  const vault = await call({ target: "UQDFlyZ5zsWyowbZvZjZwIW_Vzm-1uvf8z_PUfvQtHrV14dp", abi: "get_vault_data"})
  let tonTVL = BigInt(vault[1] + vault[8]);
  await sleep(1000 * (3 * Math.random() + 3))

  const result = await call({ target: "EQAze1aSZHY1yUGz1BFndH62k-VYpXYeDiYofCXTRZClF8Qr", abi: "get_reserves" })
  const data = Cell.fromBase64(result[1][1].bytes)
  const ds = data.beginParse()
  while (ds.remainingBits) {
    tonTVL += BigInt(ds.loadCoins())
  }
  const ton = Number(tonTVL / BigInt(1e9))
  await sleep(1000 * (3 * Math.random() + 3))

  const resultU = await call({ target: "EQBy7pjr6IBzqW8vuVCZ780evtnkiIF3jZSRRDxeqScfZoU9", abi: "get_reserves" })
  const dataU = Cell.fromBase64(resultU[1][1].bytes)
  const dsu = dataU.beginParse()
  let usdTVL = 0n;
  while (dsu.remainingBits) {
    usdTVL += dsu.loadCoins()
  }
  const usd = Number(usdTVL / BigInt(1e6))
  console.log({ ton, usd })
  return { ton, usd }
}

module.exports = {
  methodology: 'Total amount of collateral locked in the Catton Protocol',
  timetravel: false,
  ton: {
    tvl: async () => {
      const { ton, usd } = await getTvlInPoolAndVault();
        return { 
          "coingecko:the-open-network": ton,
          "coingecko:tether": usd,
         };
      }
  }
}
