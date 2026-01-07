(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,365801,e=>{"use strict";Symbol();let t=Symbol(),r=Object.getPrototypeOf,o=new WeakMap,a=e=>{let a;return(a=e)&&(o.has(a)?o.get(a):r(a)===Object.prototype||r(a)===Array.prototype)&&e[t]||null},n=(e,t=!0)=>{o.set(e,t)},i={get url(){return`file://${e.P("node_modules/valtio/esm/vanilla.mjs")}`}},s=e=>"object"==typeof e&&null!==e,c=new WeakMap,l=new WeakSet,u=(e=Object.is,t=(e,t)=>new Proxy(e,t),r=e=>s(e)&&!l.has(e)&&(Array.isArray(e)||!(Symbol.iterator in e))&&!(e instanceof WeakMap)&&!(e instanceof WeakSet)&&!(e instanceof Error)&&!(e instanceof Number)&&!(e instanceof Date)&&!(e instanceof String)&&!(e instanceof RegExp)&&!(e instanceof ArrayBuffer),o=e=>{switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:throw e}},u=new WeakMap,d=(e,t,r=o)=>{let a=u.get(e);if((null==a?void 0:a[0])===t)return a[1];let i=Array.isArray(e)?[]:Object.create(Object.getPrototypeOf(e));return n(i,!0),u.set(e,[t,i]),Reflect.ownKeys(e).forEach(t=>{if(Object.getOwnPropertyDescriptor(i,t))return;let o=Reflect.get(e,t),{enumerable:a}=Reflect.getOwnPropertyDescriptor(e,t),s={value:o,enumerable:a,configurable:!0};if(l.has(o))n(o,!1);else if(o instanceof Promise)delete s.value,s.get=()=>r(o);else if(c.has(o)){let[e,t]=c.get(o);s.value=d(e,t(),r)}Object.defineProperty(i,t,s)}),Object.preventExtensions(i)},p=new WeakMap,g=[1,1],m=o=>{if(!s(o))throw Error("object required");let n=p.get(o);if(n)return n;let u=g[0],w=new Set,h=(e,t=++g[0])=>{u!==t&&(u=t,w.forEach(r=>r(e,t)))},f=g[1],b=(e=++g[1])=>(f===e||w.size||(f=e,v.forEach(([t])=>{let r=t[1](e);r>u&&(u=r)})),u),C=e=>(t,r)=>{let o=[...t];o[1]=[e,...o[1]],h(o,r)},v=new Map,y=(e,t)=>{if((i.env?i.env.MODE:void 0)!=="production"&&v.has(e))throw Error("prop listener already exists");if(w.size){let r=t[3](C(e));v.set(e,[t,r])}else v.set(e,[t])},E=e=>{var t;let r=v.get(e);r&&(v.delete(e),null==(t=r[1])||t.call(r))},A=e=>{w.add(e),1===w.size&&v.forEach(([e,t],r)=>{if((i.env?i.env.MODE:void 0)!=="production"&&t)throw Error("remove already exists");let o=e[3](C(r));v.set(r,[e,o])});let t=()=>{w.delete(e),0===w.size&&v.forEach(([e,t],r)=>{t&&(t(),v.set(r,[e]))})};return t},I=Array.isArray(o)?[]:Object.create(Object.getPrototypeOf(o)),S={deleteProperty(e,t){let r=Reflect.get(e,t);E(t);let o=Reflect.deleteProperty(e,t);return o&&h(["delete",[t],r]),o},set(t,o,n,i){let u=Reflect.has(t,o),d=Reflect.get(t,o,i);if(u&&(e(d,n)||p.has(n)&&e(d,p.get(n))))return!0;E(o),s(n)&&(n=a(n)||n);let g=n;if(n instanceof Promise)n.then(e=>{n.status="fulfilled",n.value=e,h(["resolve",[o],e])}).catch(e=>{n.status="rejected",n.reason=e,h(["reject",[o],e])});else{!c.has(n)&&r(n)&&(g=m(n));let e=!l.has(g)&&c.get(g);e&&y(o,e)}return Reflect.set(t,o,g,i),h(["set",[o],n,d]),!0}},N=t(I,S);p.set(o,N);let _=[I,b,d,A];return c.set(N,_),Reflect.ownKeys(o).forEach(e=>{let t=Object.getOwnPropertyDescriptor(o,e);"value"in t&&(N[e]=o[e],delete t.value,delete t.writable),Object.defineProperty(I,e,t)}),N})=>[m,c,l,e,t,r,o,u,d,p,g],[d]=u();function p(e={}){return d(e)}function g(e){let t=c.get(e);return null==t?void 0:t[1]()}function m(e,t,r){let o,a=c.get(e);(i.env?i.env.MODE:void 0)==="production"||a||console.warn("Please use proxy object");let n=[],s=a[3],l=!1,u=s(e=>{(n.push(e),r)?t(n.splice(0)):o||(o=Promise.resolve().then(()=>{o=void 0,l&&t(n.splice(0))}))});return l=!0,()=>{l=!1,u()}}function w(e,t){let r=c.get(e);(i.env?i.env.MODE:void 0)==="production"||r||console.warn("Please use proxy object");let[o,a,n]=r;return n(o,a(),t)}function h(e){return l.add(e),e}e.s(["getVersion",()=>g,"proxy",()=>p,"ref",()=>h,"snapshot",()=>w,"subscribe",()=>m,"unstable_buildProxyFunction",()=>u],365801)},360334,e=>{"use strict";var t=e.i(247167);let r=(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org",o={FOUR_MINUTES_MS:24e4,TEN_SEC_MS:1e4,FIVE_SEC_MS:5e3,THREE_SEC_MS:3e3,ONE_SEC_MS:1e3,SECURE_SITE:r,SECURE_SITE_DASHBOARD:`${r}/dashboard`,SECURE_SITE_FAVICON:`${r}/images/favicon.png`,RESTRICTED_TIMEZONES:["ASIA/SHANGHAI","ASIA/URUMQI","ASIA/CHONGQING","ASIA/HARBIN","ASIA/KASHGAR","ASIA/MACAU","ASIA/HONG_KONG","ASIA/MACAO","ASIA/BEIJING","ASIA/HARBIN"],WC_COINBASE_PAY_SDK_CHAINS:["ethereum","arbitrum","polygon","berachain","avalanche-c-chain","optimism","celo","base"],WC_COINBASE_PAY_SDK_FALLBACK_CHAIN:"ethereum",WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP:{Ethereum:"ethereum","Arbitrum One":"arbitrum",Polygon:"polygon",Berachain:"berachain",Avalanche:"avalanche-c-chain","OP Mainnet":"optimism",Celo:"celo",Base:"base"},WC_COINBASE_ONRAMP_APP_ID:"bf18c88d-495a-463b-b249-0b9d3656cf5e",SWAP_SUGGESTED_TOKENS:["ETH","UNI","1INCH","AAVE","SOL","ADA","AVAX","DOT","LINK","NITRO","GAIA","MILK","TRX","NEAR","GNO","WBTC","DAI","WETH","USDC","USDT","ARB","BAL","BICO","CRV","ENS","MATIC","OP"],SWAP_POPULAR_TOKENS:["ETH","UNI","1INCH","AAVE","SOL","ADA","AVAX","DOT","LINK","NITRO","GAIA","MILK","TRX","NEAR","GNO","WBTC","DAI","WETH","USDC","USDT","ARB","BAL","BICO","CRV","ENS","MATIC","OP","METAL","DAI","CHAMP","WOLF","SALE","BAL","BUSD","MUST","BTCpx","ROUTE","HEX","WELT","amDAI","VSQ","VISION","AURUM","pSP","SNX","VC","LINK","CHP","amUSDT","SPHERE","FOX","GIDDY","GFC","OMEN","OX_OLD","DE","WNT"],BALANCE_SUPPORTED_CHAINS:["eip155","solana"],SWAP_SUPPORTED_NETWORKS:["eip155:1","eip155:42161","eip155:10","eip155:324","eip155:8453","eip155:56","eip155:137","eip155:100","eip155:43114","eip155:250","eip155:8217","eip155:1313161554"],NAMES_SUPPORTED_CHAIN_NAMESPACES:["eip155"],ONRAMP_SUPPORTED_CHAIN_NAMESPACES:["eip155","solana"],ACTIVITY_ENABLED_CHAIN_NAMESPACES:["eip155"],NATIVE_TOKEN_ADDRESS:{eip155:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",solana:"So11111111111111111111111111111111111111111",polkadot:"0x",bip122:"0x",cosmos:"0x"},CONVERT_SLIPPAGE_TOLERANCE:1,CONNECT_LABELS:{MOBILE:"Open and continue in the wallet app",WEB:"Open and continue in the wallet app"},SEND_SUPPORTED_NAMESPACES:["eip155","solana"],DEFAULT_REMOTE_FEATURES:{swaps:["1inch"],onramp:["coinbase","meld"],email:!0,socials:["google","x","discord","farcaster","github","apple","facebook"],activity:!0,reownBranding:!0},DEFAULT_REMOTE_FEATURES_DISABLED:{email:!1,socials:!1,swaps:!1,onramp:!1,activity:!1,reownBranding:!1},DEFAULT_FEATURES:{receive:!0,send:!0,emailShowWallets:!0,connectorTypeOrder:["walletConnect","recent","injected","featured","custom","external","recommended"],analytics:!0,allWallets:!0,legalCheckbox:!1,smartSessions:!1,collapseWallets:!1,walletFeaturesOrder:["onramp","swaps","receive","send"],connectMethodsOrder:void 0,pay:!1},DEFAULT_SOCIALS:["google","x","farcaster","discord","apple","github","facebook"],DEFAULT_ACCOUNT_TYPES:{bip122:"payment",eip155:"smartAccount",polkadot:"eoa",solana:"eoa"},ADAPTER_TYPES:{UNIVERSAL:"universal",SOLANA:"solana",WAGMI:"wagmi",ETHERS:"ethers",ETHERS5:"ethers5",BITCOIN:"bitcoin"}};e.s(["ConstantsUtil",0,o,"MELD_PUBLIC_KEY",0,"WXETMuFUQmqqybHuRkSgxv:25B8LJHSfpG6LVjR2ytU5Cwh7Z4Sch2ocoU","ONRAMP_PROVIDERS",0,[{label:"Coinbase",name:"coinbase",feeRange:"1-2%",url:"",supportedChains:["eip155"]},{label:"Meld.io",name:"meld",feeRange:"1-2%",url:"https://meldcrypto.com",supportedChains:["eip155","solana"]}]])},401564,e=>{"use strict";var t=e.i(247167);let r={WC_NAME_SUFFIX:".reown.id",WC_NAME_SUFFIX_LEGACY:".wcn.id",BLOCKCHAIN_API_RPC_URL:"https://rpc.walletconnect.org",PULSE_API_URL:"https://pulse.walletconnect.org",W3M_API_URL:"https://api.web3modal.org",CONNECTOR_ID:{WALLET_CONNECT:"walletConnect",INJECTED:"injected",WALLET_STANDARD:"announced",COINBASE:"coinbaseWallet",COINBASE_SDK:"coinbaseWalletSDK",SAFE:"safe",LEDGER:"ledger",OKX:"okx",EIP6963:"eip6963",AUTH:"ID_AUTH"},CONNECTOR_NAMES:{AUTH:"Auth"},AUTH_CONNECTOR_SUPPORTED_CHAINS:["eip155","solana"],LIMITS:{PENDING_TRANSACTIONS:99},CHAIN:{EVM:"eip155",SOLANA:"solana",POLKADOT:"polkadot",BITCOIN:"bip122"},CHAIN_NAME_MAP:{eip155:"EVM Networks",solana:"Solana",polkadot:"Polkadot",bip122:"Bitcoin",cosmos:"Cosmos"},ADAPTER_TYPES:{BITCOIN:"bitcoin",SOLANA:"solana",WAGMI:"wagmi",ETHERS:"ethers",ETHERS5:"ethers5"},USDT_CONTRACT_ADDRESSES:["0xdac17f958d2ee523a2206206994597c13d831ec7","0xc2132d05d31c914a87c6611c10748aeb04b58e8f","0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7","0x919C1c267BC06a7039e03fcc2eF738525769109c","0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e","0x55d398326f99059fF775485246999027B3197955","0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"],HTTP_STATUS_CODES:{SERVICE_UNAVAILABLE:503,FORBIDDEN:403},UNSUPPORTED_NETWORK_NAME:"Unknown Network",SECURE_SITE_SDK_ORIGIN:(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org"};e.s(["ConstantsUtil",0,r])},227302,376527,758331,e=>{"use strict";var t=e.i(401564),r=e.i(360334);let o={WALLET_ID:"@appkit/wallet_id",WALLET_NAME:"@appkit/wallet_name",SOLANA_WALLET:"@appkit/solana_wallet",SOLANA_CAIP_CHAIN:"@appkit/solana_caip_chain",ACTIVE_CAIP_NETWORK_ID:"@appkit/active_caip_network_id",CONNECTED_SOCIAL:"@appkit/connected_social",CONNECTED_SOCIAL_USERNAME:"@appkit-wallet/SOCIAL_USERNAME",RECENT_WALLETS:"@appkit/recent_wallets",DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",ACTIVE_NAMESPACE:"@appkit/active_namespace",CONNECTED_NAMESPACES:"@appkit/connected_namespaces",CONNECTION_STATUS:"@appkit/connection_status",SIWX_AUTH_TOKEN:"@appkit/siwx-auth-token",SIWX_NONCE_TOKEN:"@appkit/siwx-nonce-token",TELEGRAM_SOCIAL_PROVIDER:"@appkit/social_provider",NATIVE_BALANCE_CACHE:"@appkit/native_balance_cache",PORTFOLIO_CACHE:"@appkit/portfolio_cache",ENS_CACHE:"@appkit/ens_cache",IDENTITY_CACHE:"@appkit/identity_cache",PREFERRED_ACCOUNT_TYPES:"@appkit/preferred_account_types",CONNECTIONS:"@appkit/connections"};function a(e){if(!e)throw Error("Namespace is required for CONNECTED_CONNECTOR_ID");return`@appkit/${e}:connected_connector_id`}let n={setItem(e,t){i()&&void 0!==t&&localStorage.setItem(e,t)},getItem(e){if(i())return localStorage.getItem(e)||void 0},removeItem(e){i()&&localStorage.removeItem(e)},clear(){i()&&localStorage.clear()}};function i(){return"undefined"!=typeof window&&"undefined"!=typeof localStorage}e.s(["SafeLocalStorage",0,n,"SafeLocalStorageKeys",0,o,"getSafeConnectorIdKey",()=>a,"isSafe",()=>i],376527);let s={cacheExpiry:{portfolio:3e4,nativeBalance:3e4,ens:3e5,identity:3e5},isCacheExpired:(e,t)=>Date.now()-e>t,getActiveNetworkProps(){let e=s.getActiveNamespace(),t=s.getActiveCaipNetworkId(),r=t?t.split(":")[1]:void 0;return{namespace:e,caipNetworkId:t,chainId:r?isNaN(Number(r))?r:Number(r):void 0}},setWalletConnectDeepLink({name:e,href:t}){try{n.setItem(o.DEEPLINK_CHOICE,JSON.stringify({href:t,name:e}))}catch{console.info("Unable to set WalletConnect deep link")}},getWalletConnectDeepLink(){try{let e=n.getItem(o.DEEPLINK_CHOICE);if(e)return JSON.parse(e)}catch{console.info("Unable to get WalletConnect deep link")}},deleteWalletConnectDeepLink(){try{n.removeItem(o.DEEPLINK_CHOICE)}catch{console.info("Unable to delete WalletConnect deep link")}},setActiveNamespace(e){try{n.setItem(o.ACTIVE_NAMESPACE,e)}catch{console.info("Unable to set active namespace")}},setActiveCaipNetworkId(e){try{n.setItem(o.ACTIVE_CAIP_NETWORK_ID,e),s.setActiveNamespace(e.split(":")[0])}catch{console.info("Unable to set active caip network id")}},getActiveCaipNetworkId(){try{return n.getItem(o.ACTIVE_CAIP_NETWORK_ID)}catch{console.info("Unable to get active caip network id");return}},deleteActiveCaipNetworkId(){try{n.removeItem(o.ACTIVE_CAIP_NETWORK_ID)}catch{console.info("Unable to delete active caip network id")}},deleteConnectedConnectorId(e){try{let t=a(e);n.removeItem(t)}catch{console.info("Unable to delete connected connector id")}},setAppKitRecent(e){try{let t=s.getRecentWallets();t.find(t=>t.id===e.id)||(t.unshift(e),t.length>2&&t.pop(),n.setItem(o.RECENT_WALLETS,JSON.stringify(t)))}catch{console.info("Unable to set AppKit recent")}},getRecentWallets(){try{let e=n.getItem(o.RECENT_WALLETS);return e?JSON.parse(e):[]}catch{console.info("Unable to get AppKit recent")}return[]},setConnectedConnectorId(e,t){try{let r=a(e);n.setItem(r,t)}catch{console.info("Unable to set Connected Connector Id")}},getActiveNamespace(){try{return n.getItem(o.ACTIVE_NAMESPACE)}catch{console.info("Unable to get active namespace")}},getConnectedConnectorId(e){if(e)try{let t=a(e);return n.getItem(t)}catch(t){console.info("Unable to get connected connector id in namespace ",e)}},setConnectedSocialProvider(e){try{n.setItem(o.CONNECTED_SOCIAL,e)}catch{console.info("Unable to set connected social provider")}},getConnectedSocialProvider(){try{return n.getItem(o.CONNECTED_SOCIAL)}catch{console.info("Unable to get connected social provider")}},deleteConnectedSocialProvider(){try{n.removeItem(o.CONNECTED_SOCIAL)}catch{console.info("Unable to delete connected social provider")}},getConnectedSocialUsername(){try{return n.getItem(o.CONNECTED_SOCIAL_USERNAME)}catch{console.info("Unable to get connected social username")}},getStoredActiveCaipNetworkId(){let e=n.getItem(o.ACTIVE_CAIP_NETWORK_ID);return e?.split(":")?.[1]},setConnectionStatus(e){try{n.setItem(o.CONNECTION_STATUS,e)}catch{console.info("Unable to set connection status")}},getConnectionStatus(){try{return n.getItem(o.CONNECTION_STATUS)}catch{return}},getConnectedNamespaces(){try{let e=n.getItem(o.CONNECTED_NAMESPACES);if(!e?.length)return[];return e.split(",")}catch{return[]}},setConnectedNamespaces(e){try{let t=Array.from(new Set(e));n.setItem(o.CONNECTED_NAMESPACES,t.join(","))}catch{console.info("Unable to set namespaces in storage")}},addConnectedNamespace(e){try{let t=s.getConnectedNamespaces();t.includes(e)||(t.push(e),s.setConnectedNamespaces(t))}catch{console.info("Unable to add connected namespace")}},removeConnectedNamespace(e){try{let t=s.getConnectedNamespaces(),r=t.indexOf(e);r>-1&&(t.splice(r,1),s.setConnectedNamespaces(t))}catch{console.info("Unable to remove connected namespace")}},getTelegramSocialProvider(){try{return n.getItem(o.TELEGRAM_SOCIAL_PROVIDER)}catch{return console.info("Unable to get telegram social provider"),null}},setTelegramSocialProvider(e){try{n.setItem(o.TELEGRAM_SOCIAL_PROVIDER,e)}catch{console.info("Unable to set telegram social provider")}},removeTelegramSocialProvider(){try{n.removeItem(o.TELEGRAM_SOCIAL_PROVIDER)}catch{console.info("Unable to remove telegram social provider")}},getBalanceCache(){let e={};try{let t=n.getItem(o.PORTFOLIO_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get balance cache")}return e},removeAddressFromBalanceCache(e){try{let t=s.getBalanceCache();n.setItem(o.PORTFOLIO_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove address from balance cache",e)}},getBalanceCacheForCaipAddress(e){try{let t=s.getBalanceCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.portfolio))return t.balance;s.removeAddressFromBalanceCache(e)}catch{console.info("Unable to get balance cache for address",e)}},updateBalanceCache(e){try{let t=s.getBalanceCache();t[e.caipAddress]=e,n.setItem(o.PORTFOLIO_CACHE,JSON.stringify(t))}catch{console.info("Unable to update balance cache",e)}},getNativeBalanceCache(){let e={};try{let t=n.getItem(o.NATIVE_BALANCE_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get balance cache")}return e},removeAddressFromNativeBalanceCache(e){try{let t=s.getBalanceCache();n.setItem(o.NATIVE_BALANCE_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove address from balance cache",e)}},getNativeBalanceCacheForCaipAddress(e){try{let t=s.getNativeBalanceCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.nativeBalance))return t;console.info("Discarding cache for address",e),s.removeAddressFromBalanceCache(e)}catch{console.info("Unable to get balance cache for address",e)}},updateNativeBalanceCache(e){try{let t=s.getNativeBalanceCache();t[e.caipAddress]=e,n.setItem(o.NATIVE_BALANCE_CACHE,JSON.stringify(t))}catch{console.info("Unable to update balance cache",e)}},getEnsCache(){let e={};try{let t=n.getItem(o.ENS_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get ens name cache")}return e},getEnsFromCacheForAddress(e){try{let t=s.getEnsCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.ens))return t.ens;s.removeEnsFromCache(e)}catch{console.info("Unable to get ens name from cache",e)}},updateEnsCache(e){try{let t=s.getEnsCache();t[e.address]=e,n.setItem(o.ENS_CACHE,JSON.stringify(t))}catch{console.info("Unable to update ens name cache",e)}},removeEnsFromCache(e){try{let t=s.getEnsCache();n.setItem(o.ENS_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove ens name from cache",e)}},getIdentityCache(){let e={};try{let t=n.getItem(o.IDENTITY_CACHE);e=t?JSON.parse(t):{}}catch{console.info("Unable to get identity cache")}return e},getIdentityFromCacheForAddress(e){try{let t=s.getIdentityCache()[e];if(t&&!this.isCacheExpired(t.timestamp,this.cacheExpiry.identity))return t.identity;s.removeIdentityFromCache(e)}catch{console.info("Unable to get identity from cache",e)}},updateIdentityCache(e){try{let t=s.getIdentityCache();t[e.address]={identity:e.identity,timestamp:e.timestamp},n.setItem(o.IDENTITY_CACHE,JSON.stringify(t))}catch{console.info("Unable to update identity cache",e)}},removeIdentityFromCache(e){try{let t=s.getIdentityCache();n.setItem(o.IDENTITY_CACHE,JSON.stringify({...t,[e]:void 0}))}catch{console.info("Unable to remove identity from cache",e)}},clearAddressCache(){try{n.removeItem(o.PORTFOLIO_CACHE),n.removeItem(o.NATIVE_BALANCE_CACHE),n.removeItem(o.ENS_CACHE),n.removeItem(o.IDENTITY_CACHE)}catch{console.info("Unable to clear address cache")}},setPreferredAccountTypes(e){try{n.setItem(o.PREFERRED_ACCOUNT_TYPES,JSON.stringify(e))}catch{console.info("Unable to set preferred account types",e)}},getPreferredAccountTypes(){try{let e=n.getItem(o.PREFERRED_ACCOUNT_TYPES);if(!e)return{};return JSON.parse(e)}catch{console.info("Unable to get preferred account types")}return{}},setConnections(e,t){try{let r={...s.getConnections(),[t]:e};n.setItem(o.CONNECTIONS,JSON.stringify(r))}catch(e){console.error("Unable to sync connections to storage",e)}},getConnections(){try{let e=n.getItem(o.CONNECTIONS);if(!e)return{};return JSON.parse(e)}catch(e){return console.error("Unable to get connections from storage",e),{}}}};e.s(["StorageUtil",0,s],758331);let c={isMobile(){return!!this.isClient()&&!!("function"==typeof window?.matchMedia&&window?.matchMedia("(pointer:coarse)")?.matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent))},checkCaipNetwork:(e,t="")=>e?.caipNetworkId.toLocaleLowerCase().includes(t.toLowerCase()),isAndroid(){if(!this.isMobile())return!1;let e=window?.navigator.userAgent.toLowerCase();return c.isMobile()&&e.includes("android")},isIos(){if(!this.isMobile())return!1;let e=window?.navigator.userAgent.toLowerCase();return e.includes("iphone")||e.includes("ipad")},isSafari(){return!!this.isClient()&&(window?.navigator.userAgent.toLowerCase()).includes("safari")},isClient:()=>"undefined"!=typeof window,isPairingExpired:e=>!e||e-Date.now()<=r.ConstantsUtil.TEN_SEC_MS,isAllowedRetry:(e,t=r.ConstantsUtil.ONE_SEC_MS)=>Date.now()-e>=t,copyToClopboard(e){navigator.clipboard.writeText(e)},isIframe(){try{return window?.self!==window?.top}catch(e){return!1}},isSafeApp(){if(c.isClient()&&window.self!==window.top)try{let e=window?.location?.ancestorOrigins?.[0];if(e){let t=new URL(e),r=new URL("https://app.safe.global");return t.hostname===r.hostname}}catch{}return!1},getPairingExpiry:()=>Date.now()+r.ConstantsUtil.FOUR_MINUTES_MS,getNetworkId:e=>e?.split(":")[1],getPlainAddress:e=>e?.split(":")[2],wait:async e=>new Promise(t=>{setTimeout(t,e)}),debounce(e,t=500){let r;return(...o)=>{r&&clearTimeout(r),r=setTimeout(function(){e(...o)},t)}},isHttpUrl:e=>e.startsWith("http://")||e.startsWith("https://"),formatNativeUrl(e,t,r=null){if(c.isHttpUrl(e))return this.formatUniversalUrl(e,t);let o=e,a=r;o.includes("://")||(o=e.replaceAll("/","").replaceAll(":",""),o=`${o}://`),o.endsWith("/")||(o=`${o}/`),a&&!a?.endsWith("/")&&(a=`${a}/`),this.isTelegram()&&this.isAndroid()&&(t=encodeURIComponent(t));let n=encodeURIComponent(t);return{redirect:`${o}wc?uri=${n}`,redirectUniversalLink:a?`${a}wc?uri=${n}`:void 0,href:o}},formatUniversalUrl(e,t){if(!c.isHttpUrl(e))return this.formatNativeUrl(e,t);let r=e;r.endsWith("/")||(r=`${r}/`);let o=encodeURIComponent(t);return{redirect:`${r}wc?uri=${o}`,href:r}},getOpenTargetForPlatform(e){return"popupWindow"===e?e:this.isTelegram()?s.getTelegramSocialProvider()?"_top":"_blank":e},openHref(e,t,r){window?.open(e,this.getOpenTargetForPlatform(t),r||"noreferrer noopener")},returnOpenHref(e,t,r){return window?.open(e,this.getOpenTargetForPlatform(t),r||"noreferrer noopener")},isTelegram:()=>"undefined"!=typeof window&&(!!window.TelegramWebviewProxy||!!window.Telegram||!!window.TelegramWebviewProxyProto),isPWA(){if("undefined"==typeof window)return!1;let e=window.matchMedia?.("(display-mode: standalone)")?.matches,t=window?.navigator?.standalone;return!!(e||t)},preloadImage:async e=>Promise.race([new Promise((t,r)=>{let o=new Image;o.onload=t,o.onerror=r,o.crossOrigin="anonymous",o.src=e}),c.wait(2e3)]),formatBalance(e,t){let r="0.000";if("string"==typeof e){let t=Number(e);if(t){let e=Math.floor(1e3*t)/1e3;e&&(r=e.toString())}}return`${r}${t?` ${t}`:""}`},formatBalance2(e,t){let r;if("0"===e)r="0";else if("string"==typeof e){let t=Number(e);t&&(r=t.toString().match(/^-?\d+(?:\.\d{0,3})?/u)?.[0])}return{value:r??"0",rest:"0"===r?"000":"",symbol:t}},getApiUrl:()=>t.ConstantsUtil.W3M_API_URL,getBlockchainApiUrl:()=>t.ConstantsUtil.BLOCKCHAIN_API_RPC_URL,getAnalyticsUrl:()=>t.ConstantsUtil.PULSE_API_URL,getUUID:()=>crypto?.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/gu,e=>{let t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}),parseError:e=>"string"==typeof e?e:"string"==typeof e?.issues?.[0]?.message?e.issues[0].message:e instanceof Error?e.message:"Unknown error",sortRequestedNetworks(e,t=[]){let r={};return t&&e&&(e.forEach((e,t)=>{r[e]=t}),t.sort((e,t)=>{let o=r[e.id],a=r[t.id];return void 0!==o&&void 0!==a?o-a:void 0!==o?-1:1*(void 0!==a)})),t},calculateBalance(e){let t=0;for(let r of e)t+=r.value??0;return t},formatTokenBalance(e){let[t,r]=e.toFixed(2).split(".");return{dollars:t,pennies:r}},isAddress(e,t="eip155"){switch(t){case"eip155":if(/^(?:0x)?[0-9a-f]{40}$/iu.test(e)&&(/^(?:0x)?[0-9a-f]{40}$/iu.test(e)||/^(?:0x)?[0-9A-F]{40}$/iu.test(e)))return!0;return!1;case"solana":return/[1-9A-HJ-NP-Za-km-z]{32,44}$/iu.test(e);default:return!1}},uniqueBy(e,t){let r=new Set;return e.filter(e=>{let o=e[t];return!r.has(o)&&(r.add(o),!0)})},generateSdkVersion(e,t,o){let a=0===e.length?r.ConstantsUtil.ADAPTER_TYPES.UNIVERSAL:e.map(e=>e.adapterType).join(",");return`${t}-${a}-${o}`},createAccount:(e,t,r,o,a)=>({namespace:e,address:t,type:r,publicKey:o,path:a}),isCaipAddress(e){if("string"!=typeof e)return!1;let r=e.split(":"),o=r[0];return 3===r.filter(Boolean).length&&o in t.ConstantsUtil.CHAIN_NAME_MAP},isMac(){let e=window?.navigator.userAgent.toLowerCase();return e.includes("macintosh")&&!e.includes("safari")},formatTelegramSocialLoginUrl(e){let t=`--${encodeURIComponent(window?.location.href)}`,r="state=";if("auth.magic.link"===new URL(e).host){let o="provider_authorization_url=",a=e.substring(e.indexOf(o)+o.length),n=this.injectIntoUrl(decodeURIComponent(a),r,t);return e.replace(a,encodeURIComponent(n))}return this.injectIntoUrl(e,r,t)},injectIntoUrl(e,t,r){let o=e.indexOf(t);if(-1===o)throw Error(`${t} parameter not found in the URL: ${e}`);let a=e.indexOf("&",o),n=t.length,i=-1!==a?a:e.length;return e.substring(0,o+n)+(e.substring(o+n,i)+r)+e.substring(a)}};e.s(["CoreHelperUtil",0,c],227302)},127031,e=>{"use strict";var t=e.i(365801);function r(e,r,o,a){let n=e[r];return(0,t.subscribe)(e,()=>{let t=e[r];Object.is(n,t)||o(n=t)},a)}function o(e){let r=(0,t.proxy)({data:Array.from(e||[]),has(e){return this.data.some(t=>t[0]===e)},set(e,t){let r=this.data.find(t=>t[0]===e);return r?r[1]=t:this.data.push([e,t]),this},get(e){var t;return null==(t=this.data.find(t=>t[0]===e))?void 0:t[1]},delete(e){let t=this.data.findIndex(t=>t[0]===e);return -1!==t&&(this.data.splice(t,1),!0)},clear(){this.data.splice(0)},get size(){return this.data.length},toJSON(){return new Map(this.data)},forEach(e){this.data.forEach(t=>{e(t[1],t[0],this)})},keys(){return this.data.map(e=>e[0]).values()},values(){return this.data.map(e=>e[1]).values()},entries(){return new Map(this.data).entries()},get[Symbol.toStringTag](){return"Map"},[Symbol.iterator](){return this.entries()}});return Object.defineProperties(r,{data:{enumerable:!1},size:{enumerable:!1},toJSON:{enumerable:!1}}),Object.seal(r),r}new WeakMap,new WeakMap,Symbol(),e.s(["proxyMap",()=>o,"subscribeKey",()=>r],127031)},592279,364258,82283,e=>{"use strict";var t=e.i(365801),r=e.i(127031),o=e.i(227302);async function a(...e){let t=await fetch(...e);if(!t.ok)throw Error(`HTTP status code: ${t.status}`,{cause:t});return t}class n{constructor({baseUrl:e,clientId:t}){this.baseUrl=e,this.clientId=t}async get({headers:e,signal:t,cache:r,...o}){let n=this.createUrl(o);return(await a(n,{method:"GET",headers:e,signal:t,cache:r})).json()}async getBlob({headers:e,signal:t,...r}){let o=this.createUrl(r);return(await a(o,{method:"GET",headers:e,signal:t})).blob()}async post({body:e,headers:t,signal:r,...o}){let n=this.createUrl(o);return(await a(n,{method:"POST",headers:t,body:e?JSON.stringify(e):void 0,signal:r})).json()}async put({body:e,headers:t,signal:r,...o}){let n=this.createUrl(o);return(await a(n,{method:"PUT",headers:t,body:e?JSON.stringify(e):void 0,signal:r})).json()}async delete({body:e,headers:t,signal:r,...o}){let n=this.createUrl(o);return(await a(n,{method:"DELETE",headers:t,body:e?JSON.stringify(e):void 0,signal:r})).json()}createUrl({path:e,params:t}){let r=new URL(e,this.baseUrl);return t&&Object.entries(t).forEach(([e,t])=>{t&&r.searchParams.append(e,t)}),this.clientId&&r.searchParams.append("clientId",this.clientId),r}}e.s(["FetchUtil",()=>n],364258);var i=e.i(360334);let s={getFeatureValue(e,t){let r=t?.[e];return void 0===r?i.ConstantsUtil.DEFAULT_FEATURES[e]:r},filterSocialsByPlatform(e){if(!e||!e.length)return e;if(o.CoreHelperUtil.isTelegram()){if(o.CoreHelperUtil.isIos())return e.filter(e=>"google"!==e);if(o.CoreHelperUtil.isMac())return e.filter(e=>"x"!==e);if(o.CoreHelperUtil.isAndroid())return e.filter(e=>!["facebook","x"].includes(e))}return e}},c=(0,t.proxy)({features:i.ConstantsUtil.DEFAULT_FEATURES,projectId:"",sdkType:"appkit",sdkVersion:"html-wagmi-undefined",defaultAccountTypes:i.ConstantsUtil.DEFAULT_ACCOUNT_TYPES,enableNetworkSwitch:!0,experimental_preferUniversalLinks:!1,remoteFeatures:{}}),l={state:c,subscribeKey:(e,t)=>(0,r.subscribeKey)(c,e,t),setOptions(e){Object.assign(c,e)},setRemoteFeatures(e){if(!e)return;let t={...c.remoteFeatures,...e};c.remoteFeatures=t,c.remoteFeatures?.socials&&(c.remoteFeatures.socials=s.filterSocialsByPlatform(c.remoteFeatures.socials))},setFeatures(e){if(!e)return;c.features||(c.features=i.ConstantsUtil.DEFAULT_FEATURES);let t={...c.features,...e};c.features=t},setProjectId(e){c.projectId=e},setCustomRpcUrls(e){c.customRpcUrls=e},setAllWallets(e){c.allWallets=e},setIncludeWalletIds(e){c.includeWalletIds=e},setExcludeWalletIds(e){c.excludeWalletIds=e},setFeaturedWalletIds(e){c.featuredWalletIds=e},setTokens(e){c.tokens=e},setTermsConditionsUrl(e){c.termsConditionsUrl=e},setPrivacyPolicyUrl(e){c.privacyPolicyUrl=e},setCustomWallets(e){c.customWallets=e},setIsSiweEnabled(e){c.isSiweEnabled=e},setIsUniversalProvider(e){c.isUniversalProvider=e},setSdkVersion(e){c.sdkVersion=e},setMetadata(e){c.metadata=e},setDisableAppend(e){c.disableAppend=e},setEIP6963Enabled(e){c.enableEIP6963=e},setDebug(e){c.debug=e},setEnableWalletConnect(e){c.enableWalletConnect=e},setEnableWalletGuide(e){c.enableWalletGuide=e},setEnableAuthLogger(e){c.enableAuthLogger=e},setEnableWallets(e){c.enableWallets=e},setPreferUniversalLinks(e){c.experimental_preferUniversalLinks=e},setHasMultipleAddresses(e){c.hasMultipleAddresses=e},setSIWX(e){c.siwx=e},setConnectMethodsOrder(e){c.features={...c.features,connectMethodsOrder:e}},setWalletFeaturesOrder(e){c.features={...c.features,walletFeaturesOrder:e}},setSocialsOrder(e){c.remoteFeatures={...c.remoteFeatures,socials:e}},setCollapseWallets(e){c.features={...c.features,collapseWallets:e}},setEnableEmbedded(e){c.enableEmbedded=e},setAllowUnsupportedChain(e){c.allowUnsupportedChain=e},setManualWCControl(e){c.manualWCControl=e},setEnableNetworkSwitch(e){c.enableNetworkSwitch=e},setDefaultAccountTypes(e={}){Object.entries(e).forEach(([e,t])=>{t&&(c.defaultAccountTypes[e]=t)})},setUniversalProviderConfigOverride(e){c.universalProviderConfigOverride=e},getUniversalProviderConfigOverride:()=>c.universalProviderConfigOverride,getSnapshot:()=>(0,t.snapshot)(c)};e.s(["OptionsController",0,l],82283);let u=Object.freeze({enabled:!0,events:[]}),d=new n({baseUrl:o.CoreHelperUtil.getAnalyticsUrl(),clientId:null}),p=(0,t.proxy)({...u}),g={state:p,subscribeKey:(e,t)=>(0,r.subscribeKey)(p,e,t),async sendError(e,t){if(!p.enabled)return;let r=Date.now();if(p.events.filter(e=>r-new Date(e.properties.timestamp||"").getTime()<6e4).length>=5)return;let a={type:"error",event:t,properties:{errorType:e.name,errorMessage:e.message,stackTrace:e.stack,timestamp:new Date().toISOString()}};p.events.push(a);try{if("undefined"==typeof window)return;let{projectId:r,sdkType:a,sdkVersion:n}=l.state;await d.post({path:"/e",params:{projectId:r,st:a,sv:n||"html-wagmi-4.2.2"},body:{eventId:o.CoreHelperUtil.getUUID(),url:window.location.href,domain:window.location.hostname,timestamp:new Date().toISOString(),props:{type:"error",event:t,errorType:e.name,errorMessage:e.message,stackTrace:e.stack}}})}catch{}},enable(){p.enabled=!0},disable(){p.enabled=!1},clearEvents(){p.events=[]}};class m extends Error{constructor(e,t,r){super(e),this.name="AppKitError",this.category=t,this.originalError=r,Object.setPrototypeOf(this,m.prototype);let o=!1;if(r instanceof Error&&"string"==typeof r.stack&&r.stack){const e=r.stack,t=e.indexOf("\n");if(t>-1){const r=e.substring(t+1);this.stack=`${this.name}: ${this.message}
${r}`,o=!0}}!o&&(Error.captureStackTrace?Error.captureStackTrace(this,m):this.stack||(this.stack=`${this.name}: ${this.message}`))}}function w(e,t){let r=e instanceof m?e:new m(e instanceof Error?e.message:String(e),t,e);throw g.sendError(r,r.category),r}function h(e,t="INTERNAL_SDK_ERROR"){let r={};return Object.keys(e).forEach(o=>{let a=e[o];if("function"==typeof a){let e=a;e="AsyncFunction"===a.constructor.name?async(...e)=>{try{return await a(...e)}catch(e){return w(e,t)}}:(...e)=>{try{return a(...e)}catch(e){return w(e,t)}},r[o]=e}else r[o]=a}),r}e.s(["AppKitError",()=>m,"withErrorBoundary",()=>h],592279)},681285,e=>{"use strict";var t=e.i(401564);e.s(["NetworkUtil",0,{caipNetworkIdToNumber:e=>e?Number(e.split(":")[1]):void 0,parseEvmChainId(e){return"string"==typeof e?this.caipNetworkIdToNumber(e):e},getNetworksByNamespace:(e,t)=>e?.filter(e=>e.chainNamespace===t)||[],getFirstNetworkByNamespace(e,t){return this.getNetworksByNamespace(e,t)[0]},getNetworkNameByCaipNetworkId(e,r){if(!r)return;let o=e.find(e=>e.caipNetworkId===r);if(o)return o.name;let[a]=r.split(":");return t.ConstantsUtil.CHAIN_NAME_MAP?.[a]||void 0}}])},90068,e=>{"use strict";function t(e,t){return"light"===t?{"--w3m-accent":e?.["--w3m-accent"]||"hsla(231, 100%, 70%, 1)","--w3m-background":"#fff"}:{"--w3m-accent":e?.["--w3m-accent"]||"hsla(230, 100%, 67%, 1)","--w3m-background":"#121313"}}e.s(["getW3mThemeVariables",()=>t])},411249,e=>{"use strict";var t=e.i(401564);let r={PHANTOM:{id:"a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393",url:"https://phantom.app"},SOLFLARE:{id:"1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79",url:"https://solflare.com"},COINBASE:{id:"fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa",url:"https://go.cb-w.com"}};e.s(["CUSTOM_DEEPLINK_WALLETS",0,r,"MobileWalletUtil",0,{handleMobileDeeplinkRedirect(e,o){let a=window.location.href,n=encodeURIComponent(a);if(e===r.PHANTOM.id&&!("phantom"in window)){let e=a.startsWith("https")?"https":"http",t=a.split("/")[2],o=encodeURIComponent(`${e}://${t}`);window.location.href=`${r.PHANTOM.url}/ul/browse/${n}?ref=${o}`}e!==r.SOLFLARE.id||"solflare"in window||(window.location.href=`${r.SOLFLARE.url}/ul/v1/browse/${n}?ref=${n}`),o!==t.ConstantsUtil.CHAIN.SOLANA||e!==r.COINBASE.id||"coinbaseSolana"in window||(window.location.href=`${r.COINBASE.url}/dapp?cb_url=${n}`)}}])},436220,241845,e=>{"use strict";e.s(["AssetUtil",()=>l],436220);var t=e.i(365801),r=e.i(886259),o=e.i(127031),a=e.i(592279);let n=(0,t.proxy)({walletImages:{},networkImages:{},chainImages:{},connectorImages:{},tokenImages:{},currencyImages:{}}),i=(0,a.withErrorBoundary)({state:n,subscribeNetworkImages:e=>(0,t.subscribe)(n.networkImages,()=>e(n.networkImages)),subscribeKey:(e,t)=>(0,o.subscribeKey)(n,e,t),subscribe:e=>(0,t.subscribe)(n,()=>e(n)),setWalletImage(e,t){n.walletImages[e]=t},setNetworkImage(e,t){n.networkImages[e]=t},setChainImage(e,t){n.chainImages[e]=t},setConnectorImage(e,t){n.connectorImages={...n.connectorImages,[e]:t}},setTokenImage(e,t){n.tokenImages[e]=t},setCurrencyImage(e,t){n.currencyImages[e]=t}});e.s(["AssetController",0,i],241845);let s={eip155:"ba0ba0cd-17c6-4806-ad93-f9d174f17900",solana:"a1b58899-f671-4276-6a5e-56ca5bd59700",polkadot:"",bip122:"0b4838db-0161-4ffe-022d-532bf03dba00",cosmos:""},c=(0,t.proxy)({networkImagePromises:{}}),l={async fetchWalletImage(e){if(e)return await r.ApiController._fetchWalletImage(e),this.getWalletImageById(e)},async fetchNetworkImage(e){if(!e)return;let t=this.getNetworkImageById(e);return t||(c.networkImagePromises[e]||(c.networkImagePromises[e]=r.ApiController._fetchNetworkImage(e)),await c.networkImagePromises[e],this.getNetworkImageById(e))},getWalletImageById(e){if(e)return i.state.walletImages[e]},getWalletImage:e=>e?.image_url?e?.image_url:e?.image_id?i.state.walletImages[e.image_id]:void 0,getNetworkImage:e=>e?.assets?.imageUrl?e?.assets?.imageUrl:e?.assets?.imageId?i.state.networkImages[e.assets.imageId]:void 0,getNetworkImageById(e){if(e)return i.state.networkImages[e]},getConnectorImage:e=>e?.imageUrl?e.imageUrl:e?.imageId?i.state.connectorImages[e.imageId]:void 0,getChainImage:e=>i.state.networkImages[s[e]]}},653157,851887,e=>{"use strict";e.s(["EventsController",()=>h],653157);var t=e.i(365801),r=e.i(401564),o=e.i(376527),a=e.i(227302),n=e.i(364258),i=e.i(820903),s=e.i(127031),c=e.i(592279),l=e.i(82283);let u=(0,t.proxy)({message:"",variant:"info",open:!1}),d=(0,c.withErrorBoundary)({state:u,subscribeKey:(e,t)=>(0,s.subscribeKey)(u,e,t),open(e,t){let{debug:r}=l.OptionsController.state,{shortMessage:o,longMessage:a}=e;r&&(u.message=o,u.variant=t,u.open=!0),a&&console.error("function"==typeof a?a():a)},close(){u.open=!1,u.message="",u.variant="info"}});e.s(["AlertController",0,d],851887);let p=a.CoreHelperUtil.getAnalyticsUrl(),g=new n.FetchUtil({baseUrl:p,clientId:null}),m=["MODAL_CREATED"],w=(0,t.proxy)({timestamp:Date.now(),reportedErrors:{},data:{type:"track",event:"MODAL_CREATED"}}),h={state:w,subscribe:e=>(0,t.subscribe)(w,()=>e(w)),getSdkProperties(){let{projectId:e,sdkType:t,sdkVersion:r}=l.OptionsController.state;return{projectId:e,st:t,sv:r||"html-wagmi-4.2.2"}},async _sendAnalyticsEvent(e){try{let t=i.AccountController.state.address;if(m.includes(e.data.event)||"undefined"==typeof window)return;await g.post({path:"/e",params:h.getSdkProperties(),body:{eventId:a.CoreHelperUtil.getUUID(),url:window.location.href,domain:window.location.hostname,timestamp:e.timestamp,props:{...e.data,address:t}}}),w.reportedErrors.FORBIDDEN=!1}catch(e){e instanceof Error&&e.cause instanceof Response&&e.cause.status===r.ConstantsUtil.HTTP_STATUS_CODES.FORBIDDEN&&!w.reportedErrors.FORBIDDEN&&(d.open({shortMessage:"Invalid App Configuration",longMessage:`Origin ${(0,o.isSafe)()?window.origin:"uknown"} not found on Allowlist - update configuration on cloud.reown.com`},"error"),w.reportedErrors.FORBIDDEN=!0)}},sendEvent(e){w.timestamp=Date.now(),w.data=e,l.OptionsController.state.features?.analytics&&h._sendAnalyticsEvent(w)}}},886259,e=>{"use strict";e.s(["ApiController",()=>h]);var t=e.i(365801),r=e.i(127031),o=e.i(436220),a=e.i(227302),n=e.i(364258),i=e.i(411249),s=e.i(758331),c=e.i(241845),l=e.i(960398),u=e.i(149454),d=e.i(653157),p=e.i(82283);let g=a.CoreHelperUtil.getApiUrl(),m=new n.FetchUtil({baseUrl:g,clientId:null}),w=(0,t.proxy)({promises:{},page:1,count:0,featured:[],allFeatured:[],recommended:[],allRecommended:[],wallets:[],filteredWallets:[],search:[],isAnalyticsEnabled:!1,excludedWallets:[],isFetchingRecommendedWallets:!1}),h={state:w,subscribeKey:(e,t)=>(0,r.subscribeKey)(w,e,t),_getSdkProperties(){let{projectId:e,sdkType:t,sdkVersion:r}=p.OptionsController.state;return{projectId:e,st:t||"appkit",sv:r||"html-wagmi-4.2.2"}},_filterOutExtensions:e=>p.OptionsController.state.isUniversalProvider?e.filter(e=>!!(e.mobile_link||e.desktop_link||e.webapp_link)):e,async _fetchWalletImage(e){let t=`${m.baseUrl}/getWalletImage/${e}`,r=await m.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setWalletImage(e,URL.createObjectURL(r))},async _fetchNetworkImage(e){let t=`${m.baseUrl}/public/getAssetImage/${e}`,r=await m.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setNetworkImage(e,URL.createObjectURL(r))},async _fetchConnectorImage(e){let t=`${m.baseUrl}/public/getAssetImage/${e}`,r=await m.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setConnectorImage(e,URL.createObjectURL(r))},async _fetchCurrencyImage(e){let t=`${m.baseUrl}/public/getCurrencyImage/${e}`,r=await m.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setCurrencyImage(e,URL.createObjectURL(r))},async _fetchTokenImage(e){let t=`${m.baseUrl}/public/getTokenImage/${e}`,r=await m.getBlob({path:t,params:h._getSdkProperties()});c.AssetController.setTokenImage(e,URL.createObjectURL(r))},_filterWalletsByPlatform:e=>a.CoreHelperUtil.isMobile()?e?.filter(e=>!!e.mobile_link||e.id===i.CUSTOM_DEEPLINK_WALLETS.COINBASE.id||"solana"===l.ChainController.state.activeChain&&(e.id===i.CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id||e.id===i.CUSTOM_DEEPLINK_WALLETS.PHANTOM.id)):e,fetchProjectConfig:async()=>(await m.get({path:"/appkit/v1/config",params:h._getSdkProperties()})).features,async fetchAllowedOrigins(){try{let{allowedOrigins:e}=await m.get({path:"/projects/v1/origins",params:h._getSdkProperties()});return e}catch(e){return[]}},async fetchNetworkImages(){let e=l.ChainController.getAllRequestedCaipNetworks(),t=e?.map(({assets:e})=>e?.imageId).filter(Boolean).filter(e=>!o.AssetUtil.getNetworkImageById(e));t&&await Promise.allSettled(t.map(e=>h._fetchNetworkImage(e)))},async fetchConnectorImages(){let{connectors:e}=u.ConnectorController.state,t=e.map(({imageId:e})=>e).filter(Boolean);await Promise.allSettled(t.map(e=>h._fetchConnectorImage(e)))},async fetchCurrencyImages(e=[]){await Promise.allSettled(e.map(e=>h._fetchCurrencyImage(e)))},async fetchTokenImages(e=[]){await Promise.allSettled(e.map(e=>h._fetchTokenImage(e)))},async fetchWallets(e){let t=e.exclude??[];h._getSdkProperties().sv.startsWith("html-core-")&&t.push(...Object.values(i.CUSTOM_DEEPLINK_WALLETS).map(e=>e.id));let r=await m.get({path:"/getWallets",params:{...h._getSdkProperties(),...e,page:String(e.page),entries:String(e.entries),include:e.include?.join(","),exclude:t.join(",")}});return{data:h._filterWalletsByPlatform(r?.data)||[],count:r?.count}},async fetchFeaturedWallets(){let{featuredWalletIds:e}=p.OptionsController.state;if(e?.length){let t={...h._getSdkProperties(),page:1,entries:e?.length??4,include:e},{data:r}=await h.fetchWallets(t),o=[...r].sort((t,r)=>e.indexOf(t.id)-e.indexOf(r.id)),a=o.map(e=>e.image_id).filter(Boolean);await Promise.allSettled(a.map(e=>h._fetchWalletImage(e))),w.featured=o,w.allFeatured=o}},async fetchRecommendedWallets(){try{w.isFetchingRecommendedWallets=!0;let{includeWalletIds:e,excludeWalletIds:t,featuredWalletIds:r}=p.OptionsController.state,o=[...t??[],...r??[]].filter(Boolean),a=l.ChainController.getRequestedCaipNetworkIds().join(","),{data:n,count:i}=await h.fetchWallets({page:1,entries:4,include:e,exclude:o,chains:a}),c=s.StorageUtil.getRecentWallets(),u=n.map(e=>e.image_id).filter(Boolean),d=c.map(e=>e.image_id).filter(Boolean);await Promise.allSettled([...u,...d].map(e=>h._fetchWalletImage(e))),w.recommended=n,w.allRecommended=n,w.count=i??0}catch{}finally{w.isFetchingRecommendedWallets=!1}},async fetchWalletsByPage({page:e}){let{includeWalletIds:t,excludeWalletIds:r,featuredWalletIds:o}=p.OptionsController.state,n=l.ChainController.getRequestedCaipNetworkIds().join(","),i=[...w.recommended.map(({id:e})=>e),...r??[],...o??[]].filter(Boolean),{data:s,count:c}=await h.fetchWallets({page:e,entries:40,include:t,exclude:i,chains:n}),u=s.slice(0,20).map(e=>e.image_id).filter(Boolean);await Promise.allSettled(u.map(e=>h._fetchWalletImage(e))),w.wallets=a.CoreHelperUtil.uniqueBy([...w.wallets,...h._filterOutExtensions(s)],"id").filter(e=>e.chains?.some(e=>n.includes(e))),w.count=c>w.count?c:w.count,w.page=e},async initializeExcludedWallets({ids:e}){let t={page:1,entries:e.length,include:e},{data:r}=await h.fetchWallets(t);r&&r.forEach(e=>{w.excludedWallets.push({rdns:e.rdns,name:e.name})})},async searchWallet({search:e,badge:t}){let{includeWalletIds:r,excludeWalletIds:o}=p.OptionsController.state,n=l.ChainController.getRequestedCaipNetworkIds().join(",");w.search=[];let i={page:1,entries:100,search:e?.trim(),badge_type:t,include:r,exclude:o,chains:n},{data:s}=await h.fetchWallets(i);d.EventsController.sendEvent({type:"track",event:"SEARCH_WALLET",properties:{badge:t??"",search:e??""}});let c=s.map(e=>e.image_id).filter(Boolean);await Promise.allSettled([...c.map(e=>h._fetchWalletImage(e)),a.CoreHelperUtil.wait(300)]),w.search=h._filterOutExtensions(s)},initPromise(e,t){let r=w.promises[e];return r||(w.promises[e]=t())},prefetch:({fetchConnectorImages:e=!0,fetchFeaturedWallets:t=!0,fetchRecommendedWallets:r=!0,fetchNetworkImages:o=!0}={})=>Promise.allSettled([e&&h.initPromise("connectorImages",h.fetchConnectorImages),t&&h.initPromise("featuredWallets",h.fetchFeaturedWallets),r&&h.initPromise("recommendedWallets",h.fetchRecommendedWallets),o&&h.initPromise("networkImages",h.fetchNetworkImages)].filter(Boolean)),prefetchAnalyticsConfig(){p.OptionsController.state.features?.analytics&&h.fetchAnalyticsConfig()},async fetchAnalyticsConfig(){try{let{isAnalyticsEnabled:e}=await m.get({path:"/getAnalyticsConfig",params:h._getSdkProperties()});p.OptionsController.setFeatures({analytics:e})}catch(e){p.OptionsController.setFeatures({analytics:!1})}},filterByNamespaces(e){if(!e?.length){w.featured=w.allFeatured,w.recommended=w.allRecommended;return}let t=l.ChainController.getRequestedCaipNetworkIds().join(",");w.featured=w.allFeatured.filter(e=>e.chains?.some(e=>t.includes(e))),w.recommended=w.allRecommended.filter(e=>e.chains?.some(e=>t.includes(e))),w.filteredWallets=w.wallets.filter(e=>e.chains?.some(e=>t.includes(e)))},clearFilterByNamespaces(){w.filteredWallets=[]},setFilterByNamespace(e){if(!e){w.featured=w.allFeatured,w.recommended=w.allRecommended;return}let t=l.ChainController.getRequestedCaipNetworkIds().join(",");w.featured=w.allFeatured.filter(e=>e.chains?.some(e=>t.includes(e))),w.recommended=w.allRecommended.filter(e=>e.chains?.some(e=>t.includes(e))),w.filteredWallets=w.wallets.filter(e=>e.chains?.some(e=>t.includes(e)))}}},798852,e=>{"use strict";e.s(["NetworkUtil",()=>i]);var t=e.i(401564),r=e.i(820903),o=e.i(960398),a=e.i(149454),n=e.i(221728);let i={onSwitchNetwork({network:e,ignoreSwitchConfirmation:i=!1}){let s=o.ChainController.state.activeCaipNetwork,c=n.RouterController.state.data;if(e.id===s?.id)return;let l=r.AccountController.getCaipAddress(o.ChainController.state.activeChain),u=e.chainNamespace!==o.ChainController.state.activeChain,d=r.AccountController.getCaipAddress(e.chainNamespace),p=a.ConnectorController.getConnectorId(o.ChainController.state.activeChain)===t.ConstantsUtil.CONNECTOR_ID.AUTH,g=t.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(t=>t===e.chainNamespace);i||p&&g?n.RouterController.push("SwitchNetwork",{...c,network:e}):l&&u&&!d?n.RouterController.push("SwitchActiveChain",{switchToChain:e.chainNamespace,navigateTo:"Connect",navigateWithReplace:!0,network:e}):n.RouterController.push("SwitchNetwork",{...c,network:e})}}},149454,77277,803468,221728,639403,979484,e=>{"use strict";e.s(["ConnectorController",()=>_],149454);var t=e.i(365801),r=e.i(127031),o=e.i(401564),a=e.i(90068),n=e.i(411249),i=e.i(758331),s=e.i(592279),c=e.i(886259),l=e.i(960398),u=e.i(82283);e.s(["RouterController",()=>y],221728);var d=e.i(820903);e.s(["ModalController",()=>C],803468);var p=e.i(227302),g=e.i(798852),m=e.i(971080),w=e.i(653157);let h=(0,t.proxy)({loading:!1,open:!1,selectedNetworkId:void 0,activeChain:void 0,initialized:!1}),f={state:h,subscribe:e=>(0,t.subscribe)(h,()=>e(h)),subscribeOpen:e=>(0,r.subscribeKey)(h,"open",e),set(e){Object.assign(h,{...h,...e})}};e.s(["PublicStateController",0,f],77277);let b=(0,t.proxy)({loading:!1,loadingNamespaceMap:new Map,open:!1,shake:!1,namespace:void 0}),C=(0,s.withErrorBoundary)({state:b,subscribe:e=>(0,t.subscribe)(b,()=>e(b)),subscribeKey:(e,t)=>(0,r.subscribeKey)(b,e,t),async open(e){let t="connected"===d.AccountController.state.status,r=e?.namespace,o=l.ChainController.state.activeChain,a=r&&r!==o,n=l.ChainController.getAccountData(e?.namespace)?.caipAddress;if(m.ConnectionController.state.wcBasic?c.ApiController.prefetch({fetchNetworkImages:!1,fetchConnectorImages:!1}):await c.ApiController.prefetch({fetchConnectorImages:!t,fetchFeaturedWallets:!t,fetchRecommendedWallets:!t}),_.setFilterByNamespace(e?.namespace),C.setLoading(!0,r),r&&a){let e=l.ChainController.getNetworkData(r)?.caipNetwork||l.ChainController.getRequestedCaipNetworks(r)[0];e&&g.NetworkUtil.onSwitchNetwork({network:e,ignoreSwitchConfirmation:!0})}else{let t=l.ChainController.state.noAdapters;u.OptionsController.state.manualWCControl||t&&!n?p.CoreHelperUtil.isMobile()?y.reset("AllWallets"):y.reset("ConnectingWalletConnectBasic"):e?.view?y.reset(e.view,e.data):n?y.reset("Account"):y.reset("Connect")}b.open=!0,f.set({open:!0}),w.EventsController.sendEvent({type:"track",event:"MODAL_OPEN",properties:{connected:!!n}})},close(){let e=u.OptionsController.state.enableEmbedded,t=!!l.ChainController.state.activeCaipAddress;b.open&&w.EventsController.sendEvent({type:"track",event:"MODAL_CLOSE",properties:{connected:t}}),b.open=!1,y.reset("Connect"),C.clearLoading(),e?t?y.replace("Account"):y.push("Connect"):f.set({open:!1}),m.ConnectionController.resetUri()},setLoading(e,t){t&&b.loadingNamespaceMap.set(t,e),b.loading=e,f.set({loading:e})},clearLoading(){b.loadingNamespaceMap.clear(),b.loading=!1},shake(){b.shake||(b.shake=!0,setTimeout(()=>{b.shake=!1},500))}}),v=(0,t.proxy)({view:"Connect",history:["Connect"],transactionStack:[]}),y=(0,s.withErrorBoundary)({state:v,subscribeKey:(e,t)=>(0,r.subscribeKey)(v,e,t),pushTransactionStack(e){v.transactionStack.push(e)},popTransactionStack(e){let t=v.transactionStack.pop();if(!t)return;let{onSuccess:r,onError:o,onCancel:a}=t;switch(e){case"success":r?.();break;case"error":o?.(),y.goBack();break;case"cancel":a?.(),y.goBack()}},push(e,t){e!==v.view&&(v.view=e,v.history.push(e),v.data=t)},reset(e,t){v.view=e,v.history=[e],v.data=t},replace(e,t){v.history.at(-1)!==e&&(v.view=e,v.history[v.history.length-1]=e,v.data=t)},goBack(){let e=l.ChainController.state.activeCaipAddress,r="ConnectingFarcaster"===y.state.view,o=!e&&r;if(v.history.length>1){v.history.pop();let[t]=v.history.slice(-1);t&&(e&&"Connect"===t?v.view="Account":v.view=t)}else C.close();v.data?.wallet&&(v.data.wallet=void 0),setTimeout(()=>{if(o){d.AccountController.setFarcasterUrl(void 0,l.ChainController.state.activeChain);let e=_.getAuthConnector();e?.provider?.reload();let r=(0,t.snapshot)(u.OptionsController.state);e?.provider?.syncDappData?.({metadata:r.metadata,sdkVersion:r.sdkVersion,projectId:r.projectId,sdkType:r.sdkType})}},100)},goBackToIndex(e){if(v.history.length>1){v.history=v.history.slice(0,e+1);let[t]=v.history.slice(-1);t&&(v.view=t)}},goBackOrCloseModal(){y.state.history.length>1?y.goBack():C.close()}});e.s(["ThemeController",()=>I],639403);let E=(0,t.proxy)({themeMode:"dark",themeVariables:{},w3mThemeVariables:void 0}),A={state:E,subscribe:e=>(0,t.subscribe)(E,()=>e(E)),setThemeMode(e){E.themeMode=e;try{let t=_.getAuthConnector();if(t){let r=A.getSnapshot().themeVariables;t.provider.syncTheme({themeMode:e,themeVariables:r,w3mThemeVariables:(0,a.getW3mThemeVariables)(r,e)})}}catch{console.info("Unable to sync theme to auth connector")}},setThemeVariables(e){E.themeVariables={...E.themeVariables,...e};try{let e=_.getAuthConnector();if(e){let t=A.getSnapshot().themeVariables;e.provider.syncTheme({themeVariables:t,w3mThemeVariables:(0,a.getW3mThemeVariables)(E.themeVariables,E.themeMode)})}}catch{console.info("Unable to sync theme to auth connector")}},getSnapshot:()=>(0,t.snapshot)(E)},I=(0,s.withErrorBoundary)(A),S={eip155:void 0,solana:void 0,polkadot:void 0,bip122:void 0,cosmos:void 0},N=(0,t.proxy)({allConnectors:[],connectors:[],activeConnector:void 0,filterByNamespace:void 0,activeConnectorIds:{...S},filterByNamespaceMap:{eip155:!0,solana:!0,polkadot:!0,bip122:!0,cosmos:!0}}),_=(0,s.withErrorBoundary)({state:N,subscribe:e=>(0,t.subscribe)(N,()=>{e(N)}),subscribeKey:(e,t)=>(0,r.subscribeKey)(N,e,t),initialize(e){e.forEach(e=>{let t=i.StorageUtil.getConnectedConnectorId(e);t&&_.setConnectorId(t,e)})},setActiveConnector(e){e&&(N.activeConnector=(0,t.ref)(e))},setConnectors(e){e.filter(e=>!N.allConnectors.some(t=>t.id===e.id&&_.getConnectorName(t.name)===_.getConnectorName(e.name)&&t.chain===e.chain)).forEach(e=>{"MULTI_CHAIN"!==e.type&&N.allConnectors.push((0,t.ref)(e))});let r=_.getEnabledNamespaces(),o=_.getEnabledConnectors(r);N.connectors=_.mergeMultiChainConnectors(o)},filterByNamespaces(e){Object.keys(N.filterByNamespaceMap).forEach(e=>{N.filterByNamespaceMap[e]=!1}),e.forEach(e=>{N.filterByNamespaceMap[e]=!0}),_.updateConnectorsForEnabledNamespaces()},filterByNamespace(e,t){N.filterByNamespaceMap[e]=t,_.updateConnectorsForEnabledNamespaces()},updateConnectorsForEnabledNamespaces(){let e=_.getEnabledNamespaces(),t=_.getEnabledConnectors(e),r=_.areAllNamespacesEnabled();N.connectors=_.mergeMultiChainConnectors(t),r?c.ApiController.clearFilterByNamespaces():c.ApiController.filterByNamespaces(e)},getEnabledNamespaces:()=>Object.entries(N.filterByNamespaceMap).filter(([e,t])=>t).map(([e])=>e),getEnabledConnectors:e=>N.allConnectors.filter(t=>e.includes(t.chain)),areAllNamespacesEnabled:()=>Object.values(N.filterByNamespaceMap).every(e=>e),mergeMultiChainConnectors(e){let t=_.generateConnectorMapByName(e),r=[];return t.forEach(e=>{let t=e[0],a=t?.id===o.ConstantsUtil.CONNECTOR_ID.AUTH;e.length>1&&t?r.push({name:t.name,imageUrl:t.imageUrl,imageId:t.imageId,connectors:[...e],type:a?"AUTH":"MULTI_CHAIN",chain:"eip155",id:t?.id||""}):t&&r.push(t)}),r},generateConnectorMapByName(e){let t=new Map;return e.forEach(e=>{let{name:r}=e,o=_.getConnectorName(r);if(!o)return;let a=t.get(o)||[];a.find(t=>t.chain===e.chain)||a.push(e),t.set(o,a)}),t},getConnectorName:e=>e&&({"Trust Wallet":"Trust"})[e]||e,getUniqueConnectorsByName(e){let t=[];return e.forEach(e=>{t.find(t=>t.chain===e.chain)||t.push(e)}),t},addConnector(e){if(e.id===o.ConstantsUtil.CONNECTOR_ID.AUTH){let r=(0,t.snapshot)(u.OptionsController.state),o=I.getSnapshot().themeMode,n=I.getSnapshot().themeVariables;e?.provider?.syncDappData?.({metadata:r.metadata,sdkVersion:r.sdkVersion,projectId:r.projectId,sdkType:r.sdkType}),e?.provider?.syncTheme({themeMode:o,themeVariables:n,w3mThemeVariables:(0,a.getW3mThemeVariables)(n,o)}),_.setConnectors([e])}else _.setConnectors([e])},getAuthConnector(e){let t=e||l.ChainController.state.activeChain,r=N.connectors.find(e=>e.id===o.ConstantsUtil.CONNECTOR_ID.AUTH);if(r)return r?.connectors?.length?r.connectors.find(e=>e.chain===t):r},getAnnouncedConnectorRdns:()=>N.connectors.filter(e=>"ANNOUNCED"===e.type).map(e=>e.info?.rdns),getConnectorById:e=>N.allConnectors.find(t=>t.id===e),getConnector:(e,t)=>N.allConnectors.filter(e=>e.chain===l.ChainController.state.activeChain).find(r=>r.explorerId===e||r.info?.rdns===t),syncIfAuthConnector(e){if("ID_AUTH"!==e.id)return;let r=(0,t.snapshot)(u.OptionsController.state),o=I.getSnapshot().themeMode,n=I.getSnapshot().themeVariables;e?.provider?.syncDappData?.({metadata:r.metadata,sdkVersion:r.sdkVersion,sdkType:r.sdkType,projectId:r.projectId}),e.provider.syncTheme({themeMode:o,themeVariables:n,w3mThemeVariables:(0,a.getW3mThemeVariables)(n,o)})},getConnectorsByNamespace(e){let t=N.allConnectors.filter(t=>t.chain===e);return _.mergeMultiChainConnectors(t)},selectWalletConnector(e){let t=_.getConnector(e.id,e.rdns),r=l.ChainController.state.activeChain;n.MobileWalletUtil.handleMobileDeeplinkRedirect(t?.explorerId||e.id,r),t?y.push("ConnectingExternal",{connector:t}):y.push("ConnectingWalletConnect",{wallet:e})},getConnectors:e=>e?_.getConnectorsByNamespace(e):_.mergeMultiChainConnectors(N.allConnectors),setFilterByNamespace(e){N.filterByNamespace=e,N.connectors=_.getConnectors(e),c.ApiController.setFilterByNamespace(e)},setConnectorId(e,t){e&&(N.activeConnectorIds={...N.activeConnectorIds,[t]:e},i.StorageUtil.setConnectedConnectorId(t,e))},removeConnectorId(e){N.activeConnectorIds={...N.activeConnectorIds,[e]:void 0},i.StorageUtil.deleteConnectedConnectorId(e)},getConnectorId(e){if(e)return N.activeConnectorIds[e]},isConnected:e=>e?!!N.activeConnectorIds[e]:Object.values(N.activeConnectorIds).some(e=>!!e),resetConnectorIds(){N.activeConnectorIds={...S}}});var x=e.i(247167);void 0!==x.default&&void 0!==x.default.env&&x.default.env.NEXT_PUBLIC_SECURE_SITE_SDK_URL,void 0!==x.default&&void 0!==x.default.env&&x.default.env.NEXT_PUBLIC_DEFAULT_LOG_LEVEL,void 0!==x.default&&void 0!==x.default.env&&x.default.env.NEXT_PUBLIC_SECURE_SITE_SDK_VERSION,e.s(["W3mFrameRpcConstants",0,{SAFE_RPC_METHODS:["eth_accounts","eth_blockNumber","eth_call","eth_chainId","eth_estimateGas","eth_feeHistory","eth_gasPrice","eth_getAccount","eth_getBalance","eth_getBlockByHash","eth_getBlockByNumber","eth_getBlockReceipts","eth_getBlockTransactionCountByHash","eth_getBlockTransactionCountByNumber","eth_getCode","eth_getFilterChanges","eth_getFilterLogs","eth_getLogs","eth_getProof","eth_getStorageAt","eth_getTransactionByBlockHashAndIndex","eth_getTransactionByBlockNumberAndIndex","eth_getTransactionByHash","eth_getTransactionCount","eth_getTransactionReceipt","eth_getUncleCountByBlockHash","eth_getUncleCountByBlockNumber","eth_maxPriorityFeePerGas","eth_newBlockFilter","eth_newFilter","eth_newPendingTransactionFilter","eth_sendRawTransaction","eth_syncing","eth_uninstallFilter","wallet_getCapabilities","wallet_getCallsStatus","eth_getUserOperationReceipt","eth_estimateUserOperationGas","eth_getUserOperationByHash","eth_supportedEntryPoints","wallet_getAssets"],NOT_SAFE_RPC_METHODS:["personal_sign","eth_signTypedData_v4","eth_sendTransaction","solana_signMessage","solana_signTransaction","solana_signAllTransactions","solana_signAndSendTransaction","wallet_sendCalls","wallet_grantPermissions","wallet_revokePermissions","eth_sendUserOperation"],GET_CHAIN_ID:"eth_chainId",RPC_METHOD_NOT_ALLOWED_MESSAGE:"Requested RPC call is not allowed",RPC_METHOD_NOT_ALLOWED_UI_MESSAGE:"Action not allowed",ACCOUNT_TYPES:{EOA:"eoa",SMART_ACCOUNT:"smartAccount"}}],979484)},811424,e=>{"use strict";var t=e.i(365801),r=e.i(127031),o=e.i(227302);let a=Object.freeze({message:"",variant:"success",svg:void 0,open:!1,autoClose:!0}),n=(0,t.proxy)({...a});e.s(["SnackController",0,{state:n,subscribeKey:(e,t)=>(0,r.subscribeKey)(n,e,t),showLoading(e,t={}){this._showMessage({message:e,variant:"loading",...t})},showSuccess(e){this._showMessage({message:e,variant:"success"})},showSvg(e,t){this._showMessage({message:e,svg:t})},showError(e){let t=o.CoreHelperUtil.parseError(e);this._showMessage({message:t,variant:"error"})},hide(){n.message=a.message,n.variant=a.variant,n.svg=a.svg,n.open=a.open,n.autoClose=a.autoClose},_showMessage({message:e,svg:t,variant:r="success",autoClose:o=a.autoClose}){n.open?(n.open=!1,setTimeout(()=>{n.message=e,n.variant=r,n.svg=t,n.open=!0,n.autoClose=o},150)):(n.message=e,n.variant=r,n.svg=t,n.open=!0,n.autoClose=o)}}])},960398,971080,194712,e=>{"use strict";let t;e.s(["ChainController",()=>ChainController],960398);var r=e.i(365801),o=e.i(127031),a=e.i(401564),n=(e.i(681285),e.i(360334),e.i(227302)),i=e.i(758331),s=e.i(592279),c=e.i(820903);e.s(["ConnectionController",()=>v],971080);var l=e.i(149454),u=e.i(653157),d=e.i(803468),p=e.i(221728),g=e.i(979484),m=e.i(24742),w=e.i(82283),h=e.i(811424);let f=(0,r.proxy)({transactions:[],coinbaseTransactions:{},transactionsByYear:{},lastNetworkInView:void 0,loading:!1,empty:!1,next:void 0}),b=(0,s.withErrorBoundary)({state:f,subscribe:e=>(0,r.subscribe)(f,()=>e(f)),setLastNetworkInView(e){f.lastNetworkInView=e},async fetchTransactions(e,t){if(!e)throw Error("Transactions can't be fetched without an accountAddress");f.loading=!0;try{let r=await m.BlockchainApiController.fetchTransactions({account:e,cursor:f.next,onramp:t,cache:"coinbase"===t?"no-cache":void 0,chainId:ChainController.state.activeCaipNetwork?.caipNetworkId}),o=b.filterSpamTransactions(r.data),a=b.filterByConnectedChain(o),n=[...f.transactions,...a];f.loading=!1,"coinbase"===t?f.coinbaseTransactions=b.groupTransactionsByYearAndMonth(f.coinbaseTransactions,r.data):(f.transactions=n,f.transactionsByYear=b.groupTransactionsByYearAndMonth(f.transactionsByYear,a)),f.empty=0===n.length,f.next=r.next?r.next:void 0}catch(r){let t=ChainController.state.activeChain;u.EventsController.sendEvent({type:"track",event:"ERROR_FETCH_TRANSACTIONS",properties:{address:e,projectId:w.OptionsController.state.projectId,cursor:f.next,isSmartAccount:c.AccountController.state.preferredAccountTypes?.[t]===g.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),h.SnackController.showError("Failed to fetch transactions"),f.loading=!1,f.empty=!0,f.next=void 0}},groupTransactionsByYearAndMonth:(e={},t=[])=>(t.forEach(t=>{let r=new Date(t.metadata.minedAt).getFullYear(),o=new Date(t.metadata.minedAt).getMonth(),a=e[r]??{},n=(a[o]??[]).filter(e=>e.id!==t.id);e[r]={...a,[o]:[...n,t].sort((e,t)=>new Date(t.metadata.minedAt).getTime()-new Date(e.metadata.minedAt).getTime())}}),e),filterSpamTransactions:e=>e.filter(e=>!e.transfers.every(e=>e.nft_info?.flags.is_spam===!0)),filterByConnectedChain(e){let t=ChainController.state.activeCaipNetwork?.caipNetworkId;return e.filter(e=>e.metadata.chain===t)},clearCursor(){f.next=void 0},resetTransactions(){f.transactions=[],f.transactionsByYear={},f.lastNetworkInView=void 0,f.loading=!1,f.empty=!1,f.next=void 0}},"API_ERROR"),C=(0,r.proxy)({connections:new Map,wcError:!1,buffering:!1,status:"disconnected"}),v=(0,s.withErrorBoundary)({state:C,subscribeKey:(e,t)=>(0,o.subscribeKey)(C,e,t),_getClient:()=>C._client,setClient(e){C._client=(0,r.ref)(e)},async connectWalletConnect(){if(n.CoreHelperUtil.isTelegram()||n.CoreHelperUtil.isSafari()&&n.CoreHelperUtil.isIos()){if(t){await t,t=void 0;return}if(!n.CoreHelperUtil.isPairingExpired(C?.wcPairingExpiry)){let e=C.wcUri;C.wcUri=e;return}t=v._getClient()?.connectWalletConnect?.().catch(()=>void 0),v.state.status="connecting",await t,t=void 0,C.wcPairingExpiry=void 0,v.state.status="connected"}else await v._getClient()?.connectWalletConnect?.()},async connectExternal(e,t,r=!0){await v._getClient()?.connectExternal?.(e),r&&ChainController.setActiveNamespace(t)},async reconnectExternal(e){await v._getClient()?.reconnectExternal?.(e);let t=e.chain||ChainController.state.activeChain;t&&l.ConnectorController.setConnectorId(e.id,t)},async setPreferredAccountType(e,t){d.ModalController.setLoading(!0,ChainController.state.activeChain);let r=l.ConnectorController.getAuthConnector();r&&(c.AccountController.setPreferredAccountType(e,t),await r.provider.setPreferredAccount(e),i.StorageUtil.setPreferredAccountTypes(c.AccountController.state.preferredAccountTypes??{[t]:e}),await v.reconnectExternal(r),d.ModalController.setLoading(!1,ChainController.state.activeChain),u.EventsController.sendEvent({type:"track",event:"SET_PREFERRED_ACCOUNT_TYPE",properties:{accountType:e,network:ChainController.state.activeCaipNetwork?.caipNetworkId||""}}))},signMessage:async e=>v._getClient()?.signMessage(e),parseUnits:(e,t)=>v._getClient()?.parseUnits(e,t),formatUnits:(e,t)=>v._getClient()?.formatUnits(e,t),sendTransaction:async e=>v._getClient()?.sendTransaction(e),getCapabilities:async e=>v._getClient()?.getCapabilities(e),grantPermissions:async e=>v._getClient()?.grantPermissions(e),walletGetAssets:async e=>v._getClient()?.walletGetAssets(e)??{},estimateGas:async e=>v._getClient()?.estimateGas(e),writeContract:async e=>v._getClient()?.writeContract(e),getEnsAddress:async e=>v._getClient()?.getEnsAddress(e),getEnsAvatar:async e=>v._getClient()?.getEnsAvatar(e),checkInstalled:e=>v._getClient()?.checkInstalled?.(e)||!1,resetWcConnection(){C.wcUri=void 0,C.wcPairingExpiry=void 0,C.wcLinking=void 0,C.recentWallet=void 0,C.status="disconnected",b.resetTransactions(),i.StorageUtil.deleteWalletConnectDeepLink()},resetUri(){C.wcUri=void 0,C.wcPairingExpiry=void 0,t=void 0},finalizeWcConnection(){let{wcLinking:e,recentWallet:t}=v.state;e&&i.StorageUtil.setWalletConnectDeepLink(e),t&&i.StorageUtil.setAppKitRecent(t),u.EventsController.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:e?"mobile":"qrcode",name:p.RouterController.state.data?.wallet?.name||"Unknown"}})},setWcBasic(e){C.wcBasic=e},setUri(e){C.wcUri=e,C.wcPairingExpiry=n.CoreHelperUtil.getPairingExpiry()},setWcLinking(e){C.wcLinking=e},setWcError(e){C.wcError=e,C.buffering=!1},setRecentWallet(e){C.recentWallet=e},setBuffering(e){C.buffering=e},setStatus(e){C.status=e},async disconnect(e){try{await v._getClient()?.disconnect(e)}catch(e){throw new s.AppKitError("Failed to disconnect","INTERNAL_SDK_ERROR",e)}},setConnections(e,t){C.connections.set(t,e)},switchAccount({connection:e,address:t,namespace:r}){if(l.ConnectorController.state.activeConnectorIds[r]===e.connectorId){let e=ChainController.state.activeCaipNetwork;if(e){let o=`${r}:${e.id}:${t}`;c.AccountController.setCaipAddress(o,r)}else console.warn(`No current network found for namespace "${r}"`)}else{let t=l.ConnectorController.getConnector(e.connectorId);t?v.connectExternal(t,r):console.warn(`No connector found for namespace "${r}"`)}}});e.i(77277),e.s(["SendController",()=>SendController],194712);var y="[big.js] ",E=y+"Invalid ",A=E+"decimal places",I=E+"rounding mode",S=y+"Division by zero",N={},_=void 0,x=/^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;function T(e,t,r,o){var a=e.c;if(r===_&&(r=e.constructor.RM),0!==r&&1!==r&&2!==r&&3!==r)throw Error(I);if(t<1)o=3===r&&(o||!!a[0])||0===t&&(1===r&&a[0]>=5||2===r&&(a[0]>5||5===a[0]&&(o||a[1]!==_))),a.length=1,o?(e.e=e.e-t+1,a[0]=1):a[0]=e.e=0;else if(t<a.length){if(o=1===r&&a[t]>=5||2===r&&(a[t]>5||5===a[t]&&(o||a[t+1]!==_||1&a[t-1]))||3===r&&(o||!!a[0]),a.length=t,o){for(;++a[--t]>9;)if(a[t]=0,0===t){++e.e,a.unshift(1);break}}for(t=a.length;!a[--t];)a.pop()}return e}function k(e,t,r){var o=e.e,a=e.c.join(""),n=a.length;if(t)a=a.charAt(0)+(n>1?"."+a.slice(1):"")+(o<0?"e":"e+")+o;else if(o<0){for(;++o;)a="0"+a;a="0."+a}else if(o>0)if(++o>n)for(o-=n;o--;)a+="0";else o<n&&(a=a.slice(0,o)+"."+a.slice(o));else n>1&&(a=a.charAt(0)+"."+a.slice(1));return e.s<0&&r?"-"+a:a}N.abs=function(){var e=new this.constructor(this);return e.s=1,e},N.cmp=function(e){var t,r=this.c,o=(e=new this.constructor(e)).c,a=this.s,n=e.s,i=this.e,s=e.e;if(!r[0]||!o[0])return r[0]?a:o[0]?-n:0;if(a!=n)return a;if(t=a<0,i!=s)return i>s^t?1:-1;for(a=-1,n=(i=r.length)<(s=o.length)?i:s;++a<n;)if(r[a]!=o[a])return r[a]>o[a]^t?1:-1;return i==s?0:i>s^t?1:-1},N.div=function(e){var t=this.constructor,r=this.c,o=(e=new t(e)).c,a=this.s==e.s?1:-1,n=t.DP;if(n!==~~n||n<0||n>1e6)throw Error(A);if(!o[0])throw Error(S);if(!r[0])return e.s=a,e.c=[e.e=0],e;var i,s,c,l,u,d=o.slice(),p=i=o.length,g=r.length,m=r.slice(0,i),w=m.length,h=e,f=h.c=[],b=0,C=n+(h.e=this.e-e.e)+1;for(h.s=a,a=C<0?0:C,d.unshift(0);w++<i;)m.push(0);do{for(c=0;c<10;c++){if(i!=(w=m.length))l=i>w?1:-1;else for(u=-1,l=0;++u<i;)if(o[u]!=m[u]){l=o[u]>m[u]?1:-1;break}if(l<0){for(s=w==i?o:d;w;){if(m[--w]<s[w]){for(u=w;u&&!m[--u];)m[u]=9;--m[u],m[w]+=10}m[w]-=s[w]}for(;!m[0];)m.shift()}else break}f[b++]=l?c:++c,m[0]&&l?m[w]=r[p]||0:m=[r[p]]}while((p++<g||m[0]!==_)&&a--)return!f[0]&&1!=b&&(f.shift(),h.e--,C--),b>C&&T(h,C,t.RM,m[0]!==_),h},N.eq=function(e){return 0===this.cmp(e)},N.gt=function(e){return this.cmp(e)>0},N.gte=function(e){return this.cmp(e)>-1},N.lt=function(e){return 0>this.cmp(e)},N.lte=function(e){return 1>this.cmp(e)},N.minus=N.sub=function(e){var t,r,o,a,n=this.constructor,i=this.s,s=(e=new n(e)).s;if(i!=s)return e.s=-s,this.plus(e);var c=this.c.slice(),l=this.e,u=e.c,d=e.e;if(!c[0]||!u[0])return u[0]?e.s=-s:c[0]?e=new n(this):e.s=1,e;if(i=l-d){for((a=i<0)?(i=-i,o=c):(d=l,o=u),o.reverse(),s=i;s--;)o.push(0);o.reverse()}else for(r=((a=c.length<u.length)?c:u).length,i=s=0;s<r;s++)if(c[s]!=u[s]){a=c[s]<u[s];break}if(a&&(o=c,c=u,u=o,e.s=-e.s),(s=(r=u.length)-(t=c.length))>0)for(;s--;)c[t++]=0;for(s=t;r>i;){if(c[--r]<u[r]){for(t=r;t&&!c[--t];)c[t]=9;--c[t],c[r]+=10}c[r]-=u[r]}for(;0===c[--s];)c.pop();for(;0===c[0];)c.shift(),--d;return c[0]||(e.s=1,c=[d=0]),e.c=c,e.e=d,e},N.mod=function(e){var t,r=this,o=r.constructor,a=r.s,n=(e=new o(e)).s;if(!e.c[0])throw Error(S);return(r.s=e.s=1,t=1==e.cmp(r),r.s=a,e.s=n,t)?new o(r):(a=o.DP,n=o.RM,o.DP=o.RM=0,r=r.div(e),o.DP=a,o.RM=n,this.minus(r.times(e)))},N.neg=function(){var e=new this.constructor(this);return e.s=-e.s,e},N.plus=N.add=function(e){var t,r,o,a=this.constructor;if(e=new a(e),this.s!=e.s)return e.s=-e.s,this.minus(e);var n=this.e,i=this.c,s=e.e,c=e.c;if(!i[0]||!c[0])return c[0]||(i[0]?e=new a(this):e.s=this.s),e;if(i=i.slice(),t=n-s){for(t>0?(s=n,o=c):(t=-t,o=i),o.reverse();t--;)o.push(0);o.reverse()}for(i.length-c.length<0&&(o=c,c=i,i=o),t=c.length,r=0;t;i[t]%=10)r=(i[--t]=i[t]+c[t]+r)/10|0;for(r&&(i.unshift(r),++s),t=i.length;0===i[--t];)i.pop();return e.c=i,e.e=s,e},N.pow=function(e){var t=this,r=new t.constructor("1"),o=r,a=e<0;if(e!==~~e||e<-1e6||e>1e6)throw Error(E+"exponent");for(a&&(e=-e);1&e&&(o=o.times(t)),e>>=1;)t=t.times(t);return a?r.div(o):o},N.prec=function(e,t){if(e!==~~e||e<1||e>1e6)throw Error(E+"precision");return T(new this.constructor(this),e,t)},N.round=function(e,t){if(e===_)e=0;else if(e!==~~e||e<-1e6||e>1e6)throw Error(A);return T(new this.constructor(this),e+this.e+1,t)},N.sqrt=function(){var e,t,r,o=this.constructor,a=this.s,n=this.e,i=new o("0.5");if(!this.c[0])return new o(this);if(a<0)throw Error(y+"No square root");0===(a=Math.sqrt(+k(this,!0,!0)))||a===1/0?((t=this.c.join("")).length+n&1||(t+="0"),n=((n+1)/2|0)-(n<0||1&n),e=new o(((a=Math.sqrt(t))==1/0?"5e":(a=a.toExponential()).slice(0,a.indexOf("e")+1))+n)):e=new o(a+""),n=e.e+(o.DP+=4);do r=e,e=i.times(r.plus(this.div(r)));while(r.c.slice(0,n).join("")!==e.c.slice(0,n).join(""))return T(e,(o.DP-=4)+e.e+1,o.RM)},N.times=N.mul=function(e){var t,r=this.constructor,o=this.c,a=(e=new r(e)).c,n=o.length,i=a.length,s=this.e,c=e.e;if(e.s=this.s==e.s?1:-1,!o[0]||!a[0])return e.c=[e.e=0],e;for(e.e=s+c,n<i&&(t=o,o=a,a=t,c=n,n=i,i=c),t=Array(c=n+i);c--;)t[c]=0;for(s=i;s--;){for(i=0,c=n+s;c>s;)i=t[c]+a[s]*o[c-s-1]+i,t[c--]=i%10,i=i/10|0;t[c]=i}for(i?++e.e:t.shift(),s=t.length;!t[--s];)t.pop();return e.c=t,e},N.toExponential=function(e,t){var r=this,o=r.c[0];if(e!==_){if(e!==~~e||e<0||e>1e6)throw Error(A);for(r=T(new r.constructor(r),++e,t);r.c.length<e;)r.c.push(0)}return k(r,!0,!!o)},N.toFixed=function(e,t){var r=this,o=r.c[0];if(e!==_){if(e!==~~e||e<0||e>1e6)throw Error(A);for(r=T(new r.constructor(r),e+r.e+1,t),e=e+r.e+1;r.c.length<e;)r.c.push(0)}return k(r,!1,!!o)},N[Symbol.for("nodejs.util.inspect.custom")]=N.toJSON=N.toString=function(){var e=this.constructor;return k(this,this.e<=e.NE||this.e>=e.PE,!!this.c[0])},N.toNumber=function(){var e=+k(this,!0,!0);if(!0===this.constructor.strict&&!this.eq(e.toString()))throw Error(y+"Imprecise conversion");return e},N.toPrecision=function(e,t){var r=this,o=r.constructor,a=r.c[0];if(e!==_){if(e!==~~e||e<1||e>1e6)throw Error(E+"precision");for(r=T(new o(r),e,t);r.c.length<e;)r.c.push(0)}return k(r,e<=r.e||r.e<=o.NE||r.e>=o.PE,!!a)},N.valueOf=function(){var e=this.constructor;if(!0===e.strict)throw Error(y+"valueOf disallowed");return k(this,this.e<=e.NE||this.e>=e.PE,!0)};(function e(){function t(r){if(!(this instanceof t))return r===_?e():new t(r);if(r instanceof t)this.s=r.s,this.e=r.e,this.c=r.c.slice();else{if("string"!=typeof r){if(!0===t.strict&&"bigint"!=typeof r)throw TypeError(E+"value");r=0===r&&1/r<0?"-0":String(r)}!function(e,t){var r,o,a;if(!x.test(t))throw Error(E+"number");for(e.s="-"==t.charAt(0)?(t=t.slice(1),-1):1,(r=t.indexOf("."))>-1&&(t=t.replace(".","")),(o=t.search(/e/i))>0?(r<0&&(r=o),r+=+t.slice(o+1),t=t.substring(0,o)):r<0&&(r=t.length),a=t.length,o=0;o<a&&"0"==t.charAt(o);)++o;if(o==a)e.c=[e.e=0];else{for(;a>0&&"0"==t.charAt(--a););for(e.e=r-o-1,e.c=[],r=0;o<=a;)e.c[r++]=+t.charAt(o++)}}(this,r)}this.constructor=t}return t.prototype=N,t.DP=20,t.RM=1,t.NE=-7,t.PE=21,t.strict=!1,t.roundDown=0,t.roundHalfUp=1,t.roundHalfEven=2,t.roundUp=3,t})();let O=[{type:"function",name:"transfer",stateMutability:"nonpayable",inputs:[{name:"_to",type:"address"},{name:"_value",type:"uint256"}],outputs:[{name:"",type:"bool"}]},{type:"function",name:"transferFrom",stateMutability:"nonpayable",inputs:[{name:"_from",type:"address"},{name:"_to",type:"address"},{name:"_value",type:"uint256"}],outputs:[{name:"",type:"bool"}]}],U=[{type:"function",name:"transfer",stateMutability:"nonpayable",inputs:[{name:"recipient",type:"address"},{name:"amount",type:"uint256"}],outputs:[]},{type:"function",name:"transferFrom",stateMutability:"nonpayable",inputs:[{name:"sender",type:"address"},{name:"recipient",type:"address"},{name:"amount",type:"uint256"}],outputs:[{name:"",type:"bool"}]}],P=Error("Cannot find module 'viem'");throw P.code="MODULE_NOT_FOUND",P},820903,24742,e=>{"use strict";e.s(["AccountController",()=>w],820903);var t=e.i(365801),r=e.i(360334),o=e.i(227302),a=e.i(592279);e.s(["BlockchainApiController",()=>g],24742);var n=e.i(364258),i=e.i(758331),s=e.i(960398),c=e.i(82283),l=e.i(811424);let u={purchaseCurrencies:[{id:"2b92315d-eab7-5bef-84fa-089a131333f5",name:"USD Coin",symbol:"USDC",networks:[{name:"ethereum-mainnet",display_name:"Ethereum",chain_id:"1",contract_address:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},{name:"polygon-mainnet",display_name:"Polygon",chain_id:"137",contract_address:"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"}]},{id:"2b92315d-eab7-5bef-84fa-089a131333f5",name:"Ether",symbol:"ETH",networks:[{name:"ethereum-mainnet",display_name:"Ethereum",chain_id:"1",contract_address:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"},{name:"polygon-mainnet",display_name:"Polygon",chain_id:"137",contract_address:"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"}]}],paymentCurrencies:[{id:"USD",payment_method_limits:[{id:"card",min:"10.00",max:"7500.00"},{id:"ach_bank_account",min:"10.00",max:"25000.00"}]},{id:"EUR",payment_method_limits:[{id:"card",min:"10.00",max:"7500.00"},{id:"ach_bank_account",min:"10.00",max:"25000.00"}]}]},d=o.CoreHelperUtil.getBlockchainApiUrl(),p=(0,t.proxy)({clientId:null,api:new n.FetchUtil({baseUrl:d,clientId:null}),supportedChains:{http:[],ws:[]}}),g={state:p,async get(e){let{st:t,sv:r}=g.getSdkProperties(),o=c.OptionsController.state.projectId,a={...e.params||{},st:t,sv:r,projectId:o};return p.api.get({...e,params:a})},getSdkProperties(){let{sdkType:e,sdkVersion:t}=c.OptionsController.state;return{st:e||"unknown",sv:t||"unknown"}},async isNetworkSupported(e){if(!e)return!1;try{p.supportedChains.http.length||await g.getSupportedNetworks()}catch(e){return!1}return p.supportedChains.http.includes(e)},async getSupportedNetworks(){try{let e=await g.get({path:"v1/supported-chains"});return p.supportedChains=e,e}catch{return p.supportedChains}},async fetchIdentity({address:e,caipNetworkId:t}){if(!await g.isNetworkSupported(t))return{avatar:"",name:""};let r=i.StorageUtil.getIdentityFromCacheForAddress(e);if(r)return r;let a=await g.get({path:`/v1/identity/${e}`,params:{sender:s.ChainController.state.activeCaipAddress?o.CoreHelperUtil.getPlainAddress(s.ChainController.state.activeCaipAddress):void 0}});return i.StorageUtil.updateIdentityCache({address:e,identity:a,timestamp:Date.now()}),a},fetchTransactions:async({account:e,cursor:t,onramp:r,signal:o,cache:a,chainId:n})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:`/v1/account/${e}/history`,params:{cursor:t,onramp:r,chainId:n},signal:o,cache:a}):{data:[],next:void 0},fetchSwapQuote:async({amount:e,userAddress:t,from:r,to:o,gasPrice:a})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:"/v1/convert/quotes",headers:{"Content-Type":"application/json"},params:{amount:e,userAddress:t,from:r,to:o,gasPrice:a}}):{quotes:[]},fetchSwapTokens:async({chainId:e})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:"/v1/convert/tokens",params:{chainId:e}}):{tokens:[]},fetchTokenPrice:async({addresses:e})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?p.api.post({path:"/v1/fungible/price",body:{currency:"usd",addresses:e,projectId:c.OptionsController.state.projectId},headers:{"Content-Type":"application/json"}}):{fungibles:[]},fetchSwapAllowance:async({tokenAddress:e,userAddress:t})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:"/v1/convert/allowance",params:{tokenAddress:e,userAddress:t},headers:{"Content-Type":"application/json"}}):{allowance:"0"},async fetchGasPrice({chainId:e}){let{st:t,sv:r}=g.getSdkProperties();if(!await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))throw Error("Network not supported for Gas Price");return g.get({path:"/v1/convert/gas-price",headers:{"Content-Type":"application/json"},params:{chainId:e,st:t,sv:r}})},async generateSwapCalldata({amount:e,from:t,to:o,userAddress:a,disableEstimate:n}){if(!await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))throw Error("Network not supported for Swaps");return p.api.post({path:"/v1/convert/build-transaction",headers:{"Content-Type":"application/json"},body:{amount:e,eip155:{slippage:r.ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE},projectId:c.OptionsController.state.projectId,from:t,to:o,userAddress:a,disableEstimate:n}})},async generateApproveCalldata({from:e,to:t,userAddress:r}){let{st:o,sv:a}=g.getSdkProperties();if(!await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))throw Error("Network not supported for Swaps");return g.get({path:"/v1/convert/build-approve",headers:{"Content-Type":"application/json"},params:{userAddress:r,from:e,to:t,st:o,sv:a}})},async getBalance(e,t,r){let{st:o,sv:a}=g.getSdkProperties();if(!await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))return l.SnackController.showError("Token Balance Unavailable"),{balances:[]};let n=`${t}:${e}`,c=i.StorageUtil.getBalanceCacheForCaipAddress(n);if(c)return c;let u=await g.get({path:`/v1/account/${e}/balance`,params:{currency:"usd",chainId:t,forceUpdate:r,st:o,sv:a}});return i.StorageUtil.updateBalanceCache({caipAddress:n,balance:u,timestamp:Date.now()}),u},lookupEnsName:async e=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:`/v1/profile/account/${e}`,params:{apiVersion:"2"}}):{addresses:{},attributes:[]},reverseLookupEnsName:async({address:e})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:`/v1/profile/reverse/${e}`,params:{sender:w.state.address,apiVersion:"2"}}):[],getEnsNameSuggestions:async e=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:`/v1/profile/suggestions/${e}`,params:{zone:"reown.id"}}):{suggestions:[]},registerEnsName:async({coinType:e,address:t,message:r,signature:o})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?p.api.post({path:"/v1/profile/account",body:{coin_type:e,address:t,message:r,signature:o},headers:{"Content-Type":"application/json"}}):{success:!1},generateOnRampURL:async({destinationWallets:e,partnerUserId:t,defaultNetwork:r,purchaseAmount:o,paymentAmount:a})=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?(await p.api.post({path:"/v1/generators/onrampurl",params:{projectId:c.OptionsController.state.projectId},body:{destinationWallets:e,defaultNetwork:r,partnerUserId:t,defaultExperience:"buy",presetCryptoAmount:o,presetFiatAmount:a}})).url:"",async getOnrampOptions(){if(!await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))return{paymentCurrencies:[],purchaseCurrencies:[]};try{return await g.get({path:"/v1/onramp/options"})}catch(e){return u}},async getOnrampQuote({purchaseCurrency:e,paymentCurrency:t,amount:r,network:o}){try{if(!await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId))return null;return await p.api.post({path:"/v1/onramp/quote",params:{projectId:c.OptionsController.state.projectId},body:{purchaseCurrency:e,paymentCurrency:t,amount:r,network:o}})}catch(e){return{coinbaseFee:{amount:r,currency:t.id},networkFee:{amount:r,currency:t.id},paymentSubtotal:{amount:r,currency:t.id},paymentTotal:{amount:r,currency:t.id},purchaseAmount:{amount:r,currency:t.id},quoteId:"mocked-quote-id"}}},getSmartSessions:async e=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?g.get({path:`/v1/sessions/${e}`}):[],revokeSmartSession:async(e,t,r)=>await g.isNetworkSupported(s.ChainController.state.activeCaipNetwork?.caipNetworkId)?p.api.post({path:`/v1/sessions/${e}/revoke`,params:{projectId:c.OptionsController.state.projectId},body:{pci:t,signature:r}}):{success:!1},setClientId(e){p.clientId=e,p.api=new n.FetchUtil({baseUrl:d,clientId:e})}},m=(0,t.proxy)({currentTab:0,tokenBalance:[],smartAccountDeployed:!1,addressLabels:new Map,allAccounts:[]}),w=(0,a.withErrorBoundary)({state:m,replaceState(e){e&&Object.assign(m,(0,t.ref)(e))},subscribe:e=>s.ChainController.subscribeChainProp("accountState",t=>{if(t)return e(t)}),subscribeKey(e,t,r){let o;return s.ChainController.subscribeChainProp("accountState",r=>{if(r){let a=r[e];o!==a&&(o=a,t(a))}},r)},setStatus(e,t){s.ChainController.setAccountProp("status",e,t)},getCaipAddress:e=>s.ChainController.getAccountProp("caipAddress",e),setCaipAddress(e,t){let r=e?o.CoreHelperUtil.getPlainAddress(e):void 0;t===s.ChainController.state.activeChain&&(s.ChainController.state.activeCaipAddress=e),s.ChainController.setAccountProp("caipAddress",e,t),s.ChainController.setAccountProp("address",r,t)},setBalance(e,t,r){s.ChainController.setAccountProp("balance",e,r),s.ChainController.setAccountProp("balanceSymbol",t,r)},setProfileName(e,t){s.ChainController.setAccountProp("profileName",e,t)},setProfileImage(e,t){s.ChainController.setAccountProp("profileImage",e,t)},setUser(e,t){s.ChainController.setAccountProp("user",e,t)},setAddressExplorerUrl(e,t){s.ChainController.setAccountProp("addressExplorerUrl",e,t)},setSmartAccountDeployed(e,t){s.ChainController.setAccountProp("smartAccountDeployed",e,t)},setCurrentTab(e){s.ChainController.setAccountProp("currentTab",e,s.ChainController.state.activeChain)},setTokenBalance(e,t){e&&s.ChainController.setAccountProp("tokenBalance",e,t)},setShouldUpdateToAddress(e,t){s.ChainController.setAccountProp("shouldUpdateToAddress",e,t)},setAllAccounts(e,t){s.ChainController.setAccountProp("allAccounts",e,t)},addAddressLabel(e,t,r){let o=s.ChainController.getAccountProp("addressLabels",r)||new Map;o.set(e,t),s.ChainController.setAccountProp("addressLabels",o,r)},removeAddressLabel(e,t){let r=s.ChainController.getAccountProp("addressLabels",t)||new Map;r.delete(e),s.ChainController.setAccountProp("addressLabels",r,t)},setConnectedWalletInfo(e,t){s.ChainController.setAccountProp("connectedWalletInfo",e,t,!1)},setPreferredAccountType(e,t){s.ChainController.setAccountProp("preferredAccountTypes",{...m.preferredAccountTypes,[t]:e},t)},setPreferredAccountTypes(e){m.preferredAccountTypes=e},setSocialProvider(e,t){e&&s.ChainController.setAccountProp("socialProvider",e,t)},setSocialWindow(e,r){s.ChainController.setAccountProp("socialWindow",e?(0,t.ref)(e):void 0,r)},setFarcasterUrl(e,t){s.ChainController.setAccountProp("farcasterUrl",e,t)},async fetchTokenBalance(e){m.balanceLoading=!0;let t=s.ChainController.state.activeCaipNetwork?.caipNetworkId,a=s.ChainController.state.activeCaipNetwork?.chainNamespace,n=s.ChainController.state.activeCaipAddress,i=n?o.CoreHelperUtil.getPlainAddress(n):void 0;if(m.lastRetry&&!o.CoreHelperUtil.isAllowedRetry(m.lastRetry,30*r.ConstantsUtil.ONE_SEC_MS))return m.balanceLoading=!1,[];try{if(i&&t&&a){let e=(await g.getBalance(i,t)).balances.filter(e=>"0"!==e.quantity.decimals);return w.setTokenBalance(e,a),m.lastRetry=void 0,m.balanceLoading=!1,e}}catch(t){m.lastRetry=Date.now(),e?.(t),l.SnackController.showError("Token Balance Unavailable")}finally{m.balanceLoading=!1}return[]},resetAccount(e){s.ChainController.resetAccount(e)}})},542904,e=>{"use strict";var t=e.i(247167);let r={ACCOUNT_TABS:[{label:"Tokens"},{label:"NFTs"},{label:"Activity"}],SECURE_SITE_ORIGIN:(void 0!==t.default&&void 0!==t.default.env?t.default.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org",VIEW_DIRECTION:{Next:"next",Prev:"prev"},DEFAULT_CONNECT_METHOD_ORDER:["email","social","wallet"],ANIMATION_DURATIONS:{HeaderText:120,ModalHeight:150,ViewTransition:150}};e.s(["ConstantsUtil",0,r])},608601,e=>{"use strict";e.s([])},592057,e=>{"use strict";var t=e.i(131507),r=e.i(315193);e.s(["CSSResult",()=>r.CSSResult,"ReactiveElement",()=>t.ReactiveElement,"adoptStyles",()=>r.adoptStyles,"css",()=>r.css,"defaultConverter",()=>t.defaultConverter,"getCompatibleStyle",()=>r.getCompatibleStyle,"notEqual",()=>t.notEqual,"supportsAdoptingStyleSheets",()=>r.supportsAdoptingStyleSheets,"unsafeCSS",()=>r.unsafeCSS])},822315,(e,t,r)=>{e.e,t.exports=function(){"use strict";var e="millisecond",t="second",r="minute",o="hour",a="week",n="month",i="quarter",s="year",c="date",l="Invalid Date",u=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,d=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,p=function(e,t,r){var o=String(e);return!o||o.length>=t?e:""+Array(t+1-o.length).join(r)+e},g="en",m={};m[g]={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],r=e%100;return"["+e+(t[(r-20)%10]||t[r]||t[0])+"]"}};var w="$isDayjsObject",h=function(e){return e instanceof v||!(!e||!e[w])},f=function e(t,r,o){var a;if(!t)return g;if("string"==typeof t){var n=t.toLowerCase();m[n]&&(a=n),r&&(m[n]=r,a=n);var i=t.split("-");if(!a&&i.length>1)return e(i[0])}else{var s=t.name;m[s]=t,a=s}return!o&&a&&(g=a),a||!o&&g},b=function(e,t){if(h(e))return e.clone();var r="object"==typeof t?t:{};return r.date=e,r.args=arguments,new v(r)},C={s:p,z:function(e){var t=-e.utcOffset(),r=Math.abs(t);return(t<=0?"+":"-")+p(Math.floor(r/60),2,"0")+":"+p(r%60,2,"0")},m:function e(t,r){if(t.date()<r.date())return-e(r,t);var o=12*(r.year()-t.year())+(r.month()-t.month()),a=t.clone().add(o,n),i=r-a<0,s=t.clone().add(o+(i?-1:1),n);return+(-(o+(r-a)/(i?a-s:s-a))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(l){return({M:n,y:s,w:a,d:"day",D:c,h:o,m:r,s:t,ms:e,Q:i})[l]||String(l||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}};C.l=f,C.i=h,C.w=function(e,t){return b(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var v=function(){function p(e){this.$L=f(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[w]=!0}var g=p.prototype;return g.parse=function(e){this.$d=function(e){var t=e.date,r=e.utc;if(null===t)return new Date(NaN);if(C.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var o=t.match(u);if(o){var a=o[2]-1||0,n=(o[7]||"0").substring(0,3);return r?new Date(Date.UTC(o[1],a,o[3]||1,o[4]||0,o[5]||0,o[6]||0,n)):new Date(o[1],a,o[3]||1,o[4]||0,o[5]||0,o[6]||0,n)}}return new Date(t)}(e),this.init()},g.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},g.$utils=function(){return C},g.isValid=function(){return this.$d.toString()!==l},g.isSame=function(e,t){var r=b(e);return this.startOf(t)<=r&&r<=this.endOf(t)},g.isAfter=function(e,t){return b(e)<this.startOf(t)},g.isBefore=function(e,t){return this.endOf(t)<b(e)},g.$g=function(e,t,r){return C.u(e)?this[t]:this.set(r,e)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(e,i){var l=this,u=!!C.u(i)||i,d=C.p(e),p=function(e,t){var r=C.w(l.$u?Date.UTC(l.$y,t,e):new Date(l.$y,t,e),l);return u?r:r.endOf("day")},g=function(e,t){return C.w(l.toDate()[e].apply(l.toDate("s"),(u?[0,0,0,0]:[23,59,59,999]).slice(t)),l)},m=this.$W,w=this.$M,h=this.$D,f="set"+(this.$u?"UTC":"");switch(d){case s:return u?p(1,0):p(31,11);case n:return u?p(1,w):p(0,w+1);case a:var b=this.$locale().weekStart||0,v=(m<b?m+7:m)-b;return p(u?h-v:h+(6-v),w);case"day":case c:return g(f+"Hours",0);case o:return g(f+"Minutes",1);case r:return g(f+"Seconds",2);case t:return g(f+"Milliseconds",3);default:return this.clone()}},g.endOf=function(e){return this.startOf(e,!1)},g.$set=function(a,i){var l,u=C.p(a),d="set"+(this.$u?"UTC":""),p=((l={}).day=d+"Date",l[c]=d+"Date",l[n]=d+"Month",l[s]=d+"FullYear",l[o]=d+"Hours",l[r]=d+"Minutes",l[t]=d+"Seconds",l[e]=d+"Milliseconds",l)[u],g="day"===u?this.$D+(i-this.$W):i;if(u===n||u===s){var m=this.clone().set(c,1);m.$d[p](g),m.init(),this.$d=m.set(c,Math.min(this.$D,m.daysInMonth())).$d}else p&&this.$d[p](g);return this.init(),this},g.set=function(e,t){return this.clone().$set(e,t)},g.get=function(e){return this[C.p(e)]()},g.add=function(e,i){var c,l=this;e=Number(e);var u=C.p(i),d=function(t){var r=b(l);return C.w(r.date(r.date()+Math.round(t*e)),l)};if(u===n)return this.set(n,this.$M+e);if(u===s)return this.set(s,this.$y+e);if("day"===u)return d(1);if(u===a)return d(7);var p=((c={})[r]=6e4,c[o]=36e5,c[t]=1e3,c)[u]||1,g=this.$d.getTime()+e*p;return C.w(g,this)},g.subtract=function(e,t){return this.add(-1*e,t)},g.format=function(e){var t=this,r=this.$locale();if(!this.isValid())return r.invalidDate||l;var o=e||"YYYY-MM-DDTHH:mm:ssZ",a=C.z(this),n=this.$H,i=this.$m,s=this.$M,c=r.weekdays,u=r.months,p=r.meridiem,g=function(e,r,a,n){return e&&(e[r]||e(t,o))||a[r].slice(0,n)},m=function(e){return C.s(n%12||12,e,"0")},w=p||function(e,t,r){var o=e<12?"AM":"PM";return r?o.toLowerCase():o};return o.replace(d,function(e,o){return o||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return C.s(t.$y,4,"0");case"M":return s+1;case"MM":return C.s(s+1,2,"0");case"MMM":return g(r.monthsShort,s,u,3);case"MMMM":return g(u,s);case"D":return t.$D;case"DD":return C.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return g(r.weekdaysMin,t.$W,c,2);case"ddd":return g(r.weekdaysShort,t.$W,c,3);case"dddd":return c[t.$W];case"H":return String(n);case"HH":return C.s(n,2,"0");case"h":return m(1);case"hh":return m(2);case"a":return w(n,i,!0);case"A":return w(n,i,!1);case"m":return String(i);case"mm":return C.s(i,2,"0");case"s":return String(t.$s);case"ss":return C.s(t.$s,2,"0");case"SSS":return C.s(t.$ms,3,"0");case"Z":return a}return null}(e)||a.replace(":","")})},g.utcOffset=function(){return-(15*Math.round(this.$d.getTimezoneOffset()/15))},g.diff=function(e,c,l){var u,d=this,p=C.p(c),g=b(e),m=(g.utcOffset()-this.utcOffset())*6e4,w=this-g,h=function(){return C.m(d,g)};switch(p){case s:u=h()/12;break;case n:u=h();break;case i:u=h()/3;break;case a:u=(w-m)/6048e5;break;case"day":u=(w-m)/864e5;break;case o:u=w/36e5;break;case r:u=w/6e4;break;case t:u=w/1e3;break;default:u=w}return l?u:C.a(u)},g.daysInMonth=function(){return this.endOf(n).$D},g.$locale=function(){return m[this.$L]},g.locale=function(e,t){if(!e)return this.$L;var r=this.clone(),o=f(e,t,!0);return o&&(r.$L=o),r},g.clone=function(){return C.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},p}(),y=v.prototype;return b.prototype=y,[["$ms",e],["$s",t],["$m",r],["$H",o],["$W","day"],["$M",n],["$y",s],["$D",c]].forEach(function(e){y[e[1]]=function(t){return this.$g(t,e[0],e[1])}}),b.extend=function(e,t){return e.$i||(e(t,v,b),e.$i=!0),b},b.locale=f,b.isDayjs=h,b.unix=function(e){return b(1e3*e)},b.en=m[g],b.Ls=m,b.p={},b}()},396931,(e,t,r)=>{e.e,t.exports={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],r=e%100;return"["+e+(t[(r-20)%10]||t[r]||t[0])+"]"}}},472856,(e,t,r)=>{e.e,t.exports=function(e,t,r){e=e||{};var o=t.prototype,a={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function n(e,t,r,a){return o.fromToBase(e,t,r,a)}r.en.relativeTime=a,o.fromToBase=function(t,o,n,i,s){for(var c,l,u,d=n.$locale().relativeTime||a,p=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],g=p.length,m=0;m<g;m+=1){var w=p[m];w.d&&(c=i?r(t).diff(n,w.d,!0):n.diff(t,w.d,!0));var h=(e.rounding||Math.round)(Math.abs(c));if(u=c>0,h<=w.r||!w.r){h<=1&&m>0&&(w=p[m-1]);var f=d[w.l];s&&(h=s(""+h)),l="string"==typeof f?f.replace("%d",h):f(h,o,w.l,u);break}}if(o)return l;var b=u?d.future:d.past;return"function"==typeof b?b(l):b.replace("%s",l)},o.to=function(e,t){return n(e,t,this,!0)},o.from=function(e,t){return n(e,t,this)};var i=function(e){return e.$u?r.utc():r()};o.toNow=function(e){return this.to(i(this),e)},o.fromNow=function(e){return this.from(i(this),e)}}},83840,(e,t,r)=>{e.e,t.exports=function(e,t,r){r.updateLocale=function(e,t){var o=r.Ls[e];if(o)return(t?Object.keys(t):[]).forEach(function(e){o[e]=t[e]}),o}}},404041,459088,112699,645975,e=>{"use strict";let t,r,o;e.i(608601),e.i(812207);var a=e.i(592057),n=e.i(90068);function i(e,a){t=document.createElement("style"),r=document.createElement("style"),o=document.createElement("style"),t.textContent=l(e).core.cssText,r.textContent=l(e).dark.cssText,o.textContent=l(e).light.cssText,document.head.appendChild(t),document.head.appendChild(r),document.head.appendChild(o),s(a)}function s(e){r&&o&&("light"===e?(r.removeAttribute("media"),o.media="enabled"):(o.removeAttribute("media"),r.media="enabled"))}function c(e){t&&r&&o&&(t.textContent=l(e).core.cssText,r.textContent=l(e).dark.cssText,o.textContent=l(e).light.cssText)}function l(e){return{core:a.css`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @keyframes w3m-shake {
        0% {
          transform: scale(1) rotate(0deg);
        }
        20% {
          transform: scale(1) rotate(-1deg);
        }
        40% {
          transform: scale(1) rotate(1.5deg);
        }
        60% {
          transform: scale(1) rotate(-1.5deg);
        }
        80% {
          transform: scale(1) rotate(1deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
        }
      }
      @keyframes w3m-iframe-fade-out {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      @keyframes w3m-iframe-zoom-in {
        0% {
          transform: translateY(50px);
          opacity: 0;
        }
        100% {
          transform: translateY(0px);
          opacity: 1;
        }
      }
      @keyframes w3m-iframe-zoom-in-mobile {
        0% {
          transform: scale(0.95);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      :root {
        --w3m-modal-width: 360px;
        --w3m-color-mix-strength: ${(0,a.unsafeCSS)(e?.["--w3m-color-mix-strength"]?`${e["--w3m-color-mix-strength"]}%`:"0%")};
        --w3m-font-family: ${(0,a.unsafeCSS)(e?.["--w3m-font-family"]||"Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;")};
        --w3m-font-size-master: ${(0,a.unsafeCSS)(e?.["--w3m-font-size-master"]||"10px")};
        --w3m-border-radius-master: ${(0,a.unsafeCSS)(e?.["--w3m-border-radius-master"]||"4px")};
        --w3m-z-index: ${(0,a.unsafeCSS)(e?.["--w3m-z-index"]||999)};

        --wui-font-family: var(--w3m-font-family);

        --wui-font-size-mini: calc(var(--w3m-font-size-master) * 0.8);
        --wui-font-size-micro: var(--w3m-font-size-master);
        --wui-font-size-tiny: calc(var(--w3m-font-size-master) * 1.2);
        --wui-font-size-small: calc(var(--w3m-font-size-master) * 1.4);
        --wui-font-size-paragraph: calc(var(--w3m-font-size-master) * 1.6);
        --wui-font-size-medium: calc(var(--w3m-font-size-master) * 1.8);
        --wui-font-size-large: calc(var(--w3m-font-size-master) * 2);
        --wui-font-size-title-6: calc(var(--w3m-font-size-master) * 2.2);
        --wui-font-size-medium-title: calc(var(--w3m-font-size-master) * 2.4);
        --wui-font-size-2xl: calc(var(--w3m-font-size-master) * 4);

        --wui-border-radius-5xs: var(--w3m-border-radius-master);
        --wui-border-radius-4xs: calc(var(--w3m-border-radius-master) * 1.5);
        --wui-border-radius-3xs: calc(var(--w3m-border-radius-master) * 2);
        --wui-border-radius-xxs: calc(var(--w3m-border-radius-master) * 3);
        --wui-border-radius-xs: calc(var(--w3m-border-radius-master) * 4);
        --wui-border-radius-s: calc(var(--w3m-border-radius-master) * 5);
        --wui-border-radius-m: calc(var(--w3m-border-radius-master) * 7);
        --wui-border-radius-l: calc(var(--w3m-border-radius-master) * 9);
        --wui-border-radius-3xl: calc(var(--w3m-border-radius-master) * 20);

        --wui-font-weight-light: 400;
        --wui-font-weight-regular: 500;
        --wui-font-weight-medium: 600;
        --wui-font-weight-bold: 700;

        --wui-letter-spacing-2xl: -1.6px;
        --wui-letter-spacing-medium-title: -0.96px;
        --wui-letter-spacing-title-6: -0.88px;
        --wui-letter-spacing-large: -0.8px;
        --wui-letter-spacing-medium: -0.72px;
        --wui-letter-spacing-paragraph: -0.64px;
        --wui-letter-spacing-small: -0.56px;
        --wui-letter-spacing-tiny: -0.48px;
        --wui-letter-spacing-micro: -0.2px;
        --wui-letter-spacing-mini: -0.16px;

        --wui-spacing-0: 0px;
        --wui-spacing-4xs: 2px;
        --wui-spacing-3xs: 4px;
        --wui-spacing-xxs: 6px;
        --wui-spacing-2xs: 7px;
        --wui-spacing-xs: 8px;
        --wui-spacing-1xs: 10px;
        --wui-spacing-s: 12px;
        --wui-spacing-m: 14px;
        --wui-spacing-l: 16px;
        --wui-spacing-2l: 18px;
        --wui-spacing-xl: 20px;
        --wui-spacing-xxl: 24px;
        --wui-spacing-2xl: 32px;
        --wui-spacing-3xl: 40px;
        --wui-spacing-4xl: 90px;
        --wui-spacing-5xl: 95px;

        --wui-icon-box-size-xxs: 14px;
        --wui-icon-box-size-xs: 20px;
        --wui-icon-box-size-sm: 24px;
        --wui-icon-box-size-md: 32px;
        --wui-icon-box-size-mdl: 36px;
        --wui-icon-box-size-lg: 40px;
        --wui-icon-box-size-2lg: 48px;
        --wui-icon-box-size-xl: 64px;

        --wui-icon-size-inherit: inherit;
        --wui-icon-size-xxs: 10px;
        --wui-icon-size-xs: 12px;
        --wui-icon-size-sm: 14px;
        --wui-icon-size-md: 16px;
        --wui-icon-size-mdl: 18px;
        --wui-icon-size-lg: 20px;
        --wui-icon-size-xl: 24px;
        --wui-icon-size-xxl: 28px;

        --wui-wallet-image-size-inherit: inherit;
        --wui-wallet-image-size-sm: 40px;
        --wui-wallet-image-size-md: 56px;
        --wui-wallet-image-size-lg: 80px;

        --wui-visual-size-size-inherit: inherit;
        --wui-visual-size-sm: 40px;
        --wui-visual-size-md: 55px;
        --wui-visual-size-lg: 80px;

        --wui-box-size-md: 100px;
        --wui-box-size-lg: 120px;

        --wui-ease-out-power-2: cubic-bezier(0, 0, 0.22, 1);
        --wui-ease-out-power-1: cubic-bezier(0, 0, 0.55, 1);

        --wui-ease-in-power-3: cubic-bezier(0.66, 0, 1, 1);
        --wui-ease-in-power-2: cubic-bezier(0.45, 0, 1, 1);
        --wui-ease-in-power-1: cubic-bezier(0.3, 0, 1, 1);

        --wui-ease-inout-power-1: cubic-bezier(0.45, 0, 0.55, 1);

        --wui-duration-lg: 200ms;
        --wui-duration-md: 125ms;
        --wui-duration-sm: 75ms;

        --wui-path-network-sm: path(
          'M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z'
        );

        --wui-path-network-md: path(
          'M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z'
        );

        --wui-path-network-lg: path(
          'M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z'
        );

        --wui-width-network-sm: 36px;
        --wui-width-network-md: 48px;
        --wui-width-network-lg: 86px;

        --wui-height-network-sm: 40px;
        --wui-height-network-md: 54px;
        --wui-height-network-lg: 96px;

        --wui-icon-size-network-xs: 12px;
        --wui-icon-size-network-sm: 16px;
        --wui-icon-size-network-md: 24px;
        --wui-icon-size-network-lg: 42px;

        --wui-color-inherit: inherit;

        --wui-color-inverse-100: #fff;
        --wui-color-inverse-000: #000;

        --wui-cover: rgba(20, 20, 20, 0.8);

        --wui-color-modal-bg: var(--wui-color-modal-bg-base);

        --wui-color-accent-100: var(--wui-color-accent-base-100);
        --wui-color-accent-090: var(--wui-color-accent-base-090);
        --wui-color-accent-080: var(--wui-color-accent-base-080);

        --wui-color-success-100: var(--wui-color-success-base-100);
        --wui-color-success-125: var(--wui-color-success-base-125);

        --wui-color-warning-100: var(--wui-color-warning-base-100);

        --wui-color-error-100: var(--wui-color-error-base-100);
        --wui-color-error-125: var(--wui-color-error-base-125);

        --wui-color-blue-100: var(--wui-color-blue-base-100);
        --wui-color-blue-90: var(--wui-color-blue-base-90);

        --wui-icon-box-bg-error-100: var(--wui-icon-box-bg-error-base-100);
        --wui-icon-box-bg-blue-100: var(--wui-icon-box-bg-blue-base-100);
        --wui-icon-box-bg-success-100: var(--wui-icon-box-bg-success-base-100);
        --wui-icon-box-bg-inverse-100: var(--wui-icon-box-bg-inverse-base-100);

        --wui-all-wallets-bg-100: var(--wui-all-wallets-bg-100);

        --wui-avatar-border: var(--wui-avatar-border-base);

        --wui-thumbnail-border: var(--wui-thumbnail-border-base);

        --wui-wallet-button-bg: var(--wui-wallet-button-bg-base);

        --wui-box-shadow-blue: var(--wui-color-accent-glass-020);
      }

      @supports (background: color-mix(in srgb, white 50%, black)) {
        :root {
          --wui-color-modal-bg: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-modal-bg-base)
          );

          --wui-box-shadow-blue: color-mix(in srgb, var(--wui-color-accent-100) 20%, transparent);

          --wui-color-accent-100: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 100%,
            transparent
          );
          --wui-color-accent-090: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 90%,
            transparent
          );
          --wui-color-accent-080: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 80%,
            transparent
          );
          --wui-color-accent-glass-090: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 90%,
            transparent
          );
          --wui-color-accent-glass-080: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 80%,
            transparent
          );
          --wui-color-accent-glass-020: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 20%,
            transparent
          );
          --wui-color-accent-glass-015: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 15%,
            transparent
          );
          --wui-color-accent-glass-010: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 10%,
            transparent
          );
          --wui-color-accent-glass-005: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 5%,
            transparent
          );
          --wui-color-accent-002: color-mix(
            in srgb,
            var(--wui-color-accent-base-100) 2%,
            transparent
          );

          --wui-color-fg-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-100)
          );
          --wui-color-fg-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-125)
          );
          --wui-color-fg-150: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-150)
          );
          --wui-color-fg-175: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-175)
          );
          --wui-color-fg-200: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-200)
          );
          --wui-color-fg-225: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-225)
          );
          --wui-color-fg-250: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-250)
          );
          --wui-color-fg-275: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-275)
          );
          --wui-color-fg-300: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-300)
          );
          --wui-color-fg-325: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-325)
          );
          --wui-color-fg-350: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-fg-350)
          );

          --wui-color-bg-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-100)
          );
          --wui-color-bg-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-125)
          );
          --wui-color-bg-150: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-150)
          );
          --wui-color-bg-175: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-175)
          );
          --wui-color-bg-200: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-200)
          );
          --wui-color-bg-225: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-225)
          );
          --wui-color-bg-250: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-250)
          );
          --wui-color-bg-275: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-275)
          );
          --wui-color-bg-300: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-300)
          );
          --wui-color-bg-325: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-325)
          );
          --wui-color-bg-350: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-bg-350)
          );

          --wui-color-success-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-success-base-100)
          );
          --wui-color-success-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-success-base-125)
          );

          --wui-color-warning-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-warning-base-100)
          );

          --wui-color-error-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-error-base-100)
          );
          --wui-color-blue-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-blue-base-100)
          );
          --wui-color-blue-90: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-blue-base-90)
          );
          --wui-color-error-125: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-color-error-base-125)
          );

          --wui-icon-box-bg-error-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-error-base-100)
          );
          --wui-icon-box-bg-accent-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-blue-base-100)
          );
          --wui-icon-box-bg-success-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-success-base-100)
          );
          --wui-icon-box-bg-inverse-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-icon-box-bg-inverse-base-100)
          );

          --wui-all-wallets-bg-100: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-all-wallets-bg-100)
          );

          --wui-avatar-border: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-avatar-border-base)
          );

          --wui-thumbnail-border: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-thumbnail-border-base)
          );

          --wui-wallet-button-bg: color-mix(
            in srgb,
            var(--w3m-color-mix) var(--w3m-color-mix-strength),
            var(--wui-wallet-button-bg-base)
          );
        }
      }
    `,light:a.css`
      :root {
        --w3m-color-mix: ${(0,a.unsafeCSS)(e?.["--w3m-color-mix"]||"#fff")};
        --w3m-accent: ${(0,a.unsafeCSS)((0,n.getW3mThemeVariables)(e,"dark")["--w3m-accent"])};
        --w3m-default: #fff;

        --wui-color-modal-bg-base: ${(0,a.unsafeCSS)((0,n.getW3mThemeVariables)(e,"dark")["--w3m-background"])};
        --wui-color-accent-base-100: var(--w3m-accent);

        --wui-color-blueberry-100: hsla(230, 100%, 67%, 1);
        --wui-color-blueberry-090: hsla(231, 76%, 61%, 1);
        --wui-color-blueberry-080: hsla(230, 59%, 55%, 1);
        --wui-color-blueberry-050: hsla(231, 100%, 70%, 0.1);

        --wui-color-fg-100: #e4e7e7;
        --wui-color-fg-125: #d0d5d5;
        --wui-color-fg-150: #a8b1b1;
        --wui-color-fg-175: #a8b0b0;
        --wui-color-fg-200: #949e9e;
        --wui-color-fg-225: #868f8f;
        --wui-color-fg-250: #788080;
        --wui-color-fg-275: #788181;
        --wui-color-fg-300: #6e7777;
        --wui-color-fg-325: #9a9a9a;
        --wui-color-fg-350: #363636;

        --wui-color-bg-100: #141414;
        --wui-color-bg-125: #191a1a;
        --wui-color-bg-150: #1e1f1f;
        --wui-color-bg-175: #222525;
        --wui-color-bg-200: #272a2a;
        --wui-color-bg-225: #2c3030;
        --wui-color-bg-250: #313535;
        --wui-color-bg-275: #363b3b;
        --wui-color-bg-300: #3b4040;
        --wui-color-bg-325: #252525;
        --wui-color-bg-350: #ffffff;

        --wui-color-success-base-100: #26d962;
        --wui-color-success-base-125: #30a46b;

        --wui-color-warning-base-100: #f3a13f;

        --wui-color-error-base-100: #f25a67;
        --wui-color-error-base-125: #df4a34;

        --wui-color-blue-base-100: rgba(102, 125, 255, 1);
        --wui-color-blue-base-90: rgba(102, 125, 255, 0.9);

        --wui-color-success-glass-001: rgba(38, 217, 98, 0.01);
        --wui-color-success-glass-002: rgba(38, 217, 98, 0.02);
        --wui-color-success-glass-005: rgba(38, 217, 98, 0.05);
        --wui-color-success-glass-010: rgba(38, 217, 98, 0.1);
        --wui-color-success-glass-015: rgba(38, 217, 98, 0.15);
        --wui-color-success-glass-020: rgba(38, 217, 98, 0.2);
        --wui-color-success-glass-025: rgba(38, 217, 98, 0.25);
        --wui-color-success-glass-030: rgba(38, 217, 98, 0.3);
        --wui-color-success-glass-060: rgba(38, 217, 98, 0.6);
        --wui-color-success-glass-080: rgba(38, 217, 98, 0.8);

        --wui-color-success-glass-reown-020: rgba(48, 164, 107, 0.2);

        --wui-color-warning-glass-reown-020: rgba(243, 161, 63, 0.2);

        --wui-color-error-glass-001: rgba(242, 90, 103, 0.01);
        --wui-color-error-glass-002: rgba(242, 90, 103, 0.02);
        --wui-color-error-glass-005: rgba(242, 90, 103, 0.05);
        --wui-color-error-glass-010: rgba(242, 90, 103, 0.1);
        --wui-color-error-glass-015: rgba(242, 90, 103, 0.15);
        --wui-color-error-glass-020: rgba(242, 90, 103, 0.2);
        --wui-color-error-glass-025: rgba(242, 90, 103, 0.25);
        --wui-color-error-glass-030: rgba(242, 90, 103, 0.3);
        --wui-color-error-glass-060: rgba(242, 90, 103, 0.6);
        --wui-color-error-glass-080: rgba(242, 90, 103, 0.8);

        --wui-color-error-glass-reown-020: rgba(223, 74, 52, 0.2);

        --wui-color-gray-glass-001: rgba(255, 255, 255, 0.01);
        --wui-color-gray-glass-002: rgba(255, 255, 255, 0.02);
        --wui-color-gray-glass-005: rgba(255, 255, 255, 0.05);
        --wui-color-gray-glass-010: rgba(255, 255, 255, 0.1);
        --wui-color-gray-glass-015: rgba(255, 255, 255, 0.15);
        --wui-color-gray-glass-020: rgba(255, 255, 255, 0.2);
        --wui-color-gray-glass-025: rgba(255, 255, 255, 0.25);
        --wui-color-gray-glass-030: rgba(255, 255, 255, 0.3);
        --wui-color-gray-glass-060: rgba(255, 255, 255, 0.6);
        --wui-color-gray-glass-080: rgba(255, 255, 255, 0.8);
        --wui-color-gray-glass-090: rgba(255, 255, 255, 0.9);

        --wui-color-dark-glass-100: rgba(42, 42, 42, 1);

        --wui-icon-box-bg-error-base-100: #3c2426;
        --wui-icon-box-bg-blue-base-100: #20303f;
        --wui-icon-box-bg-success-base-100: #1f3a28;
        --wui-icon-box-bg-inverse-base-100: #243240;

        --wui-all-wallets-bg-100: #222b35;

        --wui-avatar-border-base: #252525;

        --wui-thumbnail-border-base: #252525;

        --wui-wallet-button-bg-base: var(--wui-color-bg-125);

        --w3m-card-embedded-shadow-color: rgb(17 17 18 / 25%);
      }
    `,dark:a.css`
      :root {
        --w3m-color-mix: ${(0,a.unsafeCSS)(e?.["--w3m-color-mix"]||"#000")};
        --w3m-accent: ${(0,a.unsafeCSS)((0,n.getW3mThemeVariables)(e,"light")["--w3m-accent"])};
        --w3m-default: #000;

        --wui-color-modal-bg-base: ${(0,a.unsafeCSS)((0,n.getW3mThemeVariables)(e,"light")["--w3m-background"])};
        --wui-color-accent-base-100: var(--w3m-accent);

        --wui-color-blueberry-100: hsla(231, 100%, 70%, 1);
        --wui-color-blueberry-090: hsla(231, 97%, 72%, 1);
        --wui-color-blueberry-080: hsla(231, 92%, 74%, 1);

        --wui-color-fg-100: #141414;
        --wui-color-fg-125: #2d3131;
        --wui-color-fg-150: #474d4d;
        --wui-color-fg-175: #636d6d;
        --wui-color-fg-200: #798686;
        --wui-color-fg-225: #828f8f;
        --wui-color-fg-250: #8b9797;
        --wui-color-fg-275: #95a0a0;
        --wui-color-fg-300: #9ea9a9;
        --wui-color-fg-325: #9a9a9a;
        --wui-color-fg-350: #d0d0d0;

        --wui-color-bg-100: #ffffff;
        --wui-color-bg-125: #f5fafa;
        --wui-color-bg-150: #f3f8f8;
        --wui-color-bg-175: #eef4f4;
        --wui-color-bg-200: #eaf1f1;
        --wui-color-bg-225: #e5eded;
        --wui-color-bg-250: #e1e9e9;
        --wui-color-bg-275: #dce7e7;
        --wui-color-bg-300: #d8e3e3;
        --wui-color-bg-325: #f3f3f3;
        --wui-color-bg-350: #202020;

        --wui-color-success-base-100: #26b562;
        --wui-color-success-base-125: #30a46b;

        --wui-color-warning-base-100: #f3a13f;

        --wui-color-error-base-100: #f05142;
        --wui-color-error-base-125: #df4a34;

        --wui-color-blue-base-100: rgba(102, 125, 255, 1);
        --wui-color-blue-base-90: rgba(102, 125, 255, 0.9);

        --wui-color-success-glass-001: rgba(38, 181, 98, 0.01);
        --wui-color-success-glass-002: rgba(38, 181, 98, 0.02);
        --wui-color-success-glass-005: rgba(38, 181, 98, 0.05);
        --wui-color-success-glass-010: rgba(38, 181, 98, 0.1);
        --wui-color-success-glass-015: rgba(38, 181, 98, 0.15);
        --wui-color-success-glass-020: rgba(38, 181, 98, 0.2);
        --wui-color-success-glass-025: rgba(38, 181, 98, 0.25);
        --wui-color-success-glass-030: rgba(38, 181, 98, 0.3);
        --wui-color-success-glass-060: rgba(38, 181, 98, 0.6);
        --wui-color-success-glass-080: rgba(38, 181, 98, 0.8);

        --wui-color-success-glass-reown-020: rgba(48, 164, 107, 0.2);

        --wui-color-warning-glass-reown-020: rgba(243, 161, 63, 0.2);

        --wui-color-error-glass-001: rgba(240, 81, 66, 0.01);
        --wui-color-error-glass-002: rgba(240, 81, 66, 0.02);
        --wui-color-error-glass-005: rgba(240, 81, 66, 0.05);
        --wui-color-error-glass-010: rgba(240, 81, 66, 0.1);
        --wui-color-error-glass-015: rgba(240, 81, 66, 0.15);
        --wui-color-error-glass-020: rgba(240, 81, 66, 0.2);
        --wui-color-error-glass-025: rgba(240, 81, 66, 0.25);
        --wui-color-error-glass-030: rgba(240, 81, 66, 0.3);
        --wui-color-error-glass-060: rgba(240, 81, 66, 0.6);
        --wui-color-error-glass-080: rgba(240, 81, 66, 0.8);

        --wui-color-error-glass-reown-020: rgba(223, 74, 52, 0.2);

        --wui-icon-box-bg-error-base-100: #f4dfdd;
        --wui-icon-box-bg-blue-base-100: #d9ecfb;
        --wui-icon-box-bg-success-base-100: #daf0e4;
        --wui-icon-box-bg-inverse-base-100: #dcecfc;

        --wui-all-wallets-bg-100: #e8f1fa;

        --wui-avatar-border-base: #f3f4f4;

        --wui-thumbnail-border-base: #eaefef;

        --wui-wallet-button-bg-base: var(--wui-color-bg-125);

        --wui-color-gray-glass-001: rgba(0, 0, 0, 0.01);
        --wui-color-gray-glass-002: rgba(0, 0, 0, 0.02);
        --wui-color-gray-glass-005: rgba(0, 0, 0, 0.05);
        --wui-color-gray-glass-010: rgba(0, 0, 0, 0.1);
        --wui-color-gray-glass-015: rgba(0, 0, 0, 0.15);
        --wui-color-gray-glass-020: rgba(0, 0, 0, 0.2);
        --wui-color-gray-glass-025: rgba(0, 0, 0, 0.25);
        --wui-color-gray-glass-030: rgba(0, 0, 0, 0.3);
        --wui-color-gray-glass-060: rgba(0, 0, 0, 0.6);
        --wui-color-gray-glass-080: rgba(0, 0, 0, 0.8);
        --wui-color-gray-glass-090: rgba(0, 0, 0, 0.9);

        --wui-color-dark-glass-100: rgba(233, 233, 233, 1);

        --w3m-card-embedded-shadow-color: rgb(224 225 233 / 25%);
      }
    `}}let u=a.css`
  *,
  *::after,
  *::before,
  :host {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    font-family: var(--wui-font-family);
    backface-visibility: hidden;
  }
`,d=a.css`
  button,
  a {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition:
      color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      box-shadow var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: background-color, color, border, box-shadow, border-radius;
    outline: none;
    border: none;
    column-gap: var(--wui-spacing-3xs);
    background-color: transparent;
    text-decoration: none;
  }

  wui-flex {
    transition: border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius;
  }

  button:disabled > wui-wallet-image,
  button:disabled > wui-all-wallets-image,
  button:disabled > wui-network-image,
  button:disabled > wui-image,
  button:disabled > wui-transaction-visual,
  button:disabled > wui-logo {
    filter: grayscale(1);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-color-gray-glass-005);
    }

    button:active:enabled {
      background-color: var(--wui-color-gray-glass-010);
    }
  }

  button:disabled > wui-icon-box {
    opacity: 0.5;
  }

  input {
    border: none;
    outline: none;
    appearance: none;
  }
`,p=a.css`
  .wui-color-inherit {
    color: var(--wui-color-inherit);
  }

  .wui-color-accent-100 {
    color: var(--wui-color-accent-100);
  }

  .wui-color-error-100 {
    color: var(--wui-color-error-100);
  }

  .wui-color-blue-100 {
    color: var(--wui-color-blue-100);
  }

  .wui-color-blue-90 {
    color: var(--wui-color-blue-90);
  }

  .wui-color-error-125 {
    color: var(--wui-color-error-125);
  }

  .wui-color-success-100 {
    color: var(--wui-color-success-100);
  }

  .wui-color-success-125 {
    color: var(--wui-color-success-125);
  }

  .wui-color-inverse-100 {
    color: var(--wui-color-inverse-100);
  }

  .wui-color-inverse-000 {
    color: var(--wui-color-inverse-000);
  }

  .wui-color-fg-100 {
    color: var(--wui-color-fg-100);
  }

  .wui-color-fg-200 {
    color: var(--wui-color-fg-200);
  }

  .wui-color-fg-300 {
    color: var(--wui-color-fg-300);
  }

  .wui-color-fg-325 {
    color: var(--wui-color-fg-325);
  }

  .wui-color-fg-350 {
    color: var(--wui-color-fg-350);
  }

  .wui-bg-color-inherit {
    background-color: var(--wui-color-inherit);
  }

  .wui-bg-color-blue-100 {
    background-color: var(--wui-color-accent-100);
  }

  .wui-bg-color-error-100 {
    background-color: var(--wui-color-error-100);
  }

  .wui-bg-color-error-125 {
    background-color: var(--wui-color-error-125);
  }

  .wui-bg-color-success-100 {
    background-color: var(--wui-color-success-100);
  }

  .wui-bg-color-success-125 {
    background-color: var(--wui-color-success-100);
  }

  .wui-bg-color-inverse-100 {
    background-color: var(--wui-color-inverse-100);
  }

  .wui-bg-color-inverse-000 {
    background-color: var(--wui-color-inverse-000);
  }

  .wui-bg-color-fg-100 {
    background-color: var(--wui-color-fg-100);
  }

  .wui-bg-color-fg-200 {
    background-color: var(--wui-color-fg-200);
  }

  .wui-bg-color-fg-300 {
    background-color: var(--wui-color-fg-300);
  }

  .wui-color-fg-325 {
    background-color: var(--wui-color-fg-325);
  }

  .wui-color-fg-350 {
    background-color: var(--wui-color-fg-350);
  }
`;e.s(["colorStyles",0,p,"elementStyles",0,d,"initializeTheming",()=>i,"resetStyles",0,u,"setColorTheme",()=>s,"setThemeVariables",()=>c],459088);e.s(["UiHelperUtil",0,{getSpacingStyles:(e,t)=>Array.isArray(e)?e[t]?`var(--wui-spacing-${e[t]})`:void 0:"string"==typeof e?`var(--wui-spacing-${e})`:void 0,getFormattedDate:e=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(e),getHostName(e){try{return new URL(e).hostname}catch(e){return""}},getTruncateString:({string:e,charsStart:t,charsEnd:r,truncate:o})=>e.length<=t+r?e:"end"===o?`${e.substring(0,t)}...`:"start"===o?`...${e.substring(e.length-r)}`:`${e.substring(0,Math.floor(t))}...${e.substring(e.length-Math.floor(r))}`,generateAvatarColors(e){let t=e.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),r=this.hexToRgb(t),o=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),a=100-3*Number(o?.replace("px","")),n=`${a}% ${a}% at 65% 40%`,i=[];for(let e=0;e<5;e+=1){let t=this.tintColor(r,.15*e);i.push(`rgb(${t[0]}, ${t[1]}, ${t[2]})`)}return`
    --local-color-1: ${i[0]};
    --local-color-2: ${i[1]};
    --local-color-3: ${i[2]};
    --local-color-4: ${i[3]};
    --local-color-5: ${i[4]};
    --local-radial-circle: ${n}
   `},hexToRgb(e){let t=parseInt(e,16);return[t>>16&255,t>>8&255,255&t]},tintColor(e,t){let[r,o,a]=e;return[Math.round(r+(255-r)*t),Math.round(o+(255-o)*t),Math.round(a+(255-a)*t)]},isNumber:e=>/^[0-9]+$/u.test(e),getColorTheme:e=>e?e:"undefined"!=typeof window&&window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)")?.matches?"dark":"light":"dark",splitBalance(e){let t=e.split(".");return 2===t.length?[t[0],t[1]]:["0","00"]},roundNumber:(e,t,r)=>e.toString().length>=t?Number(e).toFixed(r):e,formatNumberToLocalString:(e,t=2)=>void 0===e?"0.00":"number"==typeof e?e.toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t}):parseFloat(e).toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t})}],112699);var g=e.i(822315),m=e.i(396931),w=e.i(472856),h=e.i(83840);g.default.extend(w.default),g.default.extend(h.default);let f={...m.default,name:"en-web3-modal",relativeTime:{future:"in %s",past:"%s ago",s:"%d sec",m:"1 min",mm:"%d min",h:"1 hr",hh:"%d hrs",d:"1 d",dd:"%d d",M:"1 mo",MM:"%d mo",y:"1 yr",yy:"%d yr"}};g.default.locale("en-web3-modal",f);function b(e){return function(t){return"function"==typeof t?(customElements.get(e)||customElements.define(e,t),t):function(e,t){let{kind:r,elements:o}=t;return{kind:r,elements:o,finisher(t){customElements.get(e)||customElements.define(e,t)}}}(e,t)}}e.s(["customElement",()=>b],645975),e.s([],404041)}]);