const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.ankr.com/fantom"));

const oxLensAbi = require("./oxLens.json");
const solidlyLensAbi = require("./solidlyLens.json");
const veAbi = require("./ve.json");
const erc20Abi = require("./erc20.json");
const partnerRewardsPoolAddress = "0xDA006E87DB89e1C5213D4bfBa771e53c91D920aC";
const oxdV1RewardsPoolAddress = "0xDA000779663501df3C9Bc308E7cEc70cE6F04211";
const oxSolidRewardPoolAddress = "0xDA0067ec0925eBD6D583553139587522310Bec60";
const vlOxdAddress = "0xDA00527EDAabCe6F97D89aDb10395f719E5559b9";
const oxdAddress = "0xc5A9848b9d145965d821AaeC8fA32aaEE026492d";
const solidAddress = "0x888EF71766ca594DED1F0FA3AE64eD2941740A20";
const veAddress = "0xcBd8fEa77c2452255f59743f55A3Ea9d83b3c72b";
const oxSolidAddress = "0xDA0053F0bEfCbcaC208A3f867BB243716734D809";
const sanitize = require("./sanitizeWeb3Response.js");

const { masterChefExports, standardPoolInfoAbi, addFundsInMasterChef } = require('../helper/masterchef')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

const shareValue= {"inputs":[],"name":"getShareValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
const xSCREAM = "0xe3D17C7e840ec140a7A51ACA351a482231760824"
const xCREDIT = "0xd9e28749e80D867d5d14217416BFf0e668C10645"
const shareTarot = {"inputs":[{"internalType":"uint256","name":"_share","type":"uint256"}],"name":"shareValuedAsUnderlying","outputs":[{"internalType":"uint256","name":"underlyingAmount_","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}
const xTAROT = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4"

const fBEET = "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1"

async function tvl(time, ethBlock, chainBlocks) {
    // 0xDAO Master Chef
    const balances = {}
    const chain = 'fantom'
    const block = chainBlocks[chain]
    const calldata = {
        chain, block
    }
    const transform = addr => `fantom:${addr}`
    await addFundsInMasterChef(balances, "0xa7821c3e9fc1bf961e280510c471031120716c3d", block, chain,
        transform, standardPoolInfoAbi, [], true, true, "0xc165d941481e68696f43ee6e99bfb2b23e0e3114")
    
    const screamShare = await sdk.api.abi.call({
        ...calldata,
        target: xSCREAM,
        abi: shareValue
    })
    sdk.util.sumSingleBalance(balances, transform("0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"),
        BigNumber(screamShare.output).times(balances[transform(xSCREAM)]).div(1e18).toFixed(0))
    delete balances[transform(xSCREAM)]

    const creditShare = await sdk.api.abi.call({
        ...calldata,
        target: xCREDIT,
        abi: shareValue
    })
    sdk.util.sumSingleBalance(balances, transform("0x77128dfdd0ac859b33f44050c6fa272f34872b5e"),
        BigNumber(creditShare.output).times(balances[transform(xCREDIT)]).div(1e18).toFixed(0))
    delete balances[transform(xCREDIT)]

    const tarotShare = await sdk.api.abi.call({
        ...calldata,
        target: xTAROT,
        abi: shareTarot,
        params: balances[transform(xTAROT)]
    })
    sdk.util.sumSingleBalance(balances, transform("0xc5e2b037d30a390e62180970b3aa4e91868764cd"),
        tarotShare.output)
    delete balances[transform(xTAROT)]

    sdk.util.sumSingleBalance(balances, transform("0xf24bcf4d1e507740041c9cfd2dddb29585adce1e"),
        balances[transform(fBEET)])
    delete balances[transform(fBEET)]

    // 0xDAO Core
    const oxLensAddress = "0xDA00137c79B30bfE06d04733349d98Cf06320e69";
    const solidlyLensAddress = "0xDA0024F99A9889E8F48930614c27Ba41DD447c45";
    const oxLens = new web3.eth.Contract(oxLensAbi, oxLensAddress);
    const solidlyLens = new web3.eth.Contract(solidlyLensAbi, solidlyLensAddress);
    const ve = new web3.eth.Contract(veAbi, veAddress);
    // const oxd = new web3.eth.Contract(erc20Abi, oxdAddress);

    // Fetch pools addresses
    const oxPoolsAddresses = await oxLens.methods
        .oxPoolsAddresses()
        .call();
    
    const pageSize = 50;
    const poolsMap = {};
    let currentPage = 0;
    
    // Add pools
    const addPools = (pools, reservesData) => {
        pools.forEach((pool, index) => {
            const solidlyPoolAddress = pool.poolData.id;
            const reserveData = reservesData.find(
                (data) => data.id === solidlyPoolAddress
            );
            const newPool = pool;
            newPool.poolData = {
                ...pool.poolData,
                ...reserveData,
            };
            const shareOfTotalSupply = new BigNumber(newPool.totalSupply).div(newPool.poolData.totalSupply).toFixed()
            newPool.shareOfTotalSupply = shareOfTotalSupply;
            let token0Reserve = new BigNumber(newPool.poolData.token0Reserve).times(shareOfTotalSupply).toFixed(0);
            let token1Reserve = new BigNumber(newPool.poolData.token1Reserve).times(shareOfTotalSupply).toFixed(0);
            if (isNaN(token0Reserve)) {
                token0Reserve = "0"
            }
            if (isNaN(token1Reserve)) {
                token1Reserve = "0"
            }
            newPool.token0Reserve = token0Reserve;
            newPool.token1Reserve = token1Reserve;
            poolsMap[pool.id] = newPool;
        });
    };
    while (true) {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const addresses = oxPoolsAddresses.slice(start, end);
        if (addresses.length === 0) {
            break;
        }
        currentPage += 1;
        const poolsData = await oxLens.methods
            .oxPoolsData(addresses)
            .call()
    
        const solidlyPoolsAddresses = poolsData.map((pool) => pool.poolData.id);
        const reservesData = await solidlyLens.methods
            .poolsReservesInfo(solidlyPoolsAddresses)
            .call()
        addPools(
            sanitize(poolsData),
            sanitize(reservesData)
        );
    }
    const pools = Object.values(poolsMap);
        
    // Add TVL from pools to balances
    const addBalance = (tokenAddress, amount) => {
        const fantomTokenAddress = `fantom:${tokenAddress}`
        const existingBalance = balances[fantomTokenAddress];
        if (existingBalance) {
            balances[fantomTokenAddress] = new BigNumber(existingBalance).plus(amount).toFixed(0)
        } else {
            balances[fantomTokenAddress] = amount;
        }
    }
    pools.forEach(pool => {
        const token0 = pool.poolData.token0Address; 
        const token1 = pool.poolData.token1Address;
        const amount0 = pool.token0Reserve;
        const amount1 = pool.token1Reserve;
        addBalance(token0, amount0);
        addBalance(token1, amount1);
    });
    
    // Add locked SOLID
    const lockedSolidAmount = (await ve.methods.locked(2).call()).amount;
    addBalance(solidAddress, lockedSolidAmount);
    
    // Add staking pools TVL
    const oxdV1RewardsPool = new web3.eth.Contract(
        erc20Abi,
        oxdV1RewardsPoolAddress
    );
    const oxSolidRewardsPool = new web3.eth.Contract(
        erc20Abi,
        oxSolidRewardPoolAddress
    );    
    const partnerRewardsPool = new web3.eth.Contract(
        erc20Abi,
        partnerRewardsPoolAddress
    );
    const oxdV1RewardsPoolBalance = await oxdV1RewardsPool.methods.totalSupply().call();    
    const oxSolidRewardsPoolBalance = await oxSolidRewardsPool.methods.totalSupply().call();    
    const partnerRewardsPoolBalance = await partnerRewardsPool.methods.totalSupply().call();
        
    addBalance(oxSolidAddress, oxdV1RewardsPoolBalance);
    addBalance(oxSolidAddress, partnerRewardsPoolBalance);
    addBalance(oxSolidAddress, oxSolidRewardsPoolBalance);
    
    // Add vote locked OXD
    const oxd = new web3.eth.Contract(erc20Abi, oxdAddress);
    const voteLockedOxdBalance = await oxd.methods.balanceOf(vlOxdAddress).call();
    addBalance(oxdAddress, voteLockedOxdBalance);

    return balances
}

module.exports={
    fantom:{
        tvl
    }
}
