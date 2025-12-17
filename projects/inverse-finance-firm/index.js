
const abi = require("./abi.json");
const { getLogs } = require('../helper/cache/getLogs')
const { staking } = require('../helper/staking');
const { sumTokens2 } = require("../helper/unwrapLPs");

const fromBlock = 16159015;
const DOLAs = [
  '0x865377367054516e17014CcdED1e7d814EDC9ce4',
  '0xb45ad160634c528Cc3D2926d9807104FA3157305'
].map(i => i.toLowerCase());

const lpsToBreak = [
  '0x08c0833af1331831759b8e0bfef1bc5738436325', // yvCurve-sDOLA-scrvUSD-f
  '0x8a5f20da6b393fe25acf1522c828166d22ef8321', // yvCurve-DOLA-wstUSR-f
  '0x1fc80cfcf5b345b904a0fb36d4222196ed9eb8a5', // yvCurve-DOLA-sUSDe-f
  '0xcc2efb8bedb6ed69adee0c3762470c38d4730c50', // yvCurve-DOLA-FRAXPYUSD-f
  '0x57a2c7925baa1894a939f9f6721ea33f2ecfd0e2', // yvCurve-DOLA-USR-f
  '0x342d24f2a3233f7ac8a7347fa239187bfd186066', // yvCurve-DOLA-sUSDS-f
].map(i => i.toLowerCase());

async function removeDolaFromLps(api, owners) {
  const [yvRates, underlyingLps] = await Promise.all([
    api.multiCall({ abi: 'uint256:pricePerShare', calls: lpsToBreak }),
    api.multiCall({ abi: 'address:token', calls: lpsToBreak }),
    sumTokens2({
      api,
      owners,
      tokens: lpsToBreak,
    })
  ])

  const [token0s, token1s, lpSupplies] = await Promise.all([
    api.multiCall({ abi: 'function coins(uint256) view returns (address)', calls: underlyingLps.map(target => ({ target, params: 0 })) }),
    api.multiCall({ abi: 'function coins(uint256) view returns (address)', calls: underlyingLps.map(target => ({ target, params: 1 })) }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: underlyingLps }),
  ])

  const [token0Balances, token1Balances] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: token0s.map((target, i) => ({ target, params: underlyingLps[i] })) }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: token1s.map((target, i) => ({ target, params: underlyingLps[i] })) }),
  ])
  
  lpsToBreak.forEach((lp, i) => {
    const balance = api._balances._balances[`${api.chain}:${lp}`]
    delete api._balances._balances[`${api.chain}:${lp}`]

    const poolBalances = [token0Balances[i], token1Balances[i]]
    const poolTokens = [token0s[i], token1s[i]]

    const lpHeld = yvRates[i] * balance / 1e18
    const notDolaIndex = DOLAs.includes(token0s[i].toLowerCase()) ? 1 : 0

    const notDolaBalance = poolBalances[notDolaIndex] * lpHeld / lpSupplies[i]
    api.add(poolTokens[notDolaIndex], notDolaBalance)
  })
}

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: "0xAD038Eb671c44b853887A7E32528FaB35dC5D710",
    topics: ['0xc3dfb88ee5301cecf05761fb2728064e5b641524346ae69b9ba80394631bf11f'],
    fromBlock,
    eventAbi: abi.AddMarket,
    extraKey: "fix-firm"
  })
  
  // unique markets
  const markets = [...new Set(logs.map(i => i.args.market))]

  let owners = await Promise.all(
    markets.map(async m => {
      const logs = await getLogs({
        api,
        target: m,
        topic: "CreateEscrow(address,address)",
        fromBlock,
        eventAbi: abi.CreateEscrow,
      })
      return logs.map(i => i.args.escrow)
    })
  );
  owners = owners.flat()

  const allEscrowTokens = await api.multiCall({  abi: 'address:token', calls: owners})
  const uniqueEscrowTokens = [...new Set(allEscrowTokens.flat())]
  const symbols = await api.multiCall({  abi: 'erc20:symbol', calls: uniqueEscrowTokens })
  const tokens = uniqueEscrowTokens.filter((t, i) => {
     if (lpsToBreak.includes(t.toLowerCase())) return false
     if (symbols[i].toLowerCase().includes('dola')) {
      console.log(`${symbols[i]} at ${t} is not being counted as it contains DOLA and hasnt been broken down`)
      return false
     }
     return true 
  })

  await removeDolaFromLps(api, owners)

  return await sumTokens2({
    api,
    owners,
    tokens, 
    unwrapAll: true
  });
}

module.exports = {
  methodology: "Get collateral balances from users personal escrows",
  hallmarks: [
    [1707177600, "Launch of sDOLA"],
    [1718236800, "CRV liquidation"]    
  ],
  start: '2022-12-10', // Dec 10 2022
  ethereum: {
    tvl,
    staking: staking("0x1637e4e9941D55703a7A5E7807d6aDA3f7DCD61B", "0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68")
  }
};