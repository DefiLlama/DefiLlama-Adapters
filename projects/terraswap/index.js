const sdk = require('@defillama/sdk')
const axios = require('axios')

function getAssetInfo(asset){
    return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

async function tvl(timestamp){
    /*
    const { block } = await sdk.api.util.lookupBlock(timestamp, {
        chain: 'terra'
    })
    */
    let ustTvl = 0;
    const balances = {}
    const prices = {}
    await Promise.all(Object.keys(pairs).map(async pair=>{
        const { assets } = (
            await axios.get(`https://lcd.terra.dev/wasm/contracts/${pair}/store?query_msg={%22pool%22:{}}`/*&height=${block - (block % 100)}`*/) // Node is semi-pruned, only every 100th block is stored
        ).data.result;
        const [token0, amount0] = getAssetInfo(assets[0])
        const [token1, amount1] = getAssetInfo(assets[1])
        if(token0 === "uusd"){
            ustTvl += amount0*2
            prices[token1] = amount0/amount1
        } else if(token1 === 'uusd'){
            ustTvl += amount1*2
            prices[token0] = amount1/amount0
        } else if (token1 === "uluna"){
            balances[token1] = (balances[token1] ?? 0) + amount1*2
        } else {
            balances[token0] = (balances[token0] ?? 0) + amount0
            balances[token1] = (balances[token1] ?? 0) + amount1
        }
    }))
    Object.entries(balances).map(entry=>{
        const price = prices[entry[0]]
        if(price){
            ustTvl += entry[1]*price
        }
    })
    return {
        'terrausd': ustTvl/1e6
    }
}

module.exports={
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    tvl
}

// copied from https://github.com/terra-money/terraswap-graph/blob/master/src/assets/whiteList.ts
const pairs = {
    terra1gm5p3ner9x9xpwugn9sp6gvhd0lwrtkyrecdn3: 'ANC-UST',
    terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p: 'bLUNA-LUNA',
    terra178jydtjvj4gw8earkgnqc80c3hrmqj4kw2welz: 'MINE-UST',
    terra1amv303y8kzxuegvurh0gug2xe9wkgj65enq2ux: 'MIR-UST',
    terra1tndcaqxkpc5ce9qee5ggqf430mr2z3pefe5wj6: 'LUNA-UST',
    terra15kkctr4eug9txq7v6ks6026yd4zjkrm3mc0nkp: 'mIAU-UST',
    terra1u56eamzkwzpm696hae4kl92jm6xxztar9uhkea: 'mGOOGL-UST',
    terra19pg6d7rrndg4z4t0jhcd7z9nhl3p5ygqttxjll: 'STT-UST',
    terra10ypv4vq67ns54t5ur3krkx37th7j58paev0qhd: 'mMSFT-UST',
    terra1dkc8075nv34k2fu6xn6wcgrqlewup2qtkr4ymu: 'mQQQ-UST',
    terra1vkvmvnmex90wanque26mjvay2mdtf0rz57fm6d: 'mAMZN-UST',
    terra1774f8rwx76k7ruy0gqnzq25wh7lmd72eg6eqp5: 'mAAPL-UST',
    terra1f6d9mhrsl5t6yxqnr4rgfusjlt3gfwxdveeyuy: 'mSLV-UST',
    terra1ea9js3y4l7vy0h46k4e5r5ykkk08zc3fx7v4t8: 'mTWTR-UST',
    terra1zey9knmvs2frfrjnf4cfv4prc4ts3mrsefstrj: 'mUSO-UST',
    terra1pdxyk2gkykaraynmrgjfq2uu7r9pf5v8x7k4xk: 'mTSLA-UST',
    terra1yppvuda72pvmxd727knemvzsuergtslj486rdq: 'mNFLX-UST',
    terra1krny2jc0tpkzeqfmswm7ss8smtddxqm3mxxsjm: 'mVIXY-UST',
    terra1afdz4l9vsqddwmjqxmel99atu4rwscpfjm4yfp: 'mBABA-UST',
    terra1tn8ejzw8kpuc87nu42f6qeyen4c7qy35tl8t20: 'SPEC-UST',
    terra14hklnm2ssaexjwkcfhyyyzvpmhpwx6x6lpy39s: 'mSPY-UST',
    terra1gq7lq389w4dxqtkxj03wp0fvz0cemj0ek5wwmm: 'mABNB-UST',
    terra108ukjf6ekezuc52t9keernlqxtmzpj4wf7rx0h: 'mGS-UST',
    terra1prfcyujt9nsn5kfj5n925sfd737r2n8tk5lmpv: 'mBTC-UST',
    terra1yl2atgxw422qxahm02p364wtgu7gmeya237pcs: 'mFB-UST',
    terra14fyt2g3umeatsr4j4g2rs8ca0jceu3k0mcs7ry: 'mETH-UST',
    terra1h7t2yq00rxs8a78nyrnhlvp0ewu8vnfnx5efsl: 'mCOIN-UST',
    terra17rvtq0mjagh37kcmm4lmpz95ukxwhcrrltgnvc: 'mDOT-UST',
    terra1ze5f2lm5clq2cdd9y2ve3lglfrq6ap8cqncld8: 'mGLXY-UST',
    terra1a5cc08jt5knh0yx64pg6dtym4c4l8t63rhlag3: 'mARKK-UST',
    terra18cxcwv0theanknfztzww8ft9pzfgkmf2xrqy23: 'mAMD-UST',
    terra1u3pknaazmmudfwxsclcfg3zy74s3zd3anc5m52: 'mSQ-UST',
    terra1lr6rglgd50xxzqe6l5axaqp9d5ae3xf69z3qna: 'mHOOD-UST',
    terra17eakdtane6d2y7y6v0s79drq7gnhzqan48kxw7: 'mGME-UST',
    terra1uenpalqlmfaf4efgtqsvzpa3gh898d9h2a232g: 'mAMC-UST',
    terra1zw0kfxrxgrs5l087mjm79hcmj3y8z6tljuhpmc: 'LUNA-KRT',
    terra1c5swgtnuunpf75klq5uztynurazuwqf0mmmcyy: 'mETH-bETH',
    terra1vs2vuks65rq7xj78mwtvn7vvnm2gn7adjlr002: 'LUNA-SDT',
    terra1sndgzq62wp23mv20ndr4sxg6k8xcsudsy87uph: 'LUNA-MNT',
    terra1c0afrdc5253tkp5wt7rxhuj42xwyf2lcre0s7c: 'bETH-UST',
    terra1pn20mcwnmeyxf68vpt3cyel3n57qm9mp289jta: 'LOTA-UST',
    terra12mzh5cp6tgc65t2cqku5zvkjj8xjtuv5v9whyd: 'MIAW-UST',
    terra1zz39wfyyqt4tjz7dz6p7s9c8pwmcw2xzde3xl8: 'DPH-UST',
    terra10l7zllh9hduam4tugygj9x3f6976auj2xeyegp: 'DAN-LUNA',
    terra1wrwf3um5vm30vpwnlpvjzgwpf5fjknt68nah05: 'LUNAHODL',
    terra1etdkg9p0fkl8zal6ecp98kypd32q8k3ryced9d: 'TWD-UST'
  }