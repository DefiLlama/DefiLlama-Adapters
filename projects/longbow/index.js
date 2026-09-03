const { getLogs2 } = require("../helper/cache/getLogs")
const abi = require("../helper/abis/morpho.json")
const { nullAddress } = require("../helper/tokenMapping")

// Longbow creates and curates its own isolated markets on the Robinhood Chain Morpho Blue
// deployment. That deployment is shared with other curators — these 54 markets are a subset of the
// ~148 on it — so the singleton's token balances cannot be attributed by a token union the way a
// sole-curator deployment can. The markets are enumerated instead and each is attributed from its
// own state, which is closer to felix-vanilla's market-level shape than to a curator-vault sum.
//
// tvl per market = (totalSupplyAssets - totalBorrowAssets) + collateral
//   the first term is the loan-asset cash still held by the singleton for that market, which is
//   what sumTokens2 measures for a deployment you own outright; borrowed assets have left the
//   contract and are reported under borrowed instead.
//   the second term is the borrower collateral held against that market.
//
// Morpho exposes no aggregate collateral getter, and position() would mean enumerating every
// borrower, so collateral is replayed from the three events that move it. Vault deposits are not
// added on top: Longbow's vaults deploy their assets into these same markets, so they are already
// inside totalSupplyAssets and counting them again would double count. Morpho Blue reports these
// markets too, hence doublecounted.
const MORPHO = "0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010"
const FROM_BLOCK = 286

const eventAbis = {
  supplyCollateral: "event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)",
  withdrawCollateral: "event WithdrawCollateral(bytes32 indexed id, address caller, address indexed onBehalf, address indexed receiver, uint256 assets)",
  liquidate: "event Liquidate(bytes32 indexed id, address indexed caller, address indexed borrower, uint256 repaidAssets, uint256 repaidShares, uint256 seizedAssets, uint256 badDebtAssets, uint256 badDebtShares)",
}

