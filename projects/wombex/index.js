const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const utils = require('../utils');
const _ = require("lodash")
const BoosterABI = require('./abis/Booster.json');
const MWABI = require('./abis/MasterWombat.json');
const MRPSABI = require('./abis/Rewarder.json');
const RouterABI = require('./abis/Router.json');
const crvRewardsABI = require('./abis/crvRewards.json');
const CoinABI = require('./abis/Coin.json');
const AssetABI = require('./abis/Asset.json');
const WMXPOOLABI = require('./abis/WMXPOOL.json');
const pckswapABI = require('./abis/PancakeRouter.json');
const voterProxyABI = require('./abis/VoterProxy.json');
const bribeABI = require('./abis/Bribe.json');
const wmxABI = require('./abis/wmx.json');
const wombatPoolABI = require('./abis/wombatPoolABI.json');
const wmxbribeABI = require('./abis/Bribewmx.json');
const config = require('./config.js')
const slug = "wombex-finance";
const one_eth = (BigNumber(10).pow(BigNumber(18))).valueOf()
const zeroAddress = '0x0000000000000000000000000000000000000000'
const secToYear = 365 * 24 * 60 * 60;


//version emulating the algorithm in the lens

function formatEther(value, unit = 18) {
    const result = BigNumber(value).div(BigNumber(10).pow(BigNumber(unit)));
    return result.toString();
}

//get all pools
async function boosterPoolInfos(chain) {
    booster = config[chain].booster;
    len_pools = await sdk.api.abi.call({
        target: booster,
        chain: chain,
        abi: BoosterABI.find((n) => n.name === 'poolLength')
    }).output;

}
//estimate token price in USD (BUSD) using pancake/camelot/any uniswap-like router
async function tokenToBUSD(token, amount_in, chain) {
    //a departure from the Lens contract, which estimates all stable usd tokens at 1/1 wrt usd
    //since I don't want to multiply the amount of addresses to configure in config
    //for the same reason (and because Arbi has no bnb), 
    //all tokens are routed directly to BUSD, with no tokens being routed with
    //mediation of BNB, like e.g. ANKR in the BSC Lens. This will engender minor deviations in estimation
    //though hopefully not as great as for my own method with hybrid price quoting
    usdStables = config[chain].lens_usd_stables;
    if (usdStables.includes(token)) {
        return amount_in;
    }
    if (token in config[chain].manual_eps) { path = [token, config[chain].manual_eps[token], config[chain].busd]; }
    else { path = [token, config[chain].busd]; }
    console.log(path);
    try {
        result = (await sdk.api.abi.call({
            target: config[chain].pancake,
            chain: chain,
            abi: RouterABI.find((n) => n.name === "getAmountsOut"),
            params: [one_eth, path]
        })).output.at(-1);
        console.log(result);
        return result;
    }
    catch (error) {
        console.log(error);
        console.log(token);
    }
}

async function getLpUsdOut(pool, amt, chain) {
    pem = config[chain].endpoint_pool_map;
    tokenOut = zeroAddress;
    console.log(tokenOut)
    if (pool in pem) {
        tokenOut = pem[pool]; ans = await quoteWithdrawtoBUSD(pool, tokenOut, amt, chain);
        return ans }
    else {
        usdStables = config[chain].lens_usd_stables;
        miscEpt = config[chain].lens_misc_ept;
        tokens = (await sdk.api.abi.call({
            target: pool,
            chain: chain,
            abi: wombatPoolABI.find((n) => n.name === 'getTokens')
        })).output;
        tokenOut = tokens.find((t) => usdStables.includes(t));
        if (tokenOut === undefined || tokenOut === zeroAddress) {
            tokenOut = tokens.find((t) => miscEpt.includes(t));
        }
        if (tokenOut === zeroAddress || tokenOut === undefined) {
            console.log(`No endpoint token in pool ${pool}`);
            return 0
        }
        else {
            console.log('final token out', tokenOut);
            ans = await quoteWithdrawtoBUSD(pool, tokenOut, amt, chain)
            return ans
        }
    }
}

