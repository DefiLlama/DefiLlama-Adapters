const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformHecoAddress } = require("../helper/portedTokens");

const HECOPOOL_CONTRACT = "0xFB03e11D93632D97a8981158A632Dd5986F5E909";
const BANK_CONTRACT = "0xD42Ef222d33E3cB771DdA783f48885e15c9D5CeD";

const farmingPools = [
  // pHT non-loss
  "0x82fBD740824B4A3d699BA9d676A5443f350b59ab",
  // pUSDT non-loss
  "0x70Be80d70083eB2BB088D95ef274a1B88e6598Ac",
  // pHBTC non-loss
  "0x86ffc35a3cd6f03A96558783fFA2e08C9D01cf05",
  // pETH non-loss
  "0x02e31AbB76b643126B4ADd8b38010B074A7E3E64",
  // PTD/HT no leveraged liquidity
  "0x85dcaec17af51e3759e4e443f36780d5543e7fc6",
  // PTD/pUSDT no leveraged liquidity
  "0xf8562DBc2FeAcb9F1C297aF49d73E11a62BC3616",
  // HT/USDT leveraged liquidity
  "0xe07da19386eacf88f62b2b0aeb336a5903bb02da",
  // HBTC/USDT leveraged liquidity
  "0x155b6c4a7663bd0afbd6e4fac4d8e128aa229b5f",
  // ETH/USDT leveraged liquidity
  "0xa37692234b8ed150bb7b2d03611139f9da401936",
];

const tokens = [
  // USDT:
  "0xa71EdC38d189767582C38A3145b5873052c3e47a",
  // HBTC:
  "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa",
  // ETH:
  "0x64FF637fB478863B7468bc97D30a5bF3A428a1fD",
  // HUSD:
  "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047",
  // HFIL
  "0xae3a768f9ab104c69a7cd6041fe16ffa235d1810",
  // HPT
  "0xe499ef4616993730ced0f31fa2703b92b50bb536",
  // HDOT
  "0xa2c49cee16a5e5bdefde931107dc1fae9f7773e3",
  // HLTC
  "0xecb56cf772b5c9a6907fb7d32387da2fcbfb63b4",
  // MDX
  "0x25d2e80cb6b86881fd7e07dd263fb79f4abe033c",
  // P.TD
  "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
  // COCO
  "0x8871da134f113f6819ba106df2b95af5bac90eb8",
  // BXH
  "0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0",
  // HPT
  "0xe499ef4616993730ced0f31fa2703b92b50bb536",
  // PIPI
  "0xaaae746b5e55d14398879312660e9fde07fbc1dc",
];

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  // BANK_CONTRACT related
  const totalToken = (
    await sdk.api.abi.multiCall({
      abi: abi.totalToken,
      calls: tokens.map((token) => ({
        target: BANK_CONTRACT,
        params: token,
      })),
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output.map((tt) => tt.output);

  for (let index = 0; index < tokens.length; index++) {
    sdk.util.sumSingleBalance(
      balances,
      `heco:${tokens[index]}`,
      totalToken[index]
    );
  }

  // Farming pools related
  const hecoPoolId = (
    await sdk.api.abi.multiCall({
      abi: abi.hecoPoolId,
      calls: farmingPools.map((fps) => ({
        target: fps,
      })),
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output.map((st) => st.output);

  const stakingToken = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: farmingPools.map((fps) => ({
        target: fps,
      })),
      chain: "heco",
      block: chainBlocks["heco"],
    })
  ).output.map((st) => st.output);

  const lpPositions = [];

  for (let index = 4; index < farmingPools.length; index++) {
    if (index > 3) {
      // LP tokens - reward contracts
      const balance = (
        await sdk.api.abi.call({
          abi: abi.userInfo,
          target: HECOPOOL_CONTRACT,
          params: [(pid = hecoPoolId[index]), (farm = farmingPools[index])],
          chain: "heco",
          block: chainBlocks["heco"],
        })
      ).output[0];

      lpPositions.push({
        token: stakingToken[index],
        balance,
      });
    } else {
      // Single side staking reward contracts
      const balance = await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: stakingToken[index],
        params: farmingPools[index],
        chain: "heco",
        block: chainBlocks["heco"],
      });

      sdk.util.sumSingleBalance(
        balances,
        `heco:${stakingToken[index]}`,
        balance
      );
    }
  }

  const transformAddress = await transformHecoAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["heco"],
    "heco",
    transformAddress
  );

  return balances;
};

module.exports = {
  heco: {
    tvl: hecoTvl,
  },
  tvl: sdk.util.sumChainTvls([hecoTvl]),
};
