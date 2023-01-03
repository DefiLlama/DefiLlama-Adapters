const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk')

const baskets_config = require("./baskets.json");

const pieABI = require("../config/piedao/abi/IPie.json");

module.exports = class baoBaskets {
  constructor(block) {
    this.baskets = baskets_config;
    this.tokenAmounts = {};
    this.ovenAmounts = {};
  }

  async calculateBaskets() {
    const basketCalls = Object.values(this.baskets).map(basket => ({ target: basket }))
    const { output: supplies } = await sdk.api.abi.multiCall({
      calls: basketCalls,
      abi: pieABI.find(i => i.name === 'totalSupply')
    })
    const calls = supplies.map(({ input, output }) => ({
      target: input.target,
      params: [output],
    }))
    const { output: tokensAndAmountsAll } = await sdk.api.abi.multiCall({
      calls,
      abi: pieABI.find(i => i.name === 'calcTokensForAmount')
    })
    for (let j = 0; j < tokensAndAmountsAll.length; j++) {
      const tokensAndAmounts = tokensAndAmountsAll[j].output
      for (let i = 0; i < tokensAndAmounts.tokens.length; i++) {
        const token = tokensAndAmounts.tokens[i];
        const amount = tokensAndAmounts.amounts[i];
        this.pushTokenAmount(token, amount);
      }
    }
  }
 
  async calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply) {
    const { output: balances } = await sdk.api.abi.multiCall({
      calls: underlyings.map(token => ({ target: token, params: [underlyingAddress] })),
      abi: 'erc20:balanceOf'
    })

    for (let i = 0;i<balances.length;i++) {
      const tokenAmount = new BigNumber(balances[i].output).times(underlyingBalance).div(underlyingSupply)
      this.pushTokenAmount(underlyings[i], tokenAmount)
    }
  }

  calculateNAV() {
    const balances = {}

    // Sum up nav
    for (const tokenAddress of Object.keys(this.tokenAmounts)) {
      const tokenAmount = this.tokenAmounts[tokenAddress];
      sdk.util.sumSingleBalance(balances, tokenAddress, tokenAmount.amount.toFixed(0))
    }

    balances['ethereum'] = 0;
    for (const ovenAddress of Object.keys(this.ovenAmounts)) {
      balances['ethereum'] += this.ovenAmounts[ovenAddress];
    }

    return balances;
  }

  pushTokenAmount(token, amount) {
    // Prevent double counting of TVL by excluding baskets
    /*
    if(Object.keys(this.baskets).find(x => this.baskets[x].toLowerCase() == token.toLowerCase())) {
        return;
    }
    */

    if (this.tokenAmounts[token] == undefined) {

      //create empty object
      this.tokenAmounts[token] = {
        decimals: 0,
        amount: BigNumber(0),
        price: 0
      };
    }

    this.tokenAmounts[token].amount = this.tokenAmounts[token].amount.plus(amount)
  }
}