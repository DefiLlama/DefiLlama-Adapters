const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

// Addresses
const BANK = 'L7ttnK2Comjkxxhyykdat7cCYLN7yrMJz6jCYmQGd5nu8Ma9mHi1JEiCNsxgmxAvDd5vuDMRkjiwQU11JHsizheespaEu4AaH41a2NzR2JbUsaTWVEg7jCBeMXCUbetnrsSLPCqZUb4PhnvE2sGV21E8LGyZyMjtWQqcauyB297d8d7aUCgKsbgZocqRsKZdeH185yxERavMEsb9R8ifqpbD4FVTNwWV6kixAQrMrwzp1wvheEk9t931iQXH9A2X4SJ4JR3eByqcHbWWAHoNs2gL2tpWa6fkVdCs2Kqgd7LgH7u9VFGEzACibuFzanQfNNZsic6Q1ndG97ebFoGVArfMNdvFMbxo1raYuqg4oFEeTY3aNXhhtgCfZWgt2AKz1mtKdZNLRBsWt83LKTiTQLrqBVNBurD2ojUnTV4r5deV'
const LP = '3W5ZTNTWAwgjcNhctkBccWeUVruJJVLATdYp1makMwoP78WiW2MDjMd2HKxZ2eUwtaSrhtRujuvi27k49msqFVAi7T2BsVHvMCHQ879nf5oJvuXjhEshf76EZgrijL3v3KcEA8CYi511YFtwN1b9u7ZUXeQSSUhqcMvyXMwaCZrpZsgCfbiLxk2DQMrngBMUh96vh7cBfPxZWhsZ9DGUtkGhiquqH3DcgFhpP33rRMjanCRXPAx9SbbphH3RBA2Z9K9j9TvWV6PnUafVGSpixUS8eawxUCiAuUAZHttXK9DjWqzeTDxDH9Tz1gSyjy7aKokwZyoAGTEafuiNQQrJ1UVfuVJCHPUD5v9eomJLmLVqdVDEUm7gj6Qj9a2cEKDfzedex977RkqXvuaeUdaumcikVCr9spzgmv7rhFCovdzAJscwTio98iRGS9rqcnUoTZFN6YmNJPXKe3krdQ7c9yvv74Ad7SBQmvNyuMkchFRnbPRozogKzV3xmTMxpLzagjQ1AdcP'

// Token: USE
const USE = 'a55b8735ed1a99e46c2c89f8994aacdf4b1109bdcf682f1e5b34479c6e392669'

module.exports = {
  ergo: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        // Count ERG in both BANK and LP
        [ADDRESSES.null, BANK],
        [ADDRESSES.null, LP],
      ],
    }),
  },
}
