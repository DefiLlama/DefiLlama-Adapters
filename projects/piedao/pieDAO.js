const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk')
const { sumTokens } = require('../helper/unwrapLPs');

const pies_config = require("./pies.json");
const ovens_config = require("./ovens.json");
const pools_config = require("./pools.json");

const pieABI = require("../config/piedao/abi/IPie.json");
const pieStakingAll = require("../config/piedao/abi/IStakingAll.json");
const IStakingBalancer = require("../config/piedao/abi/IStakingBalancer.json");
const IStakedToken = require("../config/piedao/abi/IStakedToken.json");
const IBPT = IStakedToken;
const IBCP = require("../config/piedao/abi/IBCP.json");
const IStakedPieDAO = IStakingBalancer;
const IStakingUniswap = IStakingBalancer;

module.exports = class PieDAO {
  constructor(block) {
    this.pies = pies_config;
    this.ovens = ovens_config;
    this.pools = pools_config;
    this.tokenAmounts = {};
    this.ovenAmounts = {};
  }

  async calculatePies() {
    const pieCalls = Object.values(this.pies).map(pie => ({ target: pie }))
    const { output: supplies } = await sdk.api.abi.multiCall({
      calls: pieCalls,
      abi: pieABI.totalSupply
    })
    const calls = supplies.map(({ input, output }) => ({
      target: input.target,
      params: [output],
    }))
    const { output: tokensAndAmountsAll } = await sdk.api.abi.multiCall({
      calls,
      abi: pieABI.calcTokensForAmount
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

  async calculateOvens() {
    const output = await sdk.api.eth.getBalances({
      targets: Object.values(this.ovens)
    })

    output.output.forEach(({ target, balance }) => {
      this.ovenAmounts[target] = (balance / 1e18)
    })
  }

  async calculatePools() {
    const balances = {}
    const hangingPromises = []
    for (const pool of Object.keys(this.pools)) {
      const stakingPool = this.pools[pool];
      const poolAddress = this.pools[pool].address;
      let underlyingBalance, underlyingSupply, underlyingAddress, underlyings, response, symbol = null;

      switch (stakingPool.type) {
        case "all":
          const { output: poolCount } = await sdk.api.abi.call({
            target: poolAddress,
            abi: pieStakingAll.poolCount
          })
          const poolCalls = []
          for (let i=0;i<poolCount;i++) 
            poolCalls.push({ target: poolAddress, params: [i]})
          const { output: underlyingTokens } = await sdk.api.abi.multiCall({
            calls: poolCalls,
            abi: pieStakingAll.getPoolToken
          })
          const tokens = underlyingTokens.map(i => i.output)
          const tokenCalls = tokens.map(t => ({ target: t }))
          const balanceCalls = tokens.map(t => ({ target: t, params: [poolAddress] }))
          let [{ output: symbols }, {output: underLyingBalances }, {output: totalSupplies }] = await Promise.all([
            sdk.api.abi.multiCall({ 
              calls: tokenCalls,
              abi: 'erc20:symbol'
            }),sdk.api.abi.multiCall({ 
              calls: balanceCalls,
              abi: 'erc20:balanceOf'
            }),sdk.api.abi.multiCall({ 
              calls: tokenCalls,
              abi: 'erc20:totalSupply'
            }),
          ])
          symbols = symbols.map(i => i.output)
          underLyingBalances = underLyingBalances.map(i => i.output)
          totalSupplies = totalSupplies.map(i => i.output)


          for (let i = 0; i < poolCount; i++) {
            underlyingAddress = tokens[i];
            underlyingBalance = underLyingBalances[i];
            underlyingSupply = new BigNumber(totalSupplies[i]);
            symbol = symbols[i]

            switch (symbol) {
              case "SLP":
                hangingPromises.push(sumTokens(balances, [[underlyingAddress, poolAddress]]))
                break;
              case "BPT":
                response = await sdk.api.abi.call({ 
                  target: underlyingAddress,
                  abi: IBPT.getFinalTokens
                })
                underlyings = response.output
                hangingPromises.push(this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply))

                break;
              case "BCP":
                response = await sdk.api.abi.call({ 
                  target: underlyingAddress,
                  abi: IBCP.getTokens
                })
                underlyings = response.output
                hangingPromises.push(this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply))
                break;
            }
          }
          break;

        case "balancer":
          underlyingAddress = stakingPool.lp ? stakingPool.lp : (await sdk.api.abi.call({ 
            target: poolAddress,
            abi: IStakingBalancer.uni
          })).output;
          //console.log("calculatePools", stakingPool.type, underlyingAddress);

          underlyingBalance = new BigNumber((await sdk.api.erc20.balanceOf({ target: underlyingAddress, owner: poolAddress })).output);
          underlyingSupply = new BigNumber((await sdk.api.erc20.totalSupply({ target: underlyingAddress })).output);

          response = await sdk.api.abi.call({ 
            target: underlyingAddress,
            abi: IStakedToken.getFinalTokens
          })
          underlyings = response.output
          hangingPromises.push(this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply))
          break;

        case "piedao":
          response = await sdk.api.abi.call({ 
            target: poolAddress,
            abi: IStakedPieDAO.uni
          })
          underlyingAddress = response.output
          underlyingBalance = new BigNumber((await sdk.api.erc20.balanceOf({ target: underlyingAddress, owner: poolAddress })).output);
          underlyingSupply = new BigNumber((await sdk.api.erc20.totalSupply({ target: underlyingAddress })).output);

          response = await sdk.api.abi.call({ 
            target: underlyingAddress,
            abi: IBCP.getTokens
          })
          underlyings = response.output
          hangingPromises.push(this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply))
          break;

        case "uniswap":
          response = await sdk.api.abi.call({ 
            target: poolAddress,
            abi: IStakingUniswap.uni
          })
          underlyingAddress = response.output
          hangingPromises.push(sumTokens(balances, [[underlyingAddress, poolAddress]], ))
          break;
      }
    }

    await Promise.all(hangingPromises)
    Object.keys(balances).forEach(token => this.pushTokenAmount(token, BigNumber(balances[token])))
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
    // Prevent double counting of TVL by excluding pies
    /*
    if(Object.keys(this.pies).find(x => this.pies[x].toLowerCase() == token.toLowerCase())) {
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