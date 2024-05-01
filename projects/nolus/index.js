const sdk = require("@defillama/sdk");
const { transformBalances } = require("../helper/portedTokens");
const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')

// Osmosis
const osmosisLeaserAddr = 'nolus1wn625s4jcmvk0szpl85rj5azkfc6suyvf75q6vrddscjdphtve8s5gg42f'
const osmosisLppAddr = 'nolus1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3sqaa3c5'

// Neutron (Astroport)
const neutronLeaserAddr = 'nolus1et45v5gepxs44jxewfxah0hk4wqmw34m8pm4alf44ucxvj895kas5yrxd8'
const neutronLppAddr = 'nolus1qqcr7exupnymvg6m63eqwu8pd4n5x6r5t3pyyxdy7r97rcgajmhqy3gn94'

const _6Zeros = 1000000
const denomsMapping = {
  "neutron": {
    "ATOM": "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
    "DYDX": "ibc/2CB87BCE0937B1D1DFCEE79BE4501AAF3C265E923509AEAC410AD85D27F35130",
    "NLS": "ibc/6C9E6701AC217C0FC7D74B0F7A6265B9B4E3C3CDA6E80AADE5F950A8F52F9972",
    "NTRN": "neutron:untrn",
    "ST_ATOM": "ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C",
    "ST_TIA": "ibc/6569E05DEE32B339D9286A52BE33DFCEFC97267F23EF9CFDE0C055140967A9A5",
    "STK_ATOM": "ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445",
    "TIA": "ibc/773B4D0A3CD667B2275D5A4A7A2F0909C0BA0F4059C0B9181E680DDF4965DCC7",
    "USDC_AXELAR": "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
    "USDC_NOBLE": "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81"
  },
  "osmosis": {
    "AKT": "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
    "ATOM": "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    "AXL": "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
    "CRO": "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
    "DYM": "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
    "EVMOS": "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
    "INJ": "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
    "JKL": "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
    "JUNO": "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    "LVN": "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
    "MARS": "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
    "MILK_TIA": "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
    "NLS": "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
    "OSMO": "osmosis:uosmo",
    "PICA": "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
    "Q_ATOM": "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
    "QSR": "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
    "SCRT": "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    "ST_ATOM": "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
    "ST_OSMO": "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
    "ST_TIA": "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
    "STARS": "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
    "STK_ATOM": "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
    "STRD": "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    "TIA": "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
    "USDC": "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
    "USDC_AXELAR": "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
    "USDC_NOBLE": "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
    "WBTC": "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
    "WETH": "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5"
  }
}

async function getLeaseCodeId(leaserAddress) {
  const leaserContract = await queryContract({
    contract: leaserAddress,
    chain: "nolus",
    data: { config: {} }
  })

  const leaseCodeId = leaserContract?.config?.lease_code
  if (!leaseCodeId) {
    return 0
  }

  return leaseCodeId
}

async function getLeaseContracts(leaseCodeId) {
  return await queryContracts({
    chain: "nolus",
    codeId: leaseCodeId,
  })
}

async function getLeases(leaseAddresses) {
  return await queryManyContracts({
    permitFailure: true,
    contracts: leaseAddresses,
    chain: "nolus",
    data: {}
  })
}

async function getLppTvl(lppAddresses) {
  const lpps = await queryManyContracts({
    contracts: lppAddresses,
    chain: "nolus",
    data: { "lpp_balance": [] },
  })

  let totalLpp = 0
  lpps.forEach(v => {
    totalLpp += Number(v.balance.amount)
  })

  return totalLpp / _6Zeros
}

function sumAssests(chain, leases) {
  let balances = {}
  leases.forEach(v => {
    if (v.opened) {
      const ticker = v.opened.amount.ticker
      const amount = parseInt(v.opened.amount.amount, 10)
      const denom = denomsMapping[chain][ticker]
      sdk.util.sumSingleBalance(balances, denom, amount)
    }
  })
  return balances
}

async function tvl(chain, leaserAddr) {
  const leaseCodeId = await getLeaseCodeId(leaserAddr)
  const leaseContracts = await getLeaseContracts(leaseCodeId)
  const leases = await getLeases(leaseContracts)
  const balances = sumAssests(chain, leases)
  return transformBalances("nolus", balances);
}

module.exports = {
  methodology: "The combined total of lending pool assets and the current market value of active leases",
  nolus: {
    tvl: async () => {
      return {
        'axlusdc': await getLppTvl([osmosisLppAddr, neutronLppAddr])
      }
    }
  },
  neutron: {
    tvl: async () => {
      return await tvl("neutron", neutronLeaserAddr)
    }
  },
  osmosis: {
    tvl: async () => {
      return await tvl("osmosis", osmosisLeaserAddr)
    }
  }
}

// node test.js projects/nolus/index.js