async function quoteWithdrawtoBUSD(pool, tokenOut, amt, chain) {
    try {
        potentialWithdraw = (await sdk.api.abi.call({
            target: pool,
            chain: chain,
            abi: wombatPoolABI.find((n) => n.name === 'quotePotentialWithdraw'),
            params: [tokenOut, amt]
        })).output;
        console.log(potentialWithdraw);
        return await tokenToBUSD(tokenOut, potentialWithdraw.amount, chain)
    }
    catch { return 0}
}


async function setApys(crvRewards, wmxUsdPrice, mintRatio, poolValuestvl, poolValues, chain) {

    rewardTokens = (await sdk.api.abi.call({
        target: crvRewards,
        chain: chain,
        abi: crvRewardsABI.find((n)=>n.name === 'rewardTokensList')
    })).output;

    len = rewardTokens.length;
    aprs = [];
    aprTotal = BigNumber(0);
    wmxApr = 0;

    for (let i = 0; i < len; i++) {
        token = rewardTokens[i];

        rewardState = (await sdk.api.abi.call({
            target: crvRewards,
            chain: chain,
            abi: crvRewardsABI.find((n) => n.name === 'tokenRewards'),
            params: [token]
        })).output;
        console.log(token)
        console.log(rewardState)

        if (token === config[chain].wom) {
            rpy = (BigNumber(rewardState.rewardRate).multipliedBy(BigNumber(secToYear)))
            //tofixed is an unholy hack, but utterly necessary here to avoid BigNumber value problems
            factAmountMint = (await sdk.api.abi.call({
                target: config['bsc'].wmx,
                chain: 'bsc',
                abi: wmxABI.find((n) => n.name === 'getFactAmounMint'),
                params: [rpy.toFixed()],
            })).output;
            //bsc chain is fixed above because on arbi the wmx token is a proxy of wormhole bridge
            //and lacks functionaity like getfactamountmint
            //wmx is not minted on arbi and is instead transferred there, just like e.g. cvx
            wmxRate = factAmountMint;
            console.log(wmxRate);
            if (mintRatio > 0) {
                wmxRate = BigNumber(factAmountMint).multipliedBy(BigNumber(mintRatio)).dividedBy(BigNumber(10000));
            }
            wmxApr = BigNumber(wmxRate).multipliedBy(BigNumber(wmxUsdPrice)).multipliedBy(BigNumber(100)).dividedBy(BigNumber(poolValuestvl)).dividedBy(
                BigNumber(10).pow(BigNumber(18))
            );
            aprTotal = aprTotal.plus(wmxApr);
            aprs.push({
                'token': token,
                'apr': wmxApr.valueOf()
            })
        }
        else {
            usdPrice = await tokenToBUSD(token, one_eth, chain);
            apr = BigNumber(rewardState.rewardRate).multipliedBy(BigNumber(secToYear)).multipliedBy(BigNumber(usdPrice)).multipliedBy(BigNumber(100)).dividedBy(BigNumber(poolValuestvl)).dividedBy(
                BigNumber(10).pow(BigNumber(18))
            );
            aprTotal = aprTotal.plus(apr);
            aprs.push({
                'token': token,
                'apr': apr.valueOf()
            })
        }
    }
    return {'tokenAprs': aprs, 'totalApr': aprTotal.valueOf(), 'wmxApr': wmxApr.valueOf()}
}

