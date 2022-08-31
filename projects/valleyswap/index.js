const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const masterchefAbi = require('./masterchef.abi.json');

function masterchefUsdTvl(masterchef, farms, chain, usdToken, usdTokenCode) {
  return async (timestamp, block, chainBlocks) => {
    const [
      lpsTotalSupply,
      decimals,
      balances,
      infos,
    ] = await Promise.all([
      sdk.api.abi.multiCall({
        abi: 'erc20:totalSupply',
        calls: farms.map((farm) => ({ target: farm.lp, params: [] })),
        block,
        chain,
      }),
      sdk.api.abi.multiCall({
        abi: 'erc20:decimals',
        calls: farms.flatMap((farm) => [
          { target: farm.lp, params: [] },
          { target: farm.token, params: [] },
          { target: farm.pair, params: [] },
        ]),
        block,
        chain,
      }),
      sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: farms.flatMap((farm) => [
          { target: farm.token, params: [farm.lp] },
          { target: farm.pair, params: [farm.lp] },
        ]),
        block,
        chain,
      }),
      sdk.api.abi.multiCall({
        abi: masterchefAbi.poolInfo,
        calls: farms.map((farm) => ({ target: masterchef, params: [farm.pid] })),
        block,
        chain,
      }),
    ]);

    const prices = {};
    return farms.reduce((tvl, farm, i) => {
      const [lpDecimals, tokenDecimals, pairDecimals] = decimals.output.slice(i * 3, i * 3 + 3);
      const [tokenInLp, pairInLp] = balances.output.slice(i * 2, i * 2 + 2);

      const lpTotalSupply = BigNumber(lpsTotalSupply.output[i].output).div(
        BigNumber(10).pow(lpDecimals.output)
      )
      const tokenBalance = BigNumber(tokenInLp.output).div(
        BigNumber(10).pow(tokenDecimals.output)
      );
      const pairBalance = BigNumber(pairInLp.output).div(
        BigNumber(10).pow(pairDecimals.output)
      );
      const staked = BigNumber(infos.output[i].output.totalStake).div(
        BigNumber(10).pow(farm.tokenOnly ? tokenDecimals.output : lpDecimals.output)
      );

      const tokenPrice = pairBalance.div(tokenBalance)
      let stakePrice = farm.tokenOnly ? tokenPrice : pairBalance.times(2).div(lpTotalSupply)
      if (farm.pair === usdToken) {
        prices[farm.token] = tokenPrice
      } else {
        stakePrice = stakePrice.times(prices[farm.pair])
      }

      tvl[usdTokenCode] = staked.times(stakePrice).plus(tvl[usdTokenCode] ?? '0')

      return tvl
    }, {});
  }
}

module.exports = {
  timetravel: true,
  start: 411656,
  oasis: {
    tvl: masterchefUsdTvl(
      '0xaE0aF27df228ACd8BA91AF0c917a31A9a681A097',
      [
        {
          pid: 0,
          tokenOnly: true,
          lp: '0x222B7A422D3F04E9c1FE91D54e2f0da944907b0A',
          token: '0xBC033203796CC2C8C543a5aAe93a9a643320433D',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 1,
          lp: '0x222B7A422D3F04E9c1FE91D54e2f0da944907b0A',
          token: '0xBC033203796CC2C8C543a5aAe93a9a643320433D',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 3,
          lp: '0x5f1412d91eFc8a9bd5c9408B685ADD2d596629dF',
          token: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 2, // requires 3 to be calculated first
          lp: '0x52DC3a8629dDe9c3001cD8e619301cB0eF6AAe62',
          token: '0xBC033203796CC2C8C543a5aAe93a9a643320433D',
          pair: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
        },
        {
          pid: 4,
          lp: '0xc94Bc60C8079DB3deED5AFd519Ba32726C53D831',
          token: '0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 5,
          lp: '0x46d8e7EB6e87c9C7f3F80dbcf4ECC5BFE37AA2Da',
          token: '0x010CDf0Db2737f9407F8CFcb4dCaECA4dE54c815',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 6,
          lp: '0x35a7e44EBeD5c91c636e90e7795dc51E36dA558d',
          token: '0xE9b38eD157429483EbF87Cf6C002cecA5fd66783',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 7,
          lp: '0x9a91Bc3Ed7d0d6422C7599CcdD8C2200bfD4A8eA',
          token: '0xBC033203796CC2C8C543a5aAe93a9a643320433D',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 8,
          lp: '0x1de062f069Ff1F1F32FE792C4078D6dDEaB04D99',
          token: '0xBC033203796CC2C8C543a5aAe93a9a643320433D',
          pair: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
        },
        {
          pid: 9,
          lp: '0x04A590B38438455792a4B906c9Dc63B7aA0CA316',
          token: '0x21C718C22D52d0F3a789b752D4c2fD5908a8A733',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 10,
          lp: '0x6755347199f6a2864936Cd467a1A2b03fBdeB9f9',
          token: '0x94fbfFe5698DB6f54d6Ca524DbE673a7729014Be',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 11,
          lp: '0x061b31c4af2E1338224CB46A15Fec86f509fcA00',
          token: '0x010CDf0Db2737f9407F8CFcb4dCaECA4dE54c815',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
        {
          pid: 12,
          lp: '0x9de37Ccf7d908D91d29931417374cC76bAc72e73',
          token: '0xE9b38eD157429483EbF87Cf6C002cecA5fd66783',
          pair: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
        },
      ],
      'oasis',
      '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
      'tether',
    ),
  }
};
