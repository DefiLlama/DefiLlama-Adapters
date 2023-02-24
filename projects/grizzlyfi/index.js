const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const abi = "uint256:grizzlyStrategyDeposits"

const hives = [
  {
    hive: "0xDa0Ae0710b080AC64e72Fa3eC44203F27750F801",
    token: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16"
  },
  {
    hive: "0x8D83Ad61Ae6eDE4274876EE9ad9127843ba2AbF7",
    token: "0xEc6557348085Aa57C72514D67070dC863C0a5A8c"
  },
  {
    hive: "0xE4Dbb05498C42A6E780e4C6F96A4E20a7D7Cb1d6",
    token: "0x7EFaEf62fDdCCa950418312c6C91Aef321375A00"
  },
  {
    hive: "0x66B1bACAB888017cA96abBf28ad8d10B7A7B5eC3",
    token: "0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1"
  },
  {
    hive: "0x9F45E2181D365F9057f67153e6D213e2358A5A4B",
    token: "0x66FDB2eCCfB58cF098eaa419e5EfDe841368e489"
  },
  {
    hive: "0x3cbF1d01A650e9DB566A123E3D5e42B9684C6b6a",
    token: "0xEa26B78255Df2bBC31C1eBf60010D78670185bD0"
  },
  {
    hive: "0x6fc2FEed99A97105B988657f9917B771CD809f40",
    token: "0xF45cd219aEF8618A92BAa7aD848364a158a24F33"
  }
];

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  block = chainBlocks.bsc;

  const [{ output: bnbBalance }, { output: hiveBalances }] = await Promise.all([
    sdk.api.eth.getBalance({
      target: "0x1022a84f347fc1E6D47128E5364C9Aa1f43a2630",
      block: chainBlocks.bsc,
      chain: "bsc"
    }),
    sdk.api.abi.multiCall({
      calls: hives.map(h => ({ target: h.hive })),
      abi,
      chain: "bsc",
      block
    })
  ]);

  const lpPositions = hiveBalances.map((b, i) => ({
    balance: b.output,
    token: hives[i].token
  }));

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    "bsc",
    await transformBscAddress()
  );

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    bnbBalance
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl,
    pool2: pool2(
      "0xF530B259fFf408aaB2B02aa60dd6fe48FCDC2FC9",
      "0x352008bf4319c3B7B8794f1c2115B9Aa18259EBb",
      "bsc"
    ),
    staking: stakings(
      [
        "0x6F42895f37291ec45f0A307b155229b923Ff83F1", 
        "0xB80287c110a76e4BbF0315337Dbc8d98d7DE25DB"
      ],
      "0xa045e37a0d1dd3a45fefb8803d22457abc0a728a",
      "bsc"
    )
  }
};
