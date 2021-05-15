const utils = require('../helper/utils');
const BigNumber = require("bignumber.js");

const web3 = require('../config/web3.js');

const pies_config = require("./pies.json");
const ovens_config = require("./ovens.json");
const pools_config = require("./pools.json");

const pieABI = require("../config/piedao/abi/IPie.json");
const pieStakingAll = require("../config/piedao/abi/IStakingAll.json");
const IStakingBalancer = require("../config/piedao/abi/IStakingBalancer.json");
const IStakedToken = require("../config/piedao/abi/IStakedToken.json");
const ISLP = require("../config/piedao/abi/ISLP.json");
const IBPT = require("../config/piedao/abi/IBPT.json");
const IBCP = require("../config/piedao/abi/IBCP.json");
const IUniswap = require("../config/piedao/abi/IUniswap.json");
const IStakedPieDAO = require("../config/piedao/abi/IStakedPieDAO.json");
const IStakingUniswap = require("../config/piedao/abi/IStakingUniswap.json");
const erc20ABI = require("../config/piedao/abi/ERC20.json");

module.exports = class PieDAO {
  pies = null;
  ovens = null;
  pools = null;

  tokenAmounts = {};
  ovenAmounts = {};

  constructor() {
    this.pies = pies_config;
    this.ovens = ovens_config;
    this.pools = pools_config;
  }

  async calculatePies() {
    for (const pie of Object.keys(this.pies)) {  
      const pieAddress = this.pies[pie];   
      const pie_contract = new web3.eth.Contract(pieABI, pieAddress);
      const totalSupply = await pie_contract.methods.totalSupply().call();
      const tokensAndAmounts = await pie_contract.methods.calcTokensForAmount(totalSupply).call();
  
      //console.log("calculatePies", pieAddress);

      for(let i = 0; i < tokensAndAmounts.tokens.length; i ++) {
          const token = tokensAndAmounts.tokens[i];
          const amount = tokensAndAmounts.amounts[i];
          await this.pushTokenAmount(token, amount);
      }   
    }
  }

  async calculateOvens() {
    for (const oven of Object.keys(this.ovens)) {
      const ovenAddress = this.ovens[oven];

      const ovenBalance = await web3.eth.getBalance(ovenAddress);
      const eth_value = await utils.getPricesfromString("ethereum");
      this.ovenAmounts[ovenAddress] = (ovenBalance / 1e18) * eth_value.data.ethereum.usd;
    }
  }

  async calculatePools() {
    for (const pool of Object.keys(this.pools)) {
      const stakingPool = this.pools[pool];
      const poolAddress = this.pools[pool].address; 
      let stakingContract, underlyingContract, underlyingBalance, underlyingSupply, underlyingAddress, underlyings, symbol = null;

      switch(stakingPool.type) {
        case "all":
          stakingContract = new web3.eth.Contract(pieStakingAll, poolAddress);
          const poolCount = await stakingContract.methods.poolCount().call();

          for(let i = 0; i < poolCount; i++) {
            underlyingAddress = await stakingContract.methods.getPoolToken(i).call();
            underlyingContract = new web3.eth.Contract(erc20ABI, underlyingAddress);

            underlyingBalance = new BigNumber(await underlyingContract.methods.balanceOf(underlyingAddress).call());
            underlyingSupply = new BigNumber(await underlyingContract.methods.totalSupply().call());            

            symbol = await underlyingContract.methods.symbol().call();
            //console.log("calculatePools", stakingPool.type, underlyingAddress, symbol);

            switch(symbol) {
              case "SLP":
                underlyingContract = new web3.eth.Contract(ISLP, underlyingAddress);
                
                underlyings = new Array();
                underlyings.push(await underlyingContract.methods.token0().call());
                underlyings.push(await underlyingContract.methods.token1().call());
                await this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply);              

                break;
              case "BPT":
                underlyingContract = new web3.eth.Contract(IBPT, underlyingAddress);
                
                underlyings = await underlyingContract.methods.getFinalTokens().call();
                await this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply);  

                break;
              case "BCP":
                underlyingContract = new web3.eth.Contract(IBCP, underlyingAddress);
                
                underlyings = await underlyingContract.methods.getTokens().call();
                await this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply);                  
                break;                                
            }
          }
          break;
        
        case "balancer":
          stakingContract = new web3.eth.Contract(IStakingBalancer, poolAddress);
          underlyingAddress = stakingPool.lp ? stakingPool.lp : await stakingContract.methods.uni().call();
          //console.log("calculatePools", stakingPool.type, underlyingAddress);

          underlyingContract = new web3.eth.Contract(IStakedToken, underlyingAddress);
          underlyingBalance = new BigNumber(await underlyingContract.methods.balanceOf(poolAddress).call());
          underlyingSupply = new BigNumber(await underlyingContract.methods.totalSupply().call());

          underlyings = await underlyingContract.methods.getFinalTokens().call();
          await this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply);
          
          break;
        
        case "piedao":
          stakingContract = new web3.eth.Contract(IStakedPieDAO, poolAddress);
          underlyingAddress = await stakingContract.methods.uni().call();

          underlyingContract = new web3.eth.Contract(IBCP, underlyingAddress);

          underlyingBalance = new BigNumber(await underlyingContract.methods.balanceOf(underlyingAddress).call());
          underlyingSupply = new BigNumber(await underlyingContract.methods.totalSupply().call());            

          symbol = await underlyingContract.methods.symbol().call();
          //console.log("calculatePools", stakingPool.type, underlyingAddress, symbol);
                
          underlyings = await underlyingContract.methods.getTokens().call();
          await this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply);               
                
          break;

        case "uniswap":
          stakingContract = new web3.eth.Contract(IStakingUniswap, poolAddress);
          underlyingAddress = await stakingContract.methods.uni().call();

          underlyingContract = new web3.eth.Contract(IUniswap, underlyingAddress);

          underlyingBalance = new BigNumber(await underlyingContract.methods.balanceOf(underlyingAddress).call());
          underlyingSupply = new BigNumber(await underlyingContract.methods.totalSupply().call());            

          symbol = await underlyingContract.methods.symbol().call();
          //console.log("calculatePools", stakingPool.type, underlyingAddress, symbol);
                
          underlyings = new Array();
          underlyings.push(await underlyingContract.methods.token0().call());
          underlyings.push(await underlyingContract.methods.token1().call());
          await this.calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply); 

          break;
      }
    }
  }

  async calculateUnderLyings(underlyings, underlyingAddress, underlyingBalance, underlyingSupply) {
    for(const underlying of underlyings) {
      const underlyingContract = new web3.eth.Contract(erc20ABI, underlying);
      const tokenAmount = new BigNumber(await underlyingContract.methods.balanceOf(underlyingAddress).call());
      await this.pushTokenAmount(underlying, tokenAmount.times(underlyingBalance).div(underlyingSupply));
    }     
  }

  calculateNAV() {
    let nav = 0;

    // Sum up nav
    for (const tokenAddress of Object.keys(this.tokenAmounts)) {
        const tokenAmount = this.tokenAmounts[tokenAddress];

        nav += tokenAmount.amount * tokenAmount.price;
    }

    for (const ovenAddress of Object.keys(this.ovenAmounts)) {
      nav += this.ovenAmounts[ovenAddress];
    }

    return nav;    
  }

  async pushTokenAmount(token, amount) {
    // Prevent double counting of TVL by excluding pies
    /*
    if(Object.keys(this.pies).find(x => this.pies[x].toLowerCase() == token.toLowerCase())) {
        return;
    }
    */

    if(this.tokenAmounts[token] == undefined) {

        //create empty object
        this.tokenAmounts[token] = {
            decimals: 0,
            amount: 0,
            price: 0
        };

        this.tokenAmounts[token].decimals = await utils.returnDecimals(token);

        try {
          this.tokenAmounts[token].price = (await utils.getTokenPricesFromString(token)).data[token.toLowerCase()].usd;
        } catch {
            // If no price is found set it to 0
            this.tokenAmounts[token].price = 0;
        } 

    }

    this.tokenAmounts[token].amount += ((new BigNumber(amount)).div(10 ** this.tokenAmounts[token].decimals)).toNumber();
}  
}