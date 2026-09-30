const sui = require("../helper/chain/sui")
const { fetchURL } = require('../helper/utils')

function getDecimalShifts(dynamicFields){
  return fetchURL(`https://coins.llama.fi/prices/current/${dynamicFields.map(c=>`sui:0x${c.fields.value.fields.coin_type}`).join(',')}`).then(r=>r.data.coins)
}

// Storage objects of every NAVI lending market (from https://open-api.naviprotocol.io/api/navi/markets and /api/navi/config?market=<key>)
const storageIds = {
  main: "0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe",
  ember: "0xc2b6a52f0da7f91389eaffe4f68f4cacee43aa616bb8a4371118eafaf07cdd90",
  rwa: "0x199c1d5c2d58a4b05bbfa2338d02ad2676572a8a59ac148a5475b5c0fc53ed9f",
  "sui-eco": "0xdf18372bc9c588b96c7553bc811467a9166ed9be472b40cb45c226175377c558",
  "sui-usdc": "0x51c5ad179214eb5e170dd93ba6f9b15948002caf85f7e2b091ef46d2dc2ce5b6",
  "wbtc-usdc": "0x79db6cdbfb59a067be7d78c1003079f56d817ac33b5d372b3165daf09f31ed69",
  "xbtc-usdc": "0x7db5c000524bfe55bb2bc343886f29eabc38f706dc1655900055fa5b60ee00a5",
  "vsui-usdc": "0x35fecf669e7794ad25d289c2a23f065e518351acae09c5032d7237e185257924",
  "vsui-sui": "0xafb982de1a436b1cc8a14ecd2d787762599b65d3a6b75b84b10939b1e17d9381",
  "hasui-sui": "0x6b945adccadf11cd7ec39f8c2c225a4267004a74587871cac86f9fa3dbf3be63",
  "high-usdc": "0x2056ca72f7c81c3fb6b3a6eea117368cad7fb0c9caa4e2a7b51ee913e9e5deb9",
}

async function getReserves() {
  const storageObjects = await sui.getObjects(Object.values(storageIds))
  const reserves = []
  for (const storageObject of storageObjects) {
    const reservesId = storageObject.fields.reserves.fields.id.id
    reserves.push(...await sui.getDynamicFieldObjects({ parent: reservesId }))
  }
  const decimals = await getDecimalShifts(reserves)
  return { reserves, decimals }
}

async function borrow(api) {
  const { reserves, decimals } = await getReserves()

  reserves.forEach((data) => {
    const coin = '0x' + data.fields.value.fields.coin_type
    const borrowed = data.fields.value.fields.borrow_balance.fields.total_supply * data.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin]){
      const amount = borrowed * (10 ** (decimals["sui:"+coin].decimals - 9))
      api.add(coin, amount)
    }
  })
}


async function tvl(api) {
  const { reserves, decimals } = await getReserves()

  reserves.forEach(object => {
    const coin = '0x' + object.fields.value.fields.coin_type
    const total_supply = object.fields.value.fields.supply_balance.fields.total_supply * object.fields.value.fields.current_supply_index / 1e27
    const borrowed = object.fields.value.fields.borrow_balance.fields.total_supply * object.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin]){
      const amount = (total_supply - borrowed) * (10 ** (decimals["sui:"+coin].decimals - 9))
      api.add(coin, amount)
    }
  })
}


module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed: borrow,
  },
}
