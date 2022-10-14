const { queryContractStore } = require('../helper/terra')
const { log } = require('../helper/utils')

const TERRA_MANAGER = 'terra1ajkmy2c0g84seh66apv9x6xt6kd3ag80jmcvtz'
const APERTURE_CONTRACT = 'terra1jvehz6d9gk3gl4tldrzd8qzj8zfkurfvtcg99x'
let openPositions = require('./openPositions.json')

const currentQueriedCount = 11190

async function terra_tvl() {
  let sumTvl = 0
  const { next_position_id } = await queryContractStore({
    contract: TERRA_MANAGER,
    queryParam: { get_next_position_id: {}, },
  })
  for (let i = currentQueriedCount; i < +next_position_id; i++)
    openPositions.push(i)

  log(next_position_id, currentQueriedCount, openPositions.length)
  const positions = openPositions
    .map((_value) => ({ chain_id: 3, position_id: `${_value}` }))

  const chunkSize = 50
  for (let i = 0; i < positions.length; i += chunkSize) {
    log('fetching %s of %s', i, positions.length)
    await Promise.all(positions.slice(i, i + chunkSize)
      .map(async position => {
        const {
          items: [{
            info: {
              position_close_info,
              detailed_info,
            }
          }]
        } = await queryContractStore({
          contract: APERTURE_CONTRACT,
          queryParam: getQuery(position),
        })

        if (!position_close_info)  // position is closed no need to add it to tvl
          sumTvl += +detailed_info.uusd_value

      }))
  }

  log('Final UST sum: %s', sumTvl)

  return {
    'terrausd': sumTvl / 1e6,
  }

  function getQuery(postion) {
    return { batch_get_position_info: { positions: [postion], } }
  }
}

const { BigNumber } = require("ethers");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const ORACLE = "0x5196e0a4fb2A459856e1D41Ab4975316BbdF19F8";
const USDC_TOKEN_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const vaultLibAddr = "0x16Ab749236B326905be4195Fe01CBB260d944a1d";
const vaultContracts = [
  "0x39471BEe1bBe79F3BFA774b6832D6a530edDaC6B", // Vault 0
  "0xFC7D93c51f1BCa3CEEbF71f30B4af3bf209115A0", // Vault 1
  "0x12D89E117141F061274692Ed43B774905433706A", // Vault 2
];

async function avax_tvl(timestamp, block, chainBlocks) {
  const ETHPx = (
    await sdk.api.abi.call({
      abi: abi.getETHPx,
      target: vaultLibAddr,
      params: [ORACLE, USDC_TOKEN_ADDRESS],
      chain: "avax",
      block: chainBlocks.avax,
    })
  ).output;

  const equityETHValues = (
    await sdk.api.abi.multiCall({
      abi: abi.getEquityETHValue,
      calls: vaultContracts.map((vc) => ({
        target: vc,
      })),
      chain: "avax",
      block: chainBlocks.avax,
    })
  ).output;

  const vaultLeverage = (
    await sdk.api.abi.multiCall({
      abi: abi.getLeverage,
      calls: vaultContracts.map((vc) => ({
        target: vc,
      })),
      chain: "avax",
      block: chainBlocks.avax,
    })
  ).output;

  let balances = {};
  const nVaults = vaultContracts.length;
  for (let i = 0; i < nVaults; i++) {
    const usdPriceETH = BigNumber.from(ETHPx)
      .mul(1e6)
      .div(BigNumber.from(2).pow(112));
    const equityValueUSD = BigNumber.from(equityETHValues[i].output)
      .mul(1e6)
      .div(usdPriceETH)
      .div(1e6);
    const leverage = BigNumber.from(vaultLeverage[i].output);
    const vaultValue = equityValueUSD.mul(leverage).div(10000).mul(1e6); // Adding USDC decimals () again here `mul(1e6)` because `sumSingleBalance` will remove them

    sdk.util.sumSingleBalance(
      balances,
      `avax:${USDC_TOKEN_ADDRESS}`,
      vaultValue
    );
  }

  return balances;
}

module.exports = {
  timetravel: false,
  avax: {
    avax_tvl,
  },
  terra: {
    terra_tvl,
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}
