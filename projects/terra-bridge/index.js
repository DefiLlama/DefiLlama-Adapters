const sdk = require('@defillama/sdk');
const terra = require('../helper/terra');

const terraTokenAddresses = {
    'terra-luna': 'uluna',
    'terrausd': 'uusd',
    'terra-krw': 'ukrw',
    'terra-sdt': 'usdr',
    'anchorust': 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu',
    'bonded-luna': 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp',
    'mirror-protocol': 'terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6',
    'anchor-protocol': 'terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76',
    'mirrored-apple': 'terra1vxtwu4ehgzz77mnfwrntyrmgl64qjs75mpwqaz',
    'mirrored-google': 'terra1h8arz2k547uvmpxctuwush3jzc8fun4s96qgwt',
    'mirrored-tesla': 'terra14y5affaarufk3uscy2vr6pe6w6zqf2wpjzn5sh',
    'mirrored-netflix': 'terra1jsxngqasf2zynj5kyh0tgq9mj3zksa5gk35j4k',
    'mirrored-invesco-qqq-trust': 'terra1csk6tc7pdmpr782w527hwhez6gfv632tyf72cp',
    'mirrored-twitter': 'terra1cc3enj9qgchlrj34cnzhwuclc4vl2z3jl7tkqg',
    'mirrored-microsoft': 'terra1227ppwxxj3jxz8cfgq00jgnxqcny7ryenvkwj6',
    'mirrored-amazon': 'terra165nd2qmrtszehcfrntlplzern7zl4ahtlhd5t2',
    'mirrored-alibaba': 'terra1w7zgkcyt7y4zpct9dw8mw362ywvdlydnum2awa',
    'mirrored-ishares-gold-trust': 'terra15hp9pr8y4qsvqvxf3m4xeptlk7l8h60634gqec',
    'mirrored-ishares-silver-trust': 'terra1kscs6uhrqwy6rx5kuw5lwpuqvm3t6j2d6uf2lp',
    'mirrored-united-states-oil-fund': 'terra1lvmx8fsagy70tv0fhmfzdw9h6s3sy4prz38ugf',
    'mirrored-facebook': 'terra1mqsjugsugfprn3cvgxsrr8akkvdxv2pzc74us7',
    'mirrored-coinbase': 'terra18wayjpyq28gd970qzgjfmsjj7dmgdk039duhph',
};

const terraBridgeAddresses = {
    Eth: 'terra13yxhrk08qvdf5zdc9ss5mwsg5sf7zva9xrgwgc',
    Bsc: 'terra1g6llg3zed35nd3mh9zx6n64tfw3z67w2c48tn2',
    Hmy: 'terra1rtn03a9l3qsc0a9verxwj00afs93mlm0yr7chk',
};

const toNumber = (decimals, n) => Number(n)/Math.pow(10, decimals);

async function terraTvl() {
    const balances = {}
    const decimals = 6;
    for (const [chain, contractAddress] of Object.entries(terraBridgeAddresses)) {
        for (const [tokenName, tokenAddress] of Object.entries(terraTokenAddresses)) {
            const balance = tokenAddress.length > 5
              ? await terra.getBalance(tokenAddress, contractAddress)
              : await terra.getDenomBalance(tokenAddress, contractAddress);
            sdk.util.sumSingleBalance(balances, tokenName, toNumber(decimals, balance));
        }
    }
    return balances
}

module.exports={
    methodology: "Sums all token balance for Terra Bridge owned addresses.",
    tvl: terraTvl,
}