// WSNET-NN is deliberately absent: that market belongs to NetNet, not Longbow. Longbow lists it
// as a partner market on its own frontend, but its supply and collateral are NetNet users' assets,
// so counting them here would attribute another protocol's book to this one.
const markets = [
  '0x7c820d6a09502d63be80bb8025ec479d29d7c06e70f8df65a92aaeed23a366e2', // ETH
  '0x66306c087add8907752320b309934abcc354d21626de8115c79df49d9c214edc', // NVDA
  '0x8b2af4d69ad861a4099b995b6279aeaf6a905225a0ee889bce424c7faf19b7d9', // AMZN
  '0x4edbd2f2f3b33bc5f80ab588def67fab8c10945fc99f855d80ff4bef2c4aa1f0', // SLV
  '0x7e6ebfdc58a893a5cddba0fba0483baf4fac2efece627ad50821dbe27d6f9738', // GOOGL
  '0x30a2a5f1a098b23ed91eadc4529a8d1c967f2cdc2e40a709f3a5992004b01ac0', // AAPL
  '0x14973a168cf6c6b1148309f5d567c255b292863ffe9cca59f4284e1426636f00', // RKLB
  '0xf049167e6bf18a1b41b8e2acefcf7bc9b13ea013d8d65c7fbc7cbaeb3fe9b4e2', // NBIS
  '0x8114b65dfc5e64222103e5588de261eca9defd25f47ea4ae2f91d49fe4fa2993', // CLSK
  '0x96d3d5f9bc842e4c8a935c5628abd02fb0e10115560c35a9add768781434f471', // CRWV
  '0x1b3555f7c1273688f01ae82da7dc8e508e6a7841ec0038dbb15767154a277b86', // EWY
  '0x039503b6308d6d818d181e626d3fbc667d6e68393c3d74332a6124cd2dd6e755', // CASHCAT_LEGACY
  '0x597227ca652ea5e8afb6e4801ecd766a4d6eb9b3b9fafa9127ba88a8b1f19629', // SPCX
  '0x50bc39b5722fb5634c436d74c6787f3c125b879e7b73cf9e9ecc01bbb57b8e55', // SPY
  '0x315b99abb698487891243a84afd28a5ff56fe02143f203c03edd3f103936bf60', // QQQ
  '0x4979137c23c8fb519cd507adc290944c3c2120e8a3191547531fced28360e9c2', // GME
  '0x6b8a1f62d88d1cd1e8de609aef07cafc8226172ba703e57c52c3730350e61df1', // USO
  '0xafc86936af4f7edf083eb2550b8c42311b83c685982742b9271b309a58268855', // MSFT
  '0xf6f3dbe0a19e948147e79e66502c6b05709d8dfde977fec7db1528fc8f0ebdfa', // SGOV
  '0x2ab6a14c9f68d4216dcb3b4e6ed607cf82f2e6badfa2bd5618d7f69d012d7fab', // USAR
  '0xb41b34c5989420ad080e79363a9cfe3e23bec7459fcd2d88029250da370288df', // TSLA
  '0x69400cfe81f2ae381b9a9f27076a4d637338379d999e9ffdfbde52f0876312ee', // META
  '0x4d2075836fd32183b10e5be1b383f6430de859df6d2bd5ec5b859970c4dd14e8', // AMD
  '0x9df4f54a2e46b35bd326cec97dbabc4203fa6c64a8e4182128f277adba8fefaf', // MU
  '0xb5ba72c0d55c353fa37c0bea104eb117afb2f4934473bcb736d2218ae5686746', // PLTR
  '0xda5584635e8b14ea18f674dbe4243365505910fefd8e3aa1ac9bfaac0eba74e8', // INTC
  '0x74fece475178af9e06d31fb64f405046a305f8f0abc588782f596d6f261c1fbb', // SNDK
  '0xee04847a312224d551d2267bb5c2c2695777af5fd1f05347bdcca397e8f54336', // ORCL
  '0x508b47fb12dbb8747644d4436aae65489b5f2819936adefc8a591323f64a5b01', // COIN
  '0x243ac165f79a75a0590d2e994ffa9e260b70292fd1ca134ace95f3640895b19f', // TSM
  '0x01baec96478004fc7b74c8dfe38abef8d716fea59ffd481b6ec74db915d3bc80', // MSTR
  '0xf0959f62e748938cf260ca6fe7cb21a412e0a6643913460f4a6770c3f4b90af6', // CRCL
  '0xbe881499e682850931951c998e76cfbf38c7979b1beeae7cbbb97a39b3336a07', // ASML
  '0xdd578ca54b4ef6a7827c6e9fc06905699a577f6e2f00712853d8aab13383bc38', // BABA
  '0xd8b502d5c43f6e5cfff7f938c7ef18e684f114fb5b362611981144397e5d5aef', // DELL
  '0x003390b057d753bd839981a0d45f9a567aa0b0ed6373fd42e951eac8ee86c2ba', // RGTI
  '0xc6e16cff2bcf185639562ab937b7a1c381522768ff16aefc85a25ff6ab1c45ea', // AI
  '0x071fb8a90e74f8b3ff3f517f581db96875f3b609a4f0f42efa5c158da9f4b0be', // NOTHING
  '0xaba3ac501ce4c6b80c08ed0dba19e1ac0de495f17af3ed692a38e92d176a6c9e', // PONS
  '0x6e6762ae397a2b3f2500ea2f48f8adce0eadfbf54cbc37f6108602e907e844ad', // INDEX
  '0x378713071c58206c6a826287d0051bcae113d83d6e3d3b6370b7e73128d06162', // STONKBROKER
  '0x6c12c02536aa27831f713d658b59f74e149cc62b48528cb74455e79fab32f772', // GLD
  '0x298e8ff9b31f22be90507bc61b55e66ab93e78b55a60593035e309ed93137cb8', // RDDT
  '0xb33399a677e1a21152fa9969f02c57a7a342e692ec45608a3fa0d3d92519c343', // COST
  '0x3be7fe1b6b439cfeb737d9921e9b83c92095a23a4f50aeee0d6d04f44446170f', // DJT
  '0x0066bc47b87597993af0bca6f526175c0abae011b764d4bf12a3def45e1f4e78', // NFLX
  '0x43c51f6ff44ab406ab9c97cb5512c881f4a7498209f94bbcfd874d8f97fad79d', // HIMS
  '0xe6284cf12d0603aee18ff5ab412e262cf99f120e967579111d7a51f37f276f54', // TTWO
  '0xe8d9b45cdbedc4401a3145be7726c9f72b715e03c5399c961439f11636ee9fb6', // MRNA
  '0x46eea143d473cdb8587505f8886dad452037f285f7729a7763e8c233c63b2e8e', // RIVN
  '0x8338aed363a309039b2f271a83558831e7e445f2d13c6e72c576ec0b8a969415', // RBLX
  '0xf47c7a7a1ff6c7444e6fcfa20a71f439e4525f4f9640fe6ba5c080f6f2a9d33f', // WSNET
  '0x4e92b336ecad6c842be20ae2ae27b28b3cf5ced6c5388a808167c03a8d75fdf8', // SPY-WETH
  '0x141c2b1d2bbecf7f8a76563307d7e5bf586457e873c3d97c4bb1502e57b77952', // NVDA-WETH
]

