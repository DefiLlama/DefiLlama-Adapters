const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { sumTokensExport } = require("../helper/unwrapLPs");

const graphUrl = 'https://api.thegraph.com/subgraphs/name/arrenv/behodler'
const graphQuery = gql`
query get_tvl($block: Int) {
  behodlers(
    block: { number: $block }
  ) {
    id
    usdVolume
    usdLiquidity
  }
}
`;

async function tvl(timestamp, block) {
  const {behodlers} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(behodlers[0].usdLiquidity)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  methodology: `ERC20 tokens deposited as liquidity on the AMM. You can see this on https://analytics.behodler.io/#/, pulling the data from the 'arrenv/behodler' subgraph`,
  ethereum:{
    tvl: sumTokensExport({
      owner: '0x1B8568FbB47708E9E9D31Ff303254f748805bF21',
      tokens: [
        '0xaFEf0965576070D1608F374cb14049EefaD218Ec',
        '0x4f5704D9D2cbCcAf11e70B34048d41A0d572993F',
        '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
        '0x319eAd06eb01E808C80c7eb9bd77C5d8d163AddB',
        '0xF047ee812b21050186f86106f6cABDfEc35366c6',
        '0x155ff1A85F440EE0A382eA949f24CE4E0b751c65',
        '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
        '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        '0x4575f41308EC1483f3d399aa9a2826d74Da13Deb',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',
        '0x42476F744292107e34519F9c357927074Ea3F75D',
        '0x890ff7533Ca0C44F33167FdEEeaB1cA7E690634F',
      ],
      resolveLP: true,
    }),
  },
}