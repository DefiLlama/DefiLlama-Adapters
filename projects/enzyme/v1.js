/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const _ = require("underscore");
const BigNumber = require("bignumber.js");

/*==================================================
  Settings
  ==================================================*/

const versions = [
  "0xCB6c6Bdf0AA4cF0188518783b871931EFB64248f",
  "0x01Bde0b02740D6311e4a87CA112DeEEddb057EFB",
  "0x5f9AE054C7F0489888B1ea46824b4B9618f8A711"
];

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {
  let balances = {};

  let latestIds = (
    await sdk.api.abi.multiCall({
      block,
      calls: _.map(versions, version => {
        return {
          target: version
        };
      }),
      abi: {
        constant: true,
        inputs: [],
        name: "getLastFundId",
        outputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      }
    })
  ).output;

  let fundCalls = [];

  _.each(latestIds, latestId => {
    // edge case error where getLastFundId reports incorrectly with a very high number
    // possible overflow bug or different output type by design to signal error
    // check for reasonable number string length to mitigate
    if (latestId.success && latestId.output.length < 10) {
      let ids = _.range(Number(latestId.output) + 1);

      _.each(ids, id => {
        fundCalls.push({
          target: latestId.input.target,
          params: id
        });
      });
    }
  });

  let funds = (
    await sdk.api.abi.multiCall({
      block,
      calls: fundCalls,
      abi: {
        constant: true,
        inputs: [
          {
            name: "withId",
            type: "uint256"
          }
        ],
        name: "getFundById",
        outputs: [
          {
            name: "",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      }
    })
  ).output;

  let accountingCalls = _.map(
    _.uniq(
      _.pluck(
        _.filter(funds, fund => {
          return fund.success;
        }),
        "output"
      )
    ),
    fund => {
      return {
        target: fund
      };
    }
  );

  let accounting = (
    await sdk.api.abi.multiCall({
      block,
      calls: accountingCalls,
      abi: {
        constant: true,
        inputs: [],
        name: "accounting",
        outputs: [
          {
            name: "",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      }
    })
  ).output;

  let holdingCalls = [];

  _.each(accounting, account => {
    if (account.success) {
      holdingCalls.push({
        target: account.output
      });
    }
  });

  let fundHoldings = (
    await sdk.api.abi.multiCall({
      block,
      calls: holdingCalls,
      abi: {
        constant: false,
        inputs: [],
        name: "getFundHoldings",
        outputs: [
          {
            name: "",
            type: "uint256[]"
          },
          {
            name: "",
            type: "address[]"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    })
  ).output;

  _.each(fundHoldings, holdings => {
    if (holdings.success) {
      let output = _.zip(holdings.output[1], holdings.output[0]);

      _.each(output, balance => {
        let address = balance[0];
        let value = balance[1];
        balances[address] = BigNumber(balances[address] || 0)
          .plus(value)
          .toFixed();
      });
    }
  });

  return balances;
}