// Net collateral per market id, replayed from the only three events that change it.
async function collateralByMarket(api) {
  const wanted = new Set(markets.map((i) => i.toLowerCase()))
  const net = {}
  const apply = (id, delta) => {
    const key = id.toLowerCase()
    if (!wanted.has(key)) return
    net[key] = (net[key] || 0n) + delta
  }

  // getLogs keys its cache on chain/target, so three events against one singleton would share a
  // single entry and hand each sweep the wrong event's logs on a warm run. Each needs its own
  // extraKey — the same split 246Club uses when replaying these exact events.
  // toBlock is held back from the head because the cache is append-only: a log reorged out at the
  // tip would otherwise be cached permanently. helper/curators does the same.
  const safeBlock = (await api.getBlock()) - 200
  const sweep = async (eventAbi, extraKey) => {
    const args = { api, target: MORPHO, eventAbi, fromBlock: FROM_BLOCK, toBlock: safeBlock, onlyArgs: true, extraKey }
    try {
      return await getLogs2(args)
    } catch (e) {
      // A failed sweep would otherwise drop the whole collateral leg and report the protocol at a
      // fraction of its size. Fall back to whatever is already cached, as morpho-blue does.
      return getLogs2({ ...args, onlyUseExistingCache: true })
    }
  }

  const [supplied, withdrawn, liquidated] = await Promise.all([
    sweep(eventAbis.supplyCollateral, 'longbow-supplyCollateral'),
    sweep(eventAbis.withdrawCollateral, 'longbow-withdrawCollateral'),
    sweep(eventAbis.liquidate, 'longbow-liquidate'),
  ])

  supplied.forEach((i) => apply(i.id, BigInt(i.assets)))
  withdrawn.forEach((i) => apply(i.id, -BigInt(i.assets)))
  liquidated.forEach((i) => apply(i.id, -BigInt(i.seizedAssets)))

  // Collateral only moves through those three events, so a negative net means a log was dropped or
  // double counted. Fail loudly rather than silently contributing zero.
  for (const [id, amount] of Object.entries(net))
    if (amount < 0n) throw new Error(`longbow: negative collateral replayed for market ${id}`)

  return net
}

async function marketState(api) {
  const [params, data] = await Promise.all([
    api.multiCall({ target: MORPHO, abi: abi.morphoBlueFunctions.idToMarketParams, calls: markets }),
    api.multiCall({ target: MORPHO, abi: abi.morphoBlueFunctions.market, calls: markets }),
  ])
  return { params, data }
}

async function tvl(api) {
  const [{ params, data }, collateral] = await Promise.all([marketState(api), collateralByMarket(api)])

  markets.forEach((id, i) => {
    const supplied = BigInt(data[i].totalSupplyAssets || 0)
    const borrowedAssets = BigInt(data[i].totalBorrowAssets || 0)
    // Morpho accrues interest to both sides by the same amount and enforces
    // totalBorrowAssets <= totalSupplyAssets, so this cannot go negative. Defensive floor only.
    if (supplied > borrowedAssets) api.add(params[i].loanToken, supplied - borrowedAssets)

    const held = collateral[id.toLowerCase()] || 0n
    if (held > 0n && params[i].collateralToken !== nullAddress) api.add(params[i].collateralToken, held)
  })
}

async function borrowed(api) {
  const { params, data } = await marketState(api)
  markets.forEach((id, i) => {
    let amount = BigInt(data[i].totalBorrowAssets || 0)
    const supplied = BigInt(data[i].totalSupplyAssets || 0)
    if (amount > supplied) amount = supplied
    if (amount > 0n) api.add(params[i].loanToken, amount)
  })
}

module.exports = {
  doublecounted: true,
  start: '2026-07-10',
  methodology:
    "Counts the isolated Morpho markets Longbow curates on Robinhood Chain. For each market, TVL is the loan assets still held by Morpho for that market (supplied minus borrowed) plus the borrower collateral posted against it; outstanding debt is reported separately under borrowed. Attribution is market-level and deliberate: all supply and collateral in a Longbow-created market is counted, including deposits routed through third-party vaults, because the market is the product. Longbow's own vault deposits are supplied into these same markets, so they are counted once here rather than added again. Marked double counted because Morpho Blue reports the same markets.",
  robinhood: { tvl, borrowed },
}
