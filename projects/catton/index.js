const { call, getJettonBalances, getTonBalance } = require("../helper/chain/ton");
const { sleep } = require('../helper/utils')

const TON_POOL_ADDRESS = "EQAze1aSZHY1yUGz1BFndH62k-VYpXYeDiYofCXTRZClF8Qr"
const USD_POOL_ADDRESS = "EQBy7pjr6IBzqW8vuVCZ780evtnkiIF3jZSRRDxeqScfZoU9"
const CTON_ADDRESS = "0:86cf8401d283627a87b58c367b440cad933ab8aa7b383419e8ff7d1a00c945f8"
const CTUSDT_ADDRESS = "0:9fb449ce8fb43d0f682c713c01d9d8357c7cd0d4a49dd64dd585926990174a4e"
const USDT_ADDRESS = "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe"

async function getTvlInPoolAndVault() {

  const vault = await call({ target: "UQDFlyZ5zsWyowbZvZjZwIW_Vzm-1uvf8z_PUfvQtHrV14dp", abi: "get_vault_data"})
  let tonTVL = BigInt(vault[1] + vault[8]);
  await sleep(1000 * (3 * Math.random() + 3))

  const tonBalanceInTonPool = await getTonBalance(TON_POOL_ADDRESS)
  tonTVL += BigInt(tonBalanceInTonPool)
  await sleep(1000 * (3 * Math.random() + 3))
  const ctonInPool = await getJettonBalances(TON_POOL_ADDRESS)
  const cTonValue = BigInt(ctonInPool[CTON_ADDRESS].balance)
  tonTVL += cTonValue;
  await sleep(1000 * (3 * Math.random() + 3))
  const usdInPool = await getJettonBalances(USD_POOL_ADDRESS)
  const usdtValue = BigInt(usdInPool[USDT_ADDRESS].balance)
  const ctUsdtValue = BigInt(usdInPool[CTUSDT_ADDRESS].balance)

  const usdTVL = usdtValue + ctUsdtValue;
  
  return { 
    ton: Number(tonTVL / BigInt(1e9)),
    usd: Number(usdTVL / BigInt(1e6))
  }
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