async function apy_chain(chain) {
    //get pool amt
    booster = config[chain].booster;

    len_pools = (await sdk.api.abi.call({
        target: booster,
        chain: chain,
        abi: BoosterABI.find((n) => n.name === 'poolLength')
    })).output;

    mintRatio = (await sdk.api.abi.call({
        target: booster,
        chain: chain,
        abi: BoosterABI.find((n) => n.name === 'mintRatio'),
    })).output;

    wmxUsdPrice = await tokenToBUSD(config[chain].wmx, one_eth, chain);

    all_apys = [];

    //iterate over pools
    for (let i = 0; i < len_pools; i++) {
        //get booster poolinfo

        pool_info = (await sdk.api.abi.call({
            target: booster,
            chain: chain,
            abi: BoosterABI.find((n) => n.name === 'poolInfo'),
            params: i
        })).output;

        crvRewards = pool_info.crvRewards;

        pool = (await sdk.api.abi.call({
            target: pool_info.lptoken,
            chain: chain,
            abi: AssetABI.find((n) => n.name === 'pool'),
        })).output;

        poolValues = {};
        poolValues['pid'] = i;

        poolValues['symbol'] = (await sdk.api.abi.call({
            target: pool_info.lptoken,
            chain: chain,
            abi: AssetABI.find((n) => n.name === 'symbol'),
        })).output;

        poolValues['rewardPool'] = crvRewards;
        //compute tvl
        poolValues['lpTokenPrice'] = await getLpUsdOut(pool, one_eth, chain);

        poolValues['lpTokenBalance'] = (await sdk.api.abi.call({
            target: crvRewards,
            chain: chain,
            abi: crvRewardsABI.find((n) => n.name === 'totalSupply'),
        })).output;
        console.log('total supply queried')

        poolValues['tvl'] = (BigNumber(poolValues.lpTokenBalance).multipliedBy(BigNumber(poolValues.lpTokenPrice)).dividedBy(BigNumber(one_eth))).valueOf();

        //compute apys of lp(!) pools

        if (poolValues.tvl > 10) {
            const { tokenAprs, totalApr, wmxApr } = await setApys(crvRewards, wmxUsdPrice, mintRatio, poolValues.tvl, poolValues, chain);
            poolValues['tokenAprs'] = tokenAprs;
            poolValues['totalApr'] = totalApr;
            poolValues['wmxApr'] = wmxApr;
        }
        poolValues['underlyingToken'] = (
            await sdk.api.abi.call({
                target: pool_info.lptoken,
                chain: chain,
                abi: AssetABI.find((n)=>n.name === 'underlyingToken')
            })
        ).output;
        all_apys.push(poolValues);

    }
    return all_apys
}


