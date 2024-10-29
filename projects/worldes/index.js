const { getLogs } = require('../helper/cache/getLogs')
const config = {
    arbitrum: { WES:'0xcEab5Af10D5376016c8C352ea77F8Bc6a88bDa11',dvmFactory: '0x3bA0388E64900e274f2C6fCfaE34Eed65c01282A', fromBlock: 228710000, dspFactory: '0xf3AadDd00C2E263d760BE52BB7142276B74E8b47', WorldesRWATokenFactory: '0x4Ef31B45919aE1874840B9563D46FCD57E2Ae0b7', WorldesDvmProxy: '0x7e93ED796aFD3D9a6e9a24c668153fBb981bE60E', WorldesDspProxy: '0xE6933Fb2dc110a43fdeC6bB83d6ae99aC557c452', WorldesMineProxy: '0x2eFda50249176e3ee1A26964Ad6496DC5aA2aCE7' },
}
//Increase the underlying asset value of RWA
async function addRwaAssetTVL(api, target) {
    const tokens = await api.call({abi: 'erc20:totalSupply', target: target})
    api.addToken(target.toLowerCase(),tokens)
}
Object.keys(config).forEach(chain => {
    const { WES, dvmFactory, fromBlock, dspFactory, blacklistedTokens, } = config[chain]
    module.exports[chain] = {
        tvl: async (api) => {
            const ownerTokens = []
            const funcs = [];
            const builder = (factorys, event) => {
                if (Array.isArray(factorys)) {
                    factorys.forEach(factory => funcs.push(addLogs(factory, event)));
                } else {
                    funcs.push(addLogs(factorys, event));
                }
            }
            builder(dvmFactory, 'event NewDVM(address baseToken, address quoteToken, address creator, address pool)');
            builder(dspFactory, 'event NewDSP(address baseToken, address quoteToken, address creator, address pool)');
            await Promise.all(funcs)
            api.log(ownerTokens.length * 2, api.chain)
            await addRwaAssetTVL(api, WES)
            await api.sumTokens({  token:WES,ownerTokens, blacklistedTokens, permitFailure: true,resolveLP:true });
            return api.getBalances()
            async function addLogs(target, eventAbi) {
                if (!target) return;
                const convert = i => [[i.baseToken, i.quoteToken], i.pool]
                let logs = await getLogs({ api, target, eventAbi, onlyArgs: true, fromBlock,resolveLP:true })
                ownerTokens.push(...logs.map(convert))
            }
        }
    }
})