const BigNumber = require('bignumber.js')
const { request, gql } = require("graphql-request");

const graphUrl = 'https://back-mainnet.kord.fi/v1/graphql';
const tvlDataQuery = gql`
query TvlDataQuery {
    contractInfo {
        tzbtcDeposit
        tzbtcDepositIndex
        xtzDeposit
        xtzDepositIndex
        xtzLbShares
        tzbtcLbShares
    }
    externalInfo {
        tzbtcRate
        xtzRate
        lbXtzRate
        lbTzbtcRate
    }
}
`

async function fetch() {
    const data = (await request(graphUrl, tvlDataQuery));
    const depositTvl = (
        BigNumber(data['contractInfo'][0]['tzbtcDeposit'])
        .times(data['contractInfo'][0]['tzbtcDepositIndex'])
        .dividedBy(100000000)
        .times(data['externalInfo'][0]['tzbtcRate'])
        .plus(BigNumber(data['contractInfo'][0]['xtzDeposit'])
              .times(data['contractInfo'][0]['xtzDepositIndex'])
              .dividedBy(1000000)
              .times(data['externalInfo'][0]['xtzRate']))
    );
    const farmTvl = (
        BigNumber(data['contractInfo'][0]['tzbtcLbShares'])
        .times(data['externalInfo'][0]['lbTzbtcRate'])
        .times(data['externalInfo'][0]['tzbtcRate'])
        .plus(BigNumber(data['contractInfo'][0]['xtzLbShares'])
              .times(data['externalInfo'][0]['lbXtzRate'])
              .times(data['externalInfo'][0]['xtzRate']))
    );
    return parseFloat(depositTvl.plus(farmTvl).toFixed(2));
}

module.exports = {
    fetch,
}