async function apy_bribe_chain(chain) {
    //gauge voting lens is not really usable for getting bribe apys
    //since I have no use for current+historical rewards and am more interesting in reward rate
    //for this reason, I implement my own algo (get reward rate /year and divide by total votes). Fight me
    //note for self: don't forget to get the ratio of vevom balance of voterproxy and total supply of vlwmx
    //bribepool rewardrate => bribepool reward per year
    //wom votes of bribepool => wmx votes of bribepool => wmx votes of bribepool in usd
    //bribepool reward per year in usd / wmx votes of bribepool in usd (by wmx prices) => apy
    bribe_apys = [];
    if (!('bribepools' in config[chain])) {
        return bribe_apys
    }
    else {
        bribepools = config[chain].bribepools;
        for (let a of bribepools) {
            //wmx bribepool rewardtokens - old config
            rts = (
                await sdk.api.abi.call({
                    target: a,
                    chain: chain,
                    abi: wmxbribeABI.find((n) => n.name === 'rewardTokensList')
                })
            ).output;
            aprs = [];
            totalBribeApr = BigNumber(0);
            votes = (
                await sdk.api.abi.call({
                    target: a,
                    chain: chain,
                    abi: wmxbribeABI.find((n) => n.name === 'totalSupply')
                })
            ).output; //totalSupply coincides with vlwmx balance of bribe pool
            console.log('votes of pool', votes);
            for (let rt of rts) {
                //go over all reward tokens
                //get tokenRewards 
                trwd = (
                    await sdk.api.abi.call({
                        target: a,
                        chain: chain,
                        abi: wmxbribeABI.find((n) => n.name === 'tokenRewards'),
                        params: [rt]
                    })
                ).output;
                if (trwd.paused === true) {
                    continue; //ignore paused bribes
                }
                rrate = trwd.rewardRate;
                rrate_usd = await tokenToBUSD(rt, rrate, chain);
                aux = await tokenToBUSD(rt, one_eth, chain)
                rrate_usd = BigNumber(aux).multipliedBy(BigNumber(rrate)).dividedBy(BigNumber(one_eth))
                rpy = BigNumber(rrate_usd).multipliedBy(BigNumber(secToYear));
                aux = await tokenToBUSD(rt, one_eth, chain)
                console.log(rt, formatEther(aux), (BigNumber(rrate_usd).dividedBy(BigNumber(rrate))).valueOf(), 'price')
                console.log('rpy_raw', rpy.valueOf(), rrate, rrate_usd, formatEther(BigNumber(aux).multipliedBy(BigNumber(rrate))));
                console.log('votes of pool before votesuds', votes);
                vlwmxUsdPrice = await tokenToBUSD(config[chain].wmx, one_eth, chain);
                votesUsd = BigNumber(vlwmxUsdPrice).multipliedBy(BigNumber(votes)).dividedBy(BigNumber(one_eth));
                console.log('poolvotes usd', votesUsd.valueOf())
                apy = rpy.dividedBy(BigNumber(votesUsd));
                aprs.push({
                    'token': rt,
                    'apr': apy,
                    'rpy': rpy,
                })
                console.log(formatEther(rpy), formatEther((votesUsd)), 'usd of reward and tvl for pool with rewardtoken', rt, a)
                totalBribeApr = totalBribeApr.plus(apy);
            }
            if (Number(formatEther(votesUsd))>0) {
                bribe_apys.push({
                    'pool': a,
                    'rewardTokens': rts,
                    'rewardAprs': aprs,
                    'totalApr': totalBribeApr.valueOf(),
                    'tvlVotes': formatEther(votesUsd),
                    'underlyingTokens': [config[chain].wmx],
                    'rpys': aprs.map(a => formatEther(a.rpy)),
                    'symbol': (await sdk.api.abi.call({
                        target: a,
                        chain: chain,
                        abi: wmxbribeABI.find((n)=>n.name === 'symbol')
                    })).output.slice(3)
                })
            }
        }
    }
    return bribe_apys
}

async function apy() {
    apy_export = []

    for (chain in config) {
        a = await apy_chain(chain);
        bribes = await apy_bribe_chain(chain);
        console.log(a);
        console.log(bribes);
        //got raw apy data, make it conform to defillama specs
        a.map(a => {
            if (Number(formatEther(a.tvl)) > 0 && Number(a.wmxApr) > 0) {
                apy_export.push({
                    'pool': a.rewardPool + `${chain}`,
                    'chain': chain,
                    'project': slug,
                    'symbol': a.symbol.slice(3),
                    'tvlUsd': Number(formatEther(a.tvl)),
                    'apyReward': Number(a.totalApr),
                    'rewardTokens': a.tokenAprs.map(b => { return b.token }),
                    'underlyingTokens': [a.underlyingToken],
                    'poolMeta': 'LP Pool',
                    'url': 'wombex.finance'
                })
            }
        })
        bribes.map(bribe => {
            apy_export.push({
                'pool': bribe.pool + `${chain}`,
                'chain': chain,
                'project': slug,
                'symbol': bribe.symbol,
                'tvlUsd': Number(bribe.tvlVotes),
                'apyReward': 100*Number(bribe.totalApr),
                'rewardTokens': bribe.rewardAprs.map(b => { return b.token }),
                'underlyingTokens': bribe.underlyingTokens,
                'poolMeta': 'Bribe Pool',
                'url': 'wombex.finance'
            })
        })
        
    }
    //got raw apy data, make it conform to defillama specs

    console.log(a);
    console.log(apy_export);
    return apy_export
}

module.exports = {
  timetravel: false,
  apy,
};