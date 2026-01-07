module.exports = [
"[project]/node_modules/@reown/appkit-controllers/node_modules/@walletconnect/core/dist/index.es.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CORE_CONTEXT",
    ()=>he,
    "CORE_DEFAULT",
    ()=>Et,
    "CORE_PROTOCOL",
    ()=>ze,
    "CORE_STORAGE_OPTIONS",
    ()=>It,
    "CORE_STORAGE_PREFIX",
    ()=>B,
    "CORE_VERSION",
    ()=>Le,
    "CRYPTO_CLIENT_SEED",
    ()=>ke,
    "CRYPTO_CONTEXT",
    ()=>Tt,
    "CRYPTO_JWT_TTL",
    ()=>Ct,
    "Core",
    ()=>Xo,
    "Crypto",
    ()=>vi,
    "ECHO_CONTEXT",
    ()=>Xt,
    "ECHO_URL",
    ()=>Zt,
    "EVENTS_CLIENT_API_URL",
    ()=>ii,
    "EVENTS_STORAGE_CLEANUP_INTERVAL",
    ()=>ti,
    "EVENTS_STORAGE_CONTEXT",
    ()=>ei,
    "EVENTS_STORAGE_VERSION",
    ()=>Qt,
    "EVENT_CLIENT_AUTHENTICATE_ERRORS",
    ()=>sr,
    "EVENT_CLIENT_AUTHENTICATE_TRACES",
    ()=>ir,
    "EVENT_CLIENT_CONTEXT",
    ()=>Qs,
    "EVENT_CLIENT_PAIRING_ERRORS",
    ()=>Y,
    "EVENT_CLIENT_PAIRING_TRACES",
    ()=>G,
    "EVENT_CLIENT_SESSION_ERRORS",
    ()=>tr,
    "EVENT_CLIENT_SESSION_TRACES",
    ()=>er,
    "EXPIRER_CONTEXT",
    ()=>qt,
    "EXPIRER_DEFAULT_TTL",
    ()=>Xs,
    "EXPIRER_EVENTS",
    ()=>M,
    "EXPIRER_STORAGE_VERSION",
    ()=>Gt,
    "EchoClient",
    ()=>Mi,
    "EventClient",
    ()=>Bi,
    "Expirer",
    ()=>ji,
    "HISTORY_CONTEXT",
    ()=>Bt,
    "HISTORY_EVENTS",
    ()=>F,
    "HISTORY_STORAGE_VERSION",
    ()=>Vt,
    "JsonRpcHistory",
    ()=>ki,
    "KEYCHAIN_CONTEXT",
    ()=>Pt,
    "KEYCHAIN_STORAGE_VERSION",
    ()=>St,
    "KeyChain",
    ()=>Di,
    "MESSAGES_CONTEXT",
    ()=>Ot,
    "MESSAGES_STORAGE_VERSION",
    ()=>Rt,
    "MESSAGE_DIRECTION",
    ()=>le,
    "MessageTracker",
    ()=>_i,
    "PAIRING_CONTEXT",
    ()=>Mt,
    "PAIRING_DEFAULT_TTL",
    ()=>Js,
    "PAIRING_EVENTS",
    ()=>re,
    "PAIRING_RPC_OPTS",
    ()=>se,
    "PAIRING_STORAGE_VERSION",
    ()=>Kt,
    "PENDING_SUB_RESOLUTION_TIMEOUT",
    ()=>Ys,
    "PUBLISHER_CONTEXT",
    ()=>At,
    "PUBLISHER_DEFAULT_TTL",
    ()=>je,
    "Pairing",
    ()=>Li,
    "RELAYER_CONTEXT",
    ()=>$t,
    "RELAYER_DEFAULT_LOGGER",
    ()=>Nt,
    "RELAYER_DEFAULT_PROTOCOL",
    ()=>xt,
    "RELAYER_DEFAULT_RELAY_URL",
    ()=>Ue,
    "RELAYER_EVENTS",
    ()=>C,
    "RELAYER_PROVIDER_EVENTS",
    ()=>L,
    "RELAYER_RECONNECT_TIMEOUT",
    ()=>Lt,
    "RELAYER_SDK_VERSION",
    ()=>_e,
    "RELAYER_STORAGE_OPTIONS",
    ()=>Gs,
    "RELAYER_SUBSCRIBER_SUFFIX",
    ()=>zt,
    "RELAYER_TRANSPORT_CUTOFF",
    ()=>Ws,
    "Relayer",
    ()=>Si,
    "STORE_STORAGE_VERSION",
    ()=>kt,
    "SUBSCRIBER_CONTEXT",
    ()=>Ut,
    "SUBSCRIBER_DEFAULT_TTL",
    ()=>Hs,
    "SUBSCRIBER_EVENTS",
    ()=>$,
    "SUBSCRIBER_STORAGE_VERSION",
    ()=>Ft,
    "Store",
    ()=>zi,
    "Subscriber",
    ()=>Ti,
    "TRANSPORT_TYPES",
    ()=>Q,
    "TRUSTED_VERIFY_URLS",
    ()=>Jt,
    "VERIFY_CONTEXT",
    ()=>Wt,
    "VERIFY_SERVER",
    ()=>ue,
    "VERIFY_SERVER_V3",
    ()=>Yt,
    "Verify",
    ()=>Ui,
    "WALLETCONNECT_CLIENT_ID",
    ()=>jt,
    "WALLETCONNECT_LINK_MODE_APPS",
    ()=>Fe,
    "default",
    ()=>Te
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/events [external] (events, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/heartbeat/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$keyvaluestorage$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/keyvaluestorage/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/logger/dist/index.es.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__$3c$export__default__as__pino$3e$__ = __turbopack_context__.i("[externals]/pino [external] (pino, cjs, [project]/node_modules/pino) <export default as pino>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reown/appkit-controllers/node_modules/@walletconnect/types/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/time/dist/cjs/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$safe$2d$json$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/safe-json/dist/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/relay-auth/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reown/appkit-controllers/node_modules/@walletconnect/utils/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uint8arrays$2f$esm$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/uint8arrays/esm/src/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uint8arrays$2f$esm$2f$src$2f$to$2d$string$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uint8arrays/esm/src/to-string.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$provider$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/jsonrpc-provider/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/jsonrpc-utils/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/jsonrpc-utils/dist/esm/format.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/jsonrpc-utils/dist/esm/validators.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$ws$2d$connection$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/jsonrpc-ws-connection/dist/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$window$2d$getters$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@walletconnect/window-getters/dist/cjs/index.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const ze = "wc", Le = 2, he = "core", B = `${ze}@2:${he}:`, Et = {
    name: he,
    logger: "error"
}, It = {
    database: ":memory:"
}, Tt = "crypto", ke = "client_ed25519_seed", Ct = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_DAY"], Pt = "keychain", St = "0.3", Ot = "messages", Rt = "0.3", je = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SIX_HOURS"], At = "publisher", xt = "irn", Nt = "error", Ue = "wss://relay.walletconnect.org", $t = "relayer", C = {
    message: "relayer_message",
    message_ack: "relayer_message_ack",
    connect: "relayer_connect",
    disconnect: "relayer_disconnect",
    error: "relayer_error",
    connection_stalled: "relayer_connection_stalled",
    transport_closed: "relayer_transport_closed",
    publish: "relayer_publish"
}, zt = "_subscription", L = {
    payload: "payload",
    connect: "connect",
    disconnect: "disconnect",
    error: "error"
}, Lt = .1, Gs = {
    database: ":memory:"
}, _e = "2.21.0", Ws = 1e4, Q = {
    link_mode: "link_mode",
    relay: "relay"
}, le = {
    inbound: "inbound",
    outbound: "outbound"
}, kt = "0.3", jt = "WALLETCONNECT_CLIENT_ID", Fe = "WALLETCONNECT_LINK_MODE_APPS", $ = {
    created: "subscription_created",
    deleted: "subscription_deleted",
    expired: "subscription_expired",
    disabled: "subscription_disabled",
    sync: "subscription_sync",
    resubscribed: "subscription_resubscribed"
}, Hs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THIRTY_DAYS"], Ut = "subscription", Ft = "0.3", Ys = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_SECONDS"] * 1e3, Mt = "pairing", Kt = "0.3", Js = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THIRTY_DAYS"], se = {
    wc_pairingDelete: {
        req: {
            ttl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_DAY"],
            prompt: !1,
            tag: 1e3
        },
        res: {
            ttl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_DAY"],
            prompt: !1,
            tag: 1001
        }
    },
    wc_pairingPing: {
        req: {
            ttl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THIRTY_SECONDS"],
            prompt: !1,
            tag: 1002
        },
        res: {
            ttl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THIRTY_SECONDS"],
            prompt: !1,
            tag: 1003
        }
    },
    unregistered_method: {
        req: {
            ttl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_DAY"],
            prompt: !1,
            tag: 0
        },
        res: {
            ttl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_DAY"],
            prompt: !1,
            tag: 0
        }
    }
}, re = {
    create: "pairing_create",
    expire: "pairing_expire",
    delete: "pairing_delete",
    ping: "pairing_ping"
}, F = {
    created: "history_created",
    updated: "history_updated",
    deleted: "history_deleted",
    sync: "history_sync"
}, Bt = "history", Vt = "0.3", qt = "expirer", M = {
    created: "expirer_created",
    deleted: "expirer_deleted",
    expired: "expirer_expired",
    sync: "expirer_sync"
}, Gt = "0.3", Xs = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_DAY"], Wt = "verify-api", Zs = "https://verify.walletconnect.com", Ht = "https://verify.walletconnect.org", ue = Ht, Yt = `${ue}/v3`, Jt = [
    Zs,
    Ht
], Xt = "echo", Zt = "https://echo.walletconnect.com", Qs = "event-client", G = {
    pairing_started: "pairing_started",
    pairing_uri_validation_success: "pairing_uri_validation_success",
    pairing_uri_not_expired: "pairing_uri_not_expired",
    store_new_pairing: "store_new_pairing",
    subscribing_pairing_topic: "subscribing_pairing_topic",
    subscribe_pairing_topic_success: "subscribe_pairing_topic_success",
    existing_pairing: "existing_pairing",
    pairing_not_expired: "pairing_not_expired",
    emit_inactive_pairing: "emit_inactive_pairing",
    emit_session_proposal: "emit_session_proposal",
    subscribing_to_pairing_topic: "subscribing_to_pairing_topic"
}, Y = {
    no_wss_connection: "no_wss_connection",
    no_internet_connection: "no_internet_connection",
    malformed_pairing_uri: "malformed_pairing_uri",
    active_pairing_already_exists: "active_pairing_already_exists",
    subscribe_pairing_topic_failure: "subscribe_pairing_topic_failure",
    pairing_expired: "pairing_expired",
    proposal_expired: "proposal_expired",
    proposal_listener_not_found: "proposal_listener_not_found"
}, er = {
    session_approve_started: "session_approve_started",
    proposal_not_expired: "proposal_not_expired",
    session_namespaces_validation_success: "session_namespaces_validation_success",
    create_session_topic: "create_session_topic",
    subscribing_session_topic: "subscribing_session_topic",
    subscribe_session_topic_success: "subscribe_session_topic_success",
    publishing_session_approve: "publishing_session_approve",
    session_approve_publish_success: "session_approve_publish_success",
    store_session: "store_session",
    publishing_session_settle: "publishing_session_settle",
    session_settle_publish_success: "session_settle_publish_success"
}, tr = {
    no_internet_connection: "no_internet_connection",
    no_wss_connection: "no_wss_connection",
    proposal_expired: "proposal_expired",
    subscribe_session_topic_failure: "subscribe_session_topic_failure",
    session_approve_publish_failure: "session_approve_publish_failure",
    session_settle_publish_failure: "session_settle_publish_failure",
    session_approve_namespace_validation_failure: "session_approve_namespace_validation_failure",
    proposal_not_found: "proposal_not_found"
}, ir = {
    authenticated_session_approve_started: "authenticated_session_approve_started",
    authenticated_session_not_expired: "authenticated_session_not_expired",
    chains_caip2_compliant: "chains_caip2_compliant",
    chains_evm_compliant: "chains_evm_compliant",
    create_authenticated_session_topic: "create_authenticated_session_topic",
    cacaos_verified: "cacaos_verified",
    store_authenticated_session: "store_authenticated_session",
    subscribing_authenticated_session_topic: "subscribing_authenticated_session_topic",
    subscribe_authenticated_session_topic_success: "subscribe_authenticated_session_topic_success",
    publishing_authenticated_session_approve: "publishing_authenticated_session_approve",
    authenticated_session_approve_publish_success: "authenticated_session_approve_publish_success"
}, sr = {
    no_internet_connection: "no_internet_connection",
    no_wss_connection: "no_wss_connection",
    missing_session_authenticate_request: "missing_session_authenticate_request",
    session_authenticate_request_expired: "session_authenticate_request_expired",
    chains_caip2_compliant_failure: "chains_caip2_compliant_failure",
    chains_evm_compliant_failure: "chains_evm_compliant_failure",
    invalid_cacao: "invalid_cacao",
    subscribe_authenticated_session_topic_failure: "subscribe_authenticated_session_topic_failure",
    authenticated_session_approve_publish_failure: "authenticated_session_approve_publish_failure",
    authenticated_session_pending_request_not_found: "authenticated_session_pending_request_not_found"
}, Qt = .1, ei = "event-client", ti = 86400, ii = "https://pulse.walletconnect.org/batch";
function rr(r, e) {
    if (r.length >= 255) throw new TypeError("Alphabet too long");
    for(var t = new Uint8Array(256), i = 0; i < t.length; i++)t[i] = 255;
    for(var s = 0; s < r.length; s++){
        var n = r.charAt(s), o = n.charCodeAt(0);
        if (t[o] !== 255) throw new TypeError(n + " is ambiguous");
        t[o] = s;
    }
    var a = r.length, c = r.charAt(0), h = Math.log(a) / Math.log(256), l = Math.log(256) / Math.log(a);
    function d(u) {
        if (u instanceof Uint8Array || (ArrayBuffer.isView(u) ? u = new Uint8Array(u.buffer, u.byteOffset, u.byteLength) : Array.isArray(u) && (u = Uint8Array.from(u))), !(u instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
        if (u.length === 0) return "";
        for(var b = 0, x = 0, I = 0, D = u.length; I !== D && u[I] === 0;)I++, b++;
        for(var j = (D - I) * l + 1 >>> 0, T = new Uint8Array(j); I !== D;){
            for(var q = u[I], J = 0, K = j - 1; (q !== 0 || J < x) && K !== -1; K--, J++)q += 256 * T[K] >>> 0, T[K] = q % a >>> 0, q = q / a >>> 0;
            if (q !== 0) throw new Error("Non-zero carry");
            x = J, I++;
        }
        for(var H = j - x; H !== j && T[H] === 0;)H++;
        for(var me = c.repeat(b); H < j; ++H)me += r.charAt(T[H]);
        return me;
    }
    function g(u) {
        if (typeof u != "string") throw new TypeError("Expected String");
        if (u.length === 0) return new Uint8Array;
        var b = 0;
        if (u[b] !== " ") {
            for(var x = 0, I = 0; u[b] === c;)x++, b++;
            for(var D = (u.length - b) * h + 1 >>> 0, j = new Uint8Array(D); u[b];){
                var T = t[u.charCodeAt(b)];
                if (T === 255) return;
                for(var q = 0, J = D - 1; (T !== 0 || q < I) && J !== -1; J--, q++)T += a * j[J] >>> 0, j[J] = T % 256 >>> 0, T = T / 256 >>> 0;
                if (T !== 0) throw new Error("Non-zero carry");
                I = q, b++;
            }
            if (u[b] !== " ") {
                for(var K = D - I; K !== D && j[K] === 0;)K++;
                for(var H = new Uint8Array(x + (D - K)), me = x; K !== D;)H[me++] = j[K++];
                return H;
            }
        }
    }
    function _(u) {
        var b = g(u);
        if (b) return b;
        throw new Error(`Non-${e} character`);
    }
    return {
        encode: d,
        decodeUnsafe: g,
        decode: _
    };
}
var nr = rr, or = nr;
const si = (r)=>{
    if (r instanceof Uint8Array && r.constructor.name === "Uint8Array") return r;
    if (r instanceof ArrayBuffer) return new Uint8Array(r);
    if (ArrayBuffer.isView(r)) return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
    throw new Error("Unknown type, must be binary type");
}, ar = (r)=>new TextEncoder().encode(r), cr = (r)=>new TextDecoder().decode(r);
class hr {
    constructor(e, t, i){
        this.name = e, this.prefix = t, this.baseEncode = i;
    }
    encode(e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
        throw Error("Unknown type, must be binary type");
    }
}
class lr {
    constructor(e, t, i){
        if (this.name = e, this.prefix = t, t.codePointAt(0) === void 0) throw new Error("Invalid prefix character");
        this.prefixCodePoint = t.codePointAt(0), this.baseDecode = i;
    }
    decode(e) {
        if (typeof e == "string") {
            if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            return this.baseDecode(e.slice(this.prefix.length));
        } else throw Error("Can only multibase decode strings");
    }
    or(e) {
        return ri(this, e);
    }
}
class ur {
    constructor(e){
        this.decoders = e;
    }
    or(e) {
        return ri(this, e);
    }
    decode(e) {
        const t = e[0], i = this.decoders[t];
        if (i) return i.decode(e);
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
}
const ri = (r, e)=>new ur({
        ...r.decoders || {
            [r.prefix]: r
        },
        ...e.decoders || {
            [e.prefix]: e
        }
    });
class dr {
    constructor(e, t, i, s){
        this.name = e, this.prefix = t, this.baseEncode = i, this.baseDecode = s, this.encoder = new hr(e, t, i), this.decoder = new lr(e, t, s);
    }
    encode(e) {
        return this.encoder.encode(e);
    }
    decode(e) {
        return this.decoder.decode(e);
    }
}
const Ee = ({ name: r, prefix: e, encode: t, decode: i })=>new dr(r, e, t, i), de = ({ prefix: r, name: e, alphabet: t })=>{
    const { encode: i, decode: s } = or(t, e);
    return Ee({
        prefix: r,
        name: e,
        encode: i,
        decode: (n)=>si(s(n))
    });
}, gr = (r, e, t, i)=>{
    const s = {};
    for(let l = 0; l < e.length; ++l)s[e[l]] = l;
    let n = r.length;
    for(; r[n - 1] === "=";)--n;
    const o = new Uint8Array(n * t / 8 | 0);
    let a = 0, c = 0, h = 0;
    for(let l = 0; l < n; ++l){
        const d = s[r[l]];
        if (d === void 0) throw new SyntaxError(`Non-${i} character`);
        c = c << t | d, a += t, a >= 8 && (a -= 8, o[h++] = 255 & c >> a);
    }
    if (a >= t || 255 & c << 8 - a) throw new SyntaxError("Unexpected end of data");
    return o;
}, pr = (r, e, t)=>{
    const i = e[e.length - 1] === "=", s = (1 << t) - 1;
    let n = "", o = 0, a = 0;
    for(let c = 0; c < r.length; ++c)for(a = a << 8 | r[c], o += 8; o > t;)o -= t, n += e[s & a >> o];
    if (o && (n += e[s & a << t - o]), i) for(; n.length * t & 7;)n += "=";
    return n;
}, P = ({ name: r, prefix: e, bitsPerChar: t, alphabet: i })=>Ee({
        prefix: e,
        name: r,
        encode (s) {
            return pr(s, i, t);
        },
        decode (s) {
            return gr(s, i, t, r);
        }
    }), yr = Ee({
    prefix: "\0",
    name: "identity",
    encode: (r)=>cr(r),
    decode: (r)=>ar(r)
});
var br = Object.freeze({
    __proto__: null,
    identity: yr
});
const mr = P({
    prefix: "0",
    name: "base2",
    alphabet: "01",
    bitsPerChar: 1
});
var fr = Object.freeze({
    __proto__: null,
    base2: mr
});
const Dr = P({
    prefix: "7",
    name: "base8",
    alphabet: "01234567",
    bitsPerChar: 3
});
var vr = Object.freeze({
    __proto__: null,
    base8: Dr
});
const wr = de({
    prefix: "9",
    name: "base10",
    alphabet: "0123456789"
});
var _r = Object.freeze({
    __proto__: null,
    base10: wr
});
const Er = P({
    prefix: "f",
    name: "base16",
    alphabet: "0123456789abcdef",
    bitsPerChar: 4
}), Ir = P({
    prefix: "F",
    name: "base16upper",
    alphabet: "0123456789ABCDEF",
    bitsPerChar: 4
});
var Tr = Object.freeze({
    __proto__: null,
    base16: Er,
    base16upper: Ir
});
const Cr = P({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
}), Pr = P({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
}), Sr = P({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
}), Or = P({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
}), Rr = P({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
}), Ar = P({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
}), xr = P({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
}), Nr = P({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
}), $r = P({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
var zr = Object.freeze({
    __proto__: null,
    base32: Cr,
    base32upper: Pr,
    base32pad: Sr,
    base32padupper: Or,
    base32hex: Rr,
    base32hexupper: Ar,
    base32hexpad: xr,
    base32hexpadupper: Nr,
    base32z: $r
});
const Lr = de({
    prefix: "k",
    name: "base36",
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
}), kr = de({
    prefix: "K",
    name: "base36upper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
var jr = Object.freeze({
    __proto__: null,
    base36: Lr,
    base36upper: kr
});
const Ur = de({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
}), Fr = de({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
var Mr = Object.freeze({
    __proto__: null,
    base58btc: Ur,
    base58flickr: Fr
});
const Kr = P({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6
}), Br = P({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6
}), Vr = P({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6
}), qr = P({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6
});
var Gr = Object.freeze({
    __proto__: null,
    base64: Kr,
    base64pad: Br,
    base64url: Vr,
    base64urlpad: qr
});
const ni = Array.from("\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}"), Wr = ni.reduce((r, e, t)=>(r[t] = e, r), []), Hr = ni.reduce((r, e, t)=>(r[e.codePointAt(0)] = t, r), []);
function Yr(r) {
    return r.reduce((e, t)=>(e += Wr[t], e), "");
}
function Jr(r) {
    const e = [];
    for (const t of r){
        const i = Hr[t.codePointAt(0)];
        if (i === void 0) throw new Error(`Non-base256emoji character: ${t}`);
        e.push(i);
    }
    return new Uint8Array(e);
}
const Xr = Ee({
    prefix: "\u{1F680}",
    name: "base256emoji",
    encode: Yr,
    decode: Jr
});
var Zr = Object.freeze({
    __proto__: null,
    base256emoji: Xr
}), Qr = ai, oi = 128, en = 127, tn = ~en, sn = Math.pow(2, 31);
function ai(r, e, t) {
    e = e || [], t = t || 0;
    for(var i = t; r >= sn;)e[t++] = r & 255 | oi, r /= 128;
    for(; r & tn;)e[t++] = r & 255 | oi, r >>>= 7;
    return e[t] = r | 0, ai.bytes = t - i + 1, e;
}
var rn = Me, nn = 128, ci = 127;
function Me(r, i) {
    var t = 0, i = i || 0, s = 0, n = i, o, a = r.length;
    do {
        if (n >= a) throw Me.bytes = 0, new RangeError("Could not decode varint");
        o = r[n++], t += s < 28 ? (o & ci) << s : (o & ci) * Math.pow(2, s), s += 7;
    }while (o >= nn)
    return Me.bytes = n - i, t;
}
var on = Math.pow(2, 7), an = Math.pow(2, 14), cn = Math.pow(2, 21), hn = Math.pow(2, 28), ln = Math.pow(2, 35), un = Math.pow(2, 42), dn = Math.pow(2, 49), gn = Math.pow(2, 56), pn = Math.pow(2, 63), yn = function(r) {
    return r < on ? 1 : r < an ? 2 : r < cn ? 3 : r < hn ? 4 : r < ln ? 5 : r < un ? 6 : r < dn ? 7 : r < gn ? 8 : r < pn ? 9 : 10;
}, bn = {
    encode: Qr,
    decode: rn,
    encodingLength: yn
}, hi = bn;
const li = (r, e, t = 0)=>(hi.encode(r, e, t), e), ui = (r)=>hi.encodingLength(r), Ke = (r, e)=>{
    const t = e.byteLength, i = ui(r), s = i + ui(t), n = new Uint8Array(s + t);
    return li(r, n, 0), li(t, n, i), n.set(e, s), new mn(r, t, e, n);
};
class mn {
    constructor(e, t, i, s){
        this.code = e, this.size = t, this.digest = i, this.bytes = s;
    }
}
const di = ({ name: r, code: e, encode: t })=>new fn(r, e, t);
class fn {
    constructor(e, t, i){
        this.name = e, this.code = t, this.encode = i;
    }
    digest(e) {
        if (e instanceof Uint8Array) {
            const t = this.encode(e);
            return t instanceof Uint8Array ? Ke(this.code, t) : t.then((i)=>Ke(this.code, i));
        } else throw Error("Unknown type, must be binary type");
    }
}
const gi = (r)=>async (e)=>new Uint8Array(await crypto.subtle.digest(r, e)), Dn = di({
    name: "sha2-256",
    code: 18,
    encode: gi("SHA-256")
}), vn = di({
    name: "sha2-512",
    code: 19,
    encode: gi("SHA-512")
});
var wn = Object.freeze({
    __proto__: null,
    sha256: Dn,
    sha512: vn
});
const pi = 0, _n = "identity", yi = si, En = (r)=>Ke(pi, yi(r)), In = {
    code: pi,
    name: _n,
    encode: yi,
    digest: En
};
var Tn = Object.freeze({
    __proto__: null,
    identity: In
});
new TextEncoder, new TextDecoder;
const bi = {
    ...br,
    ...fr,
    ...vr,
    ..._r,
    ...Tr,
    ...zr,
    ...jr,
    ...Mr,
    ...Gr,
    ...Zr
};
({
    ...wn,
    ...Tn
});
function Cn(r = 0) {
    return globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null ? globalThis.Buffer.allocUnsafe(r) : new Uint8Array(r);
}
function mi(r, e, t, i) {
    return {
        name: r,
        prefix: e,
        encoder: {
            name: r,
            prefix: e,
            encode: t
        },
        decoder: {
            decode: i
        }
    };
}
const fi = mi("utf8", "u", (r)=>"u" + new TextDecoder("utf8").decode(r), (r)=>new TextEncoder().encode(r.substring(1))), Be = mi("ascii", "a", (r)=>{
    let e = "a";
    for(let t = 0; t < r.length; t++)e += String.fromCharCode(r[t]);
    return e;
}, (r)=>{
    r = r.substring(1);
    const e = Cn(r.length);
    for(let t = 0; t < r.length; t++)e[t] = r.charCodeAt(t);
    return e;
}), Pn = {
    utf8: fi,
    "utf-8": fi,
    hex: bi.base16,
    latin1: Be,
    ascii: Be,
    binary: Be,
    ...bi
};
function Sn(r, e = "utf8") {
    const t = Pn[e];
    if (!t) throw new Error(`Unsupported encoding "${e}"`);
    return (e === "utf8" || e === "utf-8") && globalThis.Buffer != null && globalThis.Buffer.from != null ? globalThis.Buffer.from(r, "utf8") : t.decoder.decode(`${t.prefix}${r}`);
}
var On = Object.defineProperty, Rn = (r, e, t)=>e in r ? On(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, W = (r, e, t)=>Rn(r, typeof e != "symbol" ? e + "" : e, t);
class Di {
    constructor(e, t){
        this.core = e, this.logger = t, W(this, "keychain", new Map), W(this, "name", Pt), W(this, "version", St), W(this, "initialized", !1), W(this, "storagePrefix", B), W(this, "init", async ()=>{
            if (!this.initialized) {
                const i = await this.getKeyChain();
                typeof i < "u" && (this.keychain = i), this.initialized = !0;
            }
        }), W(this, "has", (i)=>(this.isInitialized(), this.keychain.has(i))), W(this, "set", async (i, s)=>{
            this.isInitialized(), this.keychain.set(i, s), await this.persist();
        }), W(this, "get", (i)=>{
            this.isInitialized();
            const s = this.keychain.get(i);
            if (typeof s > "u") {
                const { message: n } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NO_MATCHING_KEY", `${this.name}: ${i}`);
                throw new Error(n);
            }
            return s;
        }), W(this, "del", async (i)=>{
            this.isInitialized(), this.keychain.delete(i), await this.persist();
        }), this.core = e, this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name);
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get storageKey() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
    }
    async setKeyChain(e) {
        await this.core.storage.setItem(this.storageKey, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapToObj"])(e));
    }
    async getKeyChain() {
        const e = await this.core.storage.getItem(this.storageKey);
        return typeof e < "u" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["objToMap"])(e) : void 0;
    }
    async persist() {
        await this.setKeyChain(this.keychain);
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
}
var An = Object.defineProperty, xn = (r, e, t)=>e in r ? An(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, S = (r, e, t)=>xn(r, typeof e != "symbol" ? e + "" : e, t);
class vi {
    constructor(e, t, i){
        this.core = e, this.logger = t, S(this, "name", Tt), S(this, "keychain"), S(this, "randomSessionIdentifier", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateRandomBytes32"])()), S(this, "initialized", !1), S(this, "init", async ()=>{
            this.initialized || (await this.keychain.init(), this.initialized = !0);
        }), S(this, "hasKeys", (s)=>(this.isInitialized(), this.keychain.has(s))), S(this, "getClientId", async ()=>{
            this.isInitialized();
            const s = await this.getClientSeed(), n = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateKeyPair"](s);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeIss"](n.publicKey);
        }), S(this, "generateKeyPair", ()=>{
            this.isInitialized();
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateKeyPair"])();
            return this.setPrivateKey(s.publicKey, s.privateKey);
        }), S(this, "signJWT", async (s)=>{
            this.isInitialized();
            const n = await this.getClientSeed(), o = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateKeyPair"](n), a = this.randomSessionIdentifier, c = Ct;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signJWT"](a, s, c, o);
        }), S(this, "generateSharedKey", (s, n, o)=>{
            this.isInitialized();
            const a = this.getPrivateKey(s), c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveSymKey"])(a, n);
            return this.setSymKey(c, o);
        }), S(this, "setSymKey", async (s, n)=>{
            this.isInitialized();
            const o = n || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hashKey"])(s);
            return await this.keychain.set(o, s), o;
        }), S(this, "deleteKeyPair", async (s)=>{
            this.isInitialized(), await this.keychain.del(s);
        }), S(this, "deleteSymKey", async (s)=>{
            this.isInitialized(), await this.keychain.del(s);
        }), S(this, "encode", async (s, n, o)=>{
            this.isInitialized();
            const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateEncoding"])(o), c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$safe$2d$json$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonStringify"])(n);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTypeTwoEnvelope"])(a)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encodeTypeTwoEnvelope"])(c, o?.encoding);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTypeOneEnvelope"])(a)) {
                const g = a.senderPublicKey, _ = a.receiverPublicKey;
                s = await this.generateSharedKey(g, _);
            }
            const h = this.getSymKey(s), { type: l, senderPublicKey: d } = a;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])({
                type: l,
                symKey: h,
                message: c,
                senderPublicKey: d,
                encoding: o?.encoding
            });
        }), S(this, "decode", async (s, n, o)=>{
            this.isInitialized();
            const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateDecoding"])(n, o);
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTypeTwoEnvelope"])(a)) {
                const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeTypeTwoEnvelope"])(n, o?.encoding);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$safe$2d$json$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonParse"])(c);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTypeOneEnvelope"])(a)) {
                const c = a.receiverPublicKey, h = a.senderPublicKey;
                s = await this.generateSharedKey(c, h);
            }
            try {
                const c = this.getSymKey(s), h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decrypt"])({
                    symKey: c,
                    encoded: n,
                    encoding: o?.encoding
                });
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$safe$2d$json$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeJsonParse"])(h);
            } catch (c) {
                this.logger.error(`Failed to decode message from topic: '${s}', clientId: '${await this.getClientId()}'`), this.logger.error(c);
            }
        }), S(this, "getPayloadType", (s, n = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BASE64"])=>{
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deserialize"])({
                encoded: s,
                encoding: n
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeTypeByte"])(o.type);
        }), S(this, "getPayloadSenderPublicKey", (s, n = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BASE64"])=>{
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deserialize"])({
                encoded: s,
                encoding: n
            });
            return o.senderPublicKey ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uint8arrays$2f$esm$2f$src$2f$to$2d$string$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toString"])(o.senderPublicKey, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BASE16"]) : void 0;
        }), this.core = e, this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name), this.keychain = i || new Di(this.core, this.logger);
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    async setPrivateKey(e, t) {
        return await this.keychain.set(e, t), e;
    }
    getPrivateKey(e) {
        return this.keychain.get(e);
    }
    async getClientSeed() {
        let e = "";
        try {
            e = this.keychain.get(ke);
        } catch  {
            e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateRandomBytes32"])(), await this.keychain.set(ke, e);
        }
        return Sn(e, "base16");
    }
    getSymKey(e) {
        return this.keychain.get(e);
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
}
var Nn = Object.defineProperty, $n = Object.defineProperties, zn = Object.getOwnPropertyDescriptors, wi = Object.getOwnPropertySymbols, Ln = Object.prototype.hasOwnProperty, kn = Object.prototype.propertyIsEnumerable, Ve = (r, e, t)=>e in r ? Nn(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, jn = (r, e)=>{
    for(var t in e || (e = {}))Ln.call(e, t) && Ve(r, t, e[t]);
    if (wi) for (var t of wi(e))kn.call(e, t) && Ve(r, t, e[t]);
    return r;
}, Un = (r, e)=>$n(r, zn(e)), k = (r, e, t)=>Ve(r, typeof e != "symbol" ? e + "" : e, t);
class _i extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IMessageTracker"] {
    constructor(e, t){
        super(e, t), this.logger = e, this.core = t, k(this, "messages", new Map), k(this, "messagesWithoutClientAck", new Map), k(this, "name", Ot), k(this, "version", Rt), k(this, "initialized", !1), k(this, "storagePrefix", B), k(this, "init", async ()=>{
            if (!this.initialized) {
                this.logger.trace("Initialized");
                try {
                    const i = await this.getRelayerMessages();
                    typeof i < "u" && (this.messages = i);
                    const s = await this.getRelayerMessagesWithoutClientAck();
                    typeof s < "u" && (this.messagesWithoutClientAck = s), this.logger.debug(`Successfully Restored records for ${this.name}`), this.logger.trace({
                        type: "method",
                        method: "restore",
                        size: this.messages.size
                    });
                } catch (i) {
                    this.logger.debug(`Failed to Restore records for ${this.name}`), this.logger.error(i);
                } finally{
                    this.initialized = !0;
                }
            }
        }), k(this, "set", async (i, s, n)=>{
            this.isInitialized();
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hashMessage"])(s);
            let a = this.messages.get(i);
            if (typeof a > "u" && (a = {}), typeof a[o] < "u") return o;
            if (a[o] = s, this.messages.set(i, a), n === le.inbound) {
                const c = this.messagesWithoutClientAck.get(i) || {};
                this.messagesWithoutClientAck.set(i, Un(jn({}, c), {
                    [o]: s
                }));
            }
            return await this.persist(), o;
        }), k(this, "get", (i)=>{
            this.isInitialized();
            let s = this.messages.get(i);
            return typeof s > "u" && (s = {}), s;
        }), k(this, "getWithoutAck", (i)=>{
            this.isInitialized();
            const s = {};
            for (const n of i){
                const o = this.messagesWithoutClientAck.get(n) || {};
                s[n] = Object.values(o);
            }
            return s;
        }), k(this, "has", (i, s)=>{
            this.isInitialized();
            const n = this.get(i), o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hashMessage"])(s);
            return typeof n[o] < "u";
        }), k(this, "ack", async (i, s)=>{
            this.isInitialized();
            const n = this.messagesWithoutClientAck.get(i);
            if (typeof n > "u") return;
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hashMessage"])(s);
            delete n[o], Object.keys(n).length === 0 ? this.messagesWithoutClientAck.delete(i) : this.messagesWithoutClientAck.set(i, n), await this.persist();
        }), k(this, "del", async (i)=>{
            this.isInitialized(), this.messages.delete(i), this.messagesWithoutClientAck.delete(i), await this.persist();
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(e, this.name), this.core = t;
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get storageKey() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
    }
    get storageKeyWithoutClientAck() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name + "_withoutClientAck";
    }
    async setRelayerMessages(e) {
        await this.core.storage.setItem(this.storageKey, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapToObj"])(e));
    }
    async setRelayerMessagesWithoutClientAck(e) {
        await this.core.storage.setItem(this.storageKeyWithoutClientAck, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mapToObj"])(e));
    }
    async getRelayerMessages() {
        const e = await this.core.storage.getItem(this.storageKey);
        return typeof e < "u" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["objToMap"])(e) : void 0;
    }
    async getRelayerMessagesWithoutClientAck() {
        const e = await this.core.storage.getItem(this.storageKeyWithoutClientAck);
        return typeof e < "u" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["objToMap"])(e) : void 0;
    }
    async persist() {
        await this.setRelayerMessages(this.messages), await this.setRelayerMessagesWithoutClientAck(this.messagesWithoutClientAck);
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
}
var Fn = Object.defineProperty, Mn = Object.defineProperties, Kn = Object.getOwnPropertyDescriptors, Ei = Object.getOwnPropertySymbols, Bn = Object.prototype.hasOwnProperty, Vn = Object.prototype.propertyIsEnumerable, qe = (r, e, t)=>e in r ? Fn(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, Ie = (r, e)=>{
    for(var t in e || (e = {}))Bn.call(e, t) && qe(r, t, e[t]);
    if (Ei) for (var t of Ei(e))Vn.call(e, t) && qe(r, t, e[t]);
    return r;
}, Ge = (r, e)=>Mn(r, Kn(e)), V = (r, e, t)=>qe(r, typeof e != "symbol" ? e + "" : e, t);
class qn extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IPublisher"] {
    constructor(e, t){
        super(e, t), this.relayer = e, this.logger = t, V(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]), V(this, "name", At), V(this, "queue", new Map), V(this, "publishTimeout", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_MINUTE"])), V(this, "initialPublishTimeout", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"] * 15)), V(this, "needsTransportRestart", !1), V(this, "publish", async (i, s, n)=>{
            var o;
            this.logger.debug("Publishing Payload"), this.logger.trace({
                type: "method",
                method: "publish",
                params: {
                    topic: i,
                    message: s,
                    opts: n
                }
            });
            const a = n?.ttl || je, c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolName"])(n), h = n?.prompt || !1, l = n?.tag || 0, d = n?.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBigIntRpcId"])().toString(), g = {
                topic: i,
                message: s,
                opts: {
                    ttl: a,
                    relay: c,
                    prompt: h,
                    tag: l,
                    id: d,
                    attestation: n?.attestation,
                    tvf: n?.tvf
                }
            }, _ = `Failed to publish payload, please try again. id:${d} tag:${l}`;
            try {
                const u = new Promise(async (b)=>{
                    const x = ({ id: D })=>{
                        g.opts.id === D && (this.removeRequestFromQueue(D), this.relayer.events.removeListener(C.publish, x), b(g));
                    };
                    this.relayer.events.on(C.publish, x);
                    const I = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(new Promise((D, j)=>{
                        this.rpcPublish({
                            topic: i,
                            message: s,
                            ttl: a,
                            prompt: h,
                            tag: l,
                            id: d,
                            attestation: n?.attestation,
                            tvf: n?.tvf
                        }).then(D).catch((T)=>{
                            this.logger.warn(T, T?.message), j(T);
                        });
                    }), this.initialPublishTimeout, `Failed initial publish, retrying.... id:${d} tag:${l}`);
                    try {
                        await I, this.events.removeListener(C.publish, x);
                    } catch (D) {
                        this.queue.set(d, Ge(Ie({}, g), {
                            attempt: 1
                        })), this.logger.warn(D, D?.message);
                    }
                });
                this.logger.trace({
                    type: "method",
                    method: "publish",
                    params: {
                        id: d,
                        topic: i,
                        message: s,
                        opts: n
                    }
                }), await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(u, this.publishTimeout, _);
            } catch (u) {
                if (this.logger.debug("Failed to Publish Payload"), this.logger.error(u), (o = n?.internal) != null && o.throwOnFailedPublish) throw u;
            } finally{
                this.queue.delete(d);
            }
        }), V(this, "on", (i, s)=>{
            this.events.on(i, s);
        }), V(this, "once", (i, s)=>{
            this.events.once(i, s);
        }), V(this, "off", (i, s)=>{
            this.events.off(i, s);
        }), V(this, "removeListener", (i, s)=>{
            this.events.removeListener(i, s);
        }), this.relayer = e, this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name), this.registerEventListeners();
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    async rpcPublish(e) {
        var t, i, s, n;
        const { topic: o, message: a, ttl: c = je, prompt: h, tag: l, id: d, attestation: g, tvf: _ } = e, u = {
            method: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolApi"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolName"])().protocol).publish,
            params: Ie({
                topic: o,
                message: a,
                ttl: c,
                prompt: h,
                tag: l,
                attestation: g
            }, _),
            id: d
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isUndefined"])((t = u.params) == null ? void 0 : t.prompt) && ((i = u.params) == null || delete i.prompt), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isUndefined"])((s = u.params) == null ? void 0 : s.tag) && ((n = u.params) == null || delete n.tag), this.logger.debug("Outgoing Relay Payload"), this.logger.trace({
            type: "message",
            direction: "outgoing",
            request: u
        });
        const b = await this.relayer.request(u);
        return this.relayer.events.emit(C.publish, e), this.logger.debug("Successfully Published Payload"), b;
    }
    removeRequestFromQueue(e) {
        this.queue.delete(e);
    }
    checkQueue() {
        this.queue.forEach(async (e, t)=>{
            const i = e.attempt + 1;
            this.queue.set(t, Ge(Ie({}, e), {
                attempt: i
            }));
            const { topic: s, message: n, opts: o, attestation: a } = e;
            this.logger.warn({}, `Publisher: queue->publishing: ${e.opts.id}, tag: ${e.opts.tag}, attempt: ${i}`), await this.rpcPublish(Ge(Ie({}, e), {
                topic: s,
                message: n,
                ttl: o.ttl,
                prompt: o.prompt,
                tag: o.tag,
                id: o.id,
                attestation: a,
                tvf: o.tvf
            })), this.logger.warn({}, `Publisher: queue->published: ${e.opts.id}`);
        });
    }
    registerEventListeners() {
        this.relayer.core.heartbeat.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HEARTBEAT_EVENTS"].pulse, ()=>{
            if (this.needsTransportRestart) {
                this.needsTransportRestart = !1, this.relayer.events.emit(C.connection_stalled);
                return;
            }
            this.checkQueue();
        }), this.relayer.on(C.message_ack, (e)=>{
            this.removeRequestFromQueue(e.id.toString());
        });
    }
}
var Gn = Object.defineProperty, Wn = (r, e, t)=>e in r ? Gn(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, ne = (r, e, t)=>Wn(r, typeof e != "symbol" ? e + "" : e, t);
class Hn {
    constructor(){
        ne(this, "map", new Map), ne(this, "set", (e, t)=>{
            const i = this.get(e);
            this.exists(e, t) || this.map.set(e, [
                ...i,
                t
            ]);
        }), ne(this, "get", (e)=>this.map.get(e) || []), ne(this, "exists", (e, t)=>this.get(e).includes(t)), ne(this, "delete", (e, t)=>{
            if (typeof t > "u") {
                this.map.delete(e);
                return;
            }
            if (!this.map.has(e)) return;
            const i = this.get(e);
            if (!this.exists(e, t)) return;
            const s = i.filter((n)=>n !== t);
            if (!s.length) {
                this.map.delete(e);
                return;
            }
            this.map.set(e, s);
        }), ne(this, "clear", ()=>{
            this.map.clear();
        });
    }
    get topics() {
        return Array.from(this.map.keys());
    }
}
var Yn = Object.defineProperty, Jn = Object.defineProperties, Xn = Object.getOwnPropertyDescriptors, Ii = Object.getOwnPropertySymbols, Zn = Object.prototype.hasOwnProperty, Qn = Object.prototype.propertyIsEnumerable, We = (r, e, t)=>e in r ? Yn(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, ge = (r, e)=>{
    for(var t in e || (e = {}))Zn.call(e, t) && We(r, t, e[t]);
    if (Ii) for (var t of Ii(e))Qn.call(e, t) && We(r, t, e[t]);
    return r;
}, He = (r, e)=>Jn(r, Xn(e)), f = (r, e, t)=>We(r, typeof e != "symbol" ? e + "" : e, t);
class Ti extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ISubscriber"] {
    constructor(e, t){
        super(e, t), this.relayer = e, this.logger = t, f(this, "subscriptions", new Map), f(this, "topicMap", new Hn), f(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]), f(this, "name", Ut), f(this, "version", Ft), f(this, "pending", new Map), f(this, "cached", []), f(this, "initialized", !1), f(this, "storagePrefix", B), f(this, "subscribeTimeout", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_MINUTE"])), f(this, "initialSubscribeTimeout", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"] * 15)), f(this, "clientId"), f(this, "batchSubscribeTopicsLimit", 500), f(this, "init", async ()=>{
            this.initialized || (this.logger.trace("Initialized"), this.registerEventListeners(), await this.restore()), this.initialized = !0;
        }), f(this, "subscribe", async (i, s)=>{
            this.isInitialized(), this.logger.debug("Subscribing Topic"), this.logger.trace({
                type: "method",
                method: "subscribe",
                params: {
                    topic: i,
                    opts: s
                }
            });
            try {
                const n = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolName"])(s), o = {
                    topic: i,
                    relay: n,
                    transportType: s?.transportType
                };
                this.pending.set(i, o);
                const a = await this.rpcSubscribe(i, n, s);
                return typeof a == "string" && (this.onSubscribe(a, o), this.logger.debug("Successfully Subscribed Topic"), this.logger.trace({
                    type: "method",
                    method: "subscribe",
                    params: {
                        topic: i,
                        opts: s
                    }
                })), a;
            } catch (n) {
                throw this.logger.debug("Failed to Subscribe Topic"), this.logger.error(n), n;
            }
        }), f(this, "unsubscribe", async (i, s)=>{
            this.isInitialized(), typeof s?.id < "u" ? await this.unsubscribeById(i, s.id, s) : await this.unsubscribeByTopic(i, s);
        }), f(this, "isSubscribed", (i)=>new Promise((s)=>{
                s(this.topicMap.topics.includes(i));
            })), f(this, "isKnownTopic", (i)=>new Promise((s)=>{
                s(this.topicMap.topics.includes(i) || this.pending.has(i) || this.cached.some((n)=>n.topic === i));
            })), f(this, "on", (i, s)=>{
            this.events.on(i, s);
        }), f(this, "once", (i, s)=>{
            this.events.once(i, s);
        }), f(this, "off", (i, s)=>{
            this.events.off(i, s);
        }), f(this, "removeListener", (i, s)=>{
            this.events.removeListener(i, s);
        }), f(this, "start", async ()=>{
            await this.onConnect();
        }), f(this, "stop", async ()=>{
            await this.onDisconnect();
        }), f(this, "restart", async ()=>{
            await this.restore(), await this.onRestart();
        }), f(this, "checkPending", async ()=>{
            if (this.pending.size === 0 && (!this.initialized || !this.relayer.connected)) return;
            const i = [];
            this.pending.forEach((s)=>{
                i.push(s);
            }), await this.batchSubscribe(i);
        }), f(this, "registerEventListeners", ()=>{
            this.relayer.core.heartbeat.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HEARTBEAT_EVENTS"].pulse, async ()=>{
                await this.checkPending();
            }), this.events.on($.created, async (i)=>{
                const s = $.created;
                this.logger.info(`Emitting ${s}`), this.logger.debug({
                    type: "event",
                    event: s,
                    data: i
                }), await this.persist();
            }), this.events.on($.deleted, async (i)=>{
                const s = $.deleted;
                this.logger.info(`Emitting ${s}`), this.logger.debug({
                    type: "event",
                    event: s,
                    data: i
                }), await this.persist();
            });
        }), this.relayer = e, this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name), this.clientId = "";
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get storageKey() {
        return this.storagePrefix + this.version + this.relayer.core.customStoragePrefix + "//" + this.name;
    }
    get length() {
        return this.subscriptions.size;
    }
    get ids() {
        return Array.from(this.subscriptions.keys());
    }
    get values() {
        return Array.from(this.subscriptions.values());
    }
    get topics() {
        return this.topicMap.topics;
    }
    get hasAnyTopics() {
        return this.topicMap.topics.length > 0 || this.pending.size > 0 || this.cached.length > 0 || this.subscriptions.size > 0;
    }
    hasSubscription(e, t) {
        let i = !1;
        try {
            i = this.getSubscription(e).topic === t;
        } catch  {}
        return i;
    }
    reset() {
        this.cached = [], this.initialized = !0;
    }
    onDisable() {
        this.values.length > 0 && (this.cached = this.values), this.subscriptions.clear(), this.topicMap.clear();
    }
    async unsubscribeByTopic(e, t) {
        const i = this.topicMap.get(e);
        await Promise.all(i.map(async (s)=>await this.unsubscribeById(e, s, t)));
    }
    async unsubscribeById(e, t, i) {
        this.logger.debug("Unsubscribing Topic"), this.logger.trace({
            type: "method",
            method: "unsubscribe",
            params: {
                topic: e,
                id: t,
                opts: i
            }
        });
        try {
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolName"])(i);
            await this.restartToComplete({
                topic: e,
                id: t,
                relay: s
            }), await this.rpcUnsubscribe(e, t, s);
            const n = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSdkError"])("USER_DISCONNECTED", `${this.name}, ${e}`);
            await this.onUnsubscribe(e, t, n), this.logger.debug("Successfully Unsubscribed Topic"), this.logger.trace({
                type: "method",
                method: "unsubscribe",
                params: {
                    topic: e,
                    id: t,
                    opts: i
                }
            });
        } catch (s) {
            throw this.logger.debug("Failed to Unsubscribe Topic"), this.logger.error(s), s;
        }
    }
    async rpcSubscribe(e, t, i) {
        var s;
        (!i || i?.transportType === Q.relay) && await this.restartToComplete({
            topic: e,
            id: e,
            relay: t
        });
        const n = {
            method: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolApi"])(t.protocol).subscribe,
            params: {
                topic: e
            }
        };
        this.logger.debug("Outgoing Relay Payload"), this.logger.trace({
            type: "payload",
            direction: "outgoing",
            request: n
        });
        const o = (s = i?.internal) == null ? void 0 : s.throwOnFailedPublish;
        try {
            const a = await this.getSubscriptionId(e);
            if (i?.transportType === Q.link_mode) return setTimeout(()=>{
                (this.relayer.connected || this.relayer.connecting) && this.relayer.request(n).catch((l)=>this.logger.warn(l));
            }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"])), a;
            const c = new Promise(async (l)=>{
                const d = (g)=>{
                    g.topic === e && (this.events.removeListener($.created, d), l(g.id));
                };
                this.events.on($.created, d);
                try {
                    const g = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(new Promise((_, u)=>{
                        this.relayer.request(n).catch((b)=>{
                            this.logger.warn(b, b?.message), u(b);
                        }).then(_);
                    }), this.initialSubscribeTimeout, `Subscribing to ${e} failed, please try again`);
                    this.events.removeListener($.created, d), l(g);
                } catch  {}
            }), h = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(c, this.subscribeTimeout, `Subscribing to ${e} failed, please try again`);
            if (!h && o) throw new Error(`Subscribing to ${e} failed, please try again`);
            return h ? a : null;
        } catch (a) {
            if (this.logger.debug("Outgoing Relay Subscribe Payload stalled"), this.relayer.events.emit(C.connection_stalled), o) throw a;
        }
        return null;
    }
    async rpcBatchSubscribe(e) {
        if (!e.length) return;
        const t = e[0].relay, i = {
            method: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolApi"])(t.protocol).batchSubscribe,
            params: {
                topics: e.map((s)=>s.topic)
            }
        };
        this.logger.debug("Outgoing Relay Payload"), this.logger.trace({
            type: "payload",
            direction: "outgoing",
            request: i
        });
        try {
            await await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(new Promise((s)=>{
                this.relayer.request(i).catch((n)=>this.logger.warn(n)).then(s);
            }), this.subscribeTimeout, "rpcBatchSubscribe failed, please try again");
        } catch  {
            this.relayer.events.emit(C.connection_stalled);
        }
    }
    async rpcBatchFetchMessages(e) {
        if (!e.length) return;
        const t = e[0].relay, i = {
            method: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolApi"])(t.protocol).batchFetchMessages,
            params: {
                topics: e.map((n)=>n.topic)
            }
        };
        this.logger.debug("Outgoing Relay Payload"), this.logger.trace({
            type: "payload",
            direction: "outgoing",
            request: i
        });
        let s;
        try {
            s = await await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(new Promise((n, o)=>{
                this.relayer.request(i).catch((a)=>{
                    this.logger.warn(a), o(a);
                }).then(n);
            }), this.subscribeTimeout, "rpcBatchFetchMessages failed, please try again");
        } catch  {
            this.relayer.events.emit(C.connection_stalled);
        }
        return s;
    }
    rpcUnsubscribe(e, t, i) {
        const s = {
            method: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getRelayProtocolApi"])(i.protocol).unsubscribe,
            params: {
                topic: e,
                id: t
            }
        };
        return this.logger.debug("Outgoing Relay Payload"), this.logger.trace({
            type: "payload",
            direction: "outgoing",
            request: s
        }), this.relayer.request(s);
    }
    onSubscribe(e, t) {
        this.setSubscription(e, He(ge({}, t), {
            id: e
        })), this.pending.delete(t.topic);
    }
    onBatchSubscribe(e) {
        e.length && e.forEach((t)=>{
            this.setSubscription(t.id, ge({}, t)), this.pending.delete(t.topic);
        });
    }
    async onUnsubscribe(e, t, i) {
        this.events.removeAllListeners(t), this.hasSubscription(t, e) && this.deleteSubscription(t, i), await this.relayer.messages.del(e);
    }
    async setRelayerSubscriptions(e) {
        await this.relayer.core.storage.setItem(this.storageKey, e);
    }
    async getRelayerSubscriptions() {
        return await this.relayer.core.storage.getItem(this.storageKey);
    }
    setSubscription(e, t) {
        this.logger.debug("Setting subscription"), this.logger.trace({
            type: "method",
            method: "setSubscription",
            id: e,
            subscription: t
        }), this.addSubscription(e, t);
    }
    addSubscription(e, t) {
        this.subscriptions.set(e, ge({}, t)), this.topicMap.set(t.topic, e), this.events.emit($.created, t);
    }
    getSubscription(e) {
        this.logger.debug("Getting subscription"), this.logger.trace({
            type: "method",
            method: "getSubscription",
            id: e
        });
        const t = this.subscriptions.get(e);
        if (!t) {
            const { message: i } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NO_MATCHING_KEY", `${this.name}: ${e}`);
            throw new Error(i);
        }
        return t;
    }
    deleteSubscription(e, t) {
        this.logger.debug("Deleting subscription"), this.logger.trace({
            type: "method",
            method: "deleteSubscription",
            id: e,
            reason: t
        });
        const i = this.getSubscription(e);
        this.subscriptions.delete(e), this.topicMap.delete(i.topic, e), this.events.emit($.deleted, He(ge({}, i), {
            reason: t
        }));
    }
    async persist() {
        await this.setRelayerSubscriptions(this.values), this.events.emit($.sync);
    }
    async onRestart() {
        if (this.cached.length) {
            const e = [
                ...this.cached
            ], t = Math.ceil(this.cached.length / this.batchSubscribeTopicsLimit);
            for(let i = 0; i < t; i++){
                const s = e.splice(0, this.batchSubscribeTopicsLimit);
                await this.batchSubscribe(s);
            }
        }
        this.events.emit($.resubscribed);
    }
    async restore() {
        try {
            const e = await this.getRelayerSubscriptions();
            if (typeof e > "u" || !e.length) return;
            if (this.subscriptions.size) {
                const { message: t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("RESTORE_WILL_OVERRIDE", this.name);
                throw this.logger.error(t), this.logger.error(`${this.name}: ${JSON.stringify(this.values)}`), new Error(t);
            }
            this.cached = e, this.logger.debug(`Successfully Restored subscriptions for ${this.name}`), this.logger.trace({
                type: "method",
                method: "restore",
                subscriptions: this.values
            });
        } catch (e) {
            this.logger.debug(`Failed to Restore subscriptions for ${this.name}`), this.logger.error(e);
        }
    }
    async batchSubscribe(e) {
        e.length && (await this.rpcBatchSubscribe(e), this.onBatchSubscribe(await Promise.all(e.map(async (t)=>He(ge({}, t), {
                id: await this.getSubscriptionId(t.topic)
            })))));
    }
    async batchFetchMessages(e) {
        if (!e.length) return;
        this.logger.trace(`Fetching batch messages for ${e.length} subscriptions`);
        const t = await this.rpcBatchFetchMessages(e);
        t && t.messages && (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sleep"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"])), await this.relayer.handleBatchMessageEvents(t.messages));
    }
    async onConnect() {
        await this.restart(), this.reset();
    }
    onDisconnect() {
        this.onDisable();
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
    async restartToComplete(e) {
        !this.relayer.connected && !this.relayer.connecting && (this.cached.push(e), await this.relayer.transportOpen());
    }
    async getClientId() {
        return this.clientId || (this.clientId = await this.relayer.core.crypto.getClientId()), this.clientId;
    }
    async getSubscriptionId(e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hashMessage"])(e + await this.getClientId());
    }
}
var eo = Object.defineProperty, Ci = Object.getOwnPropertySymbols, to = Object.prototype.hasOwnProperty, io = Object.prototype.propertyIsEnumerable, Ye = (r, e, t)=>e in r ? eo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, Pi = (r, e)=>{
    for(var t in e || (e = {}))to.call(e, t) && Ye(r, t, e[t]);
    if (Ci) for (var t of Ci(e))io.call(e, t) && Ye(r, t, e[t]);
    return r;
}, y = (r, e, t)=>Ye(r, typeof e != "symbol" ? e + "" : e, t);
class Si extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IRelayer"] {
    constructor(e){
        super(e), y(this, "protocol", "wc"), y(this, "version", 2), y(this, "core"), y(this, "logger"), y(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]), y(this, "provider"), y(this, "messages"), y(this, "subscriber"), y(this, "publisher"), y(this, "name", $t), y(this, "transportExplicitlyClosed", !1), y(this, "initialized", !1), y(this, "connectionAttemptInProgress", !1), y(this, "relayUrl"), y(this, "projectId"), y(this, "packageName"), y(this, "bundleId"), y(this, "hasExperiencedNetworkDisruption", !1), y(this, "pingTimeout"), y(this, "heartBeatTimeout", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THIRTY_SECONDS"] + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_SECONDS"])), y(this, "reconnectTimeout"), y(this, "connectPromise"), y(this, "reconnectInProgress", !1), y(this, "requestsInFlight", []), y(this, "connectTimeout", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"] * 15)), y(this, "request", async (t)=>{
            var i, s;
            this.logger.debug("Publishing Request Payload");
            const n = t.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBigIntRpcId"])().toString();
            await this.toEstablishConnection();
            try {
                this.logger.trace({
                    id: n,
                    method: t.method,
                    topic: (i = t.params) == null ? void 0 : i.topic
                }, "relayer.request - publishing...");
                const o = `${n}:${((s = t.params) == null ? void 0 : s.tag) || ""}`;
                this.requestsInFlight.push(o);
                const a = await this.provider.request(t);
                return this.requestsInFlight = this.requestsInFlight.filter((c)=>c !== o), a;
            } catch (o) {
                throw this.logger.debug(`Failed to Publish Request: ${n}`), o;
            }
        }), y(this, "resetPingTimeout", ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNode"])() && (clearTimeout(this.pingTimeout), this.pingTimeout = setTimeout(()=>{
                var t, i, s, n;
                try {
                    this.logger.debug({}, "pingTimeout: Connection stalled, terminating..."), (n = (s = (i = (t = this.provider) == null ? void 0 : t.connection) == null ? void 0 : i.socket) == null ? void 0 : s.terminate) == null || n.call(s);
                } catch (o) {
                    this.logger.warn(o, o?.message);
                }
            }, this.heartBeatTimeout));
        }), y(this, "onPayloadHandler", (t)=>{
            this.onProviderPayload(t), this.resetPingTimeout();
        }), y(this, "onConnectHandler", ()=>{
            this.logger.warn({}, "Relayer connected \u{1F6DC}"), this.startPingTimeout(), this.events.emit(C.connect);
        }), y(this, "onDisconnectHandler", ()=>{
            this.logger.warn({}, "Relayer disconnected \u{1F6D1}"), this.requestsInFlight = [], this.onProviderDisconnect();
        }), y(this, "onProviderErrorHandler", (t)=>{
            this.logger.fatal(`Fatal socket error: ${t.message}`), this.events.emit(C.error, t), this.logger.fatal("Fatal socket error received, closing transport"), this.transportClose();
        }), y(this, "registerProviderListeners", ()=>{
            this.provider.on(L.payload, this.onPayloadHandler), this.provider.on(L.connect, this.onConnectHandler), this.provider.on(L.disconnect, this.onDisconnectHandler), this.provider.on(L.error, this.onProviderErrorHandler);
        }), this.core = e.core, this.logger = typeof e.logger < "u" && typeof e.logger != "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(e.logger, this.name) : (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__$3c$export__default__as__pino$3e$__["pino"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultLoggerOptions"])({
            level: e.logger || Nt
        })), this.messages = new _i(this.logger, e.core), this.subscriber = new Ti(this, this.logger), this.publisher = new qn(this, this.logger), this.relayUrl = e?.relayUrl || Ue, this.projectId = e.projectId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAndroid"])() ? this.packageName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAppId"])() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isIos"])() && (this.bundleId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAppId"])()), this.provider = {};
    }
    async init() {
        if (this.logger.trace("Initialized"), this.registerEventListeners(), await Promise.all([
            this.messages.init(),
            this.subscriber.init()
        ]), this.initialized = !0, this.subscriber.hasAnyTopics) try {
            await this.transportOpen();
        } catch (e) {
            this.logger.warn(e, e?.message);
        }
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get connected() {
        var e, t, i;
        return ((i = (t = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : t.socket) == null ? void 0 : i.readyState) === 1 || !1;
    }
    get connecting() {
        var e, t, i;
        return ((i = (t = (e = this.provider) == null ? void 0 : e.connection) == null ? void 0 : t.socket) == null ? void 0 : i.readyState) === 0 || this.connectPromise !== void 0 || !1;
    }
    async publish(e, t, i) {
        this.isInitialized(), await this.publisher.publish(e, t, i), await this.recordMessageEvent({
            topic: e,
            message: t,
            publishedAt: Date.now(),
            transportType: Q.relay
        }, le.outbound);
    }
    async subscribe(e, t) {
        var i, s, n;
        this.isInitialized(), (!(t != null && t.transportType) || t?.transportType === "relay") && await this.toEstablishConnection();
        const o = typeof ((i = t?.internal) == null ? void 0 : i.throwOnFailedPublish) > "u" ? !0 : (s = t?.internal) == null ? void 0 : s.throwOnFailedPublish;
        let a = ((n = this.subscriber.topicMap.get(e)) == null ? void 0 : n[0]) || "", c;
        const h = (l)=>{
            l.topic === e && (this.subscriber.off($.created, h), c());
        };
        return await Promise.all([
            new Promise((l)=>{
                c = l, this.subscriber.on($.created, h);
            }),
            new Promise(async (l, d)=>{
                a = await this.subscriber.subscribe(e, Pi({
                    internal: {
                        throwOnFailedPublish: o
                    }
                }, t)).catch((g)=>{
                    o && d(g);
                }) || a, l();
            })
        ]), a;
    }
    async unsubscribe(e, t) {
        this.isInitialized(), await this.subscriber.unsubscribe(e, t);
    }
    on(e, t) {
        this.events.on(e, t);
    }
    once(e, t) {
        this.events.once(e, t);
    }
    off(e, t) {
        this.events.off(e, t);
    }
    removeListener(e, t) {
        this.events.removeListener(e, t);
    }
    async transportDisconnect() {
        this.provider.disconnect && (this.hasExperiencedNetworkDisruption || this.connected) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(this.provider.disconnect(), 2e3, "provider.disconnect()").catch(()=>this.onProviderDisconnect()) : this.onProviderDisconnect();
    }
    async transportClose() {
        this.transportExplicitlyClosed = !0, await this.transportDisconnect();
    }
    async transportOpen(e) {
        if (!this.subscriber.hasAnyTopics) {
            this.logger.warn("Starting WS connection skipped because the client has no topics to work with.");
            return;
        }
        if (this.connectPromise ? (this.logger.debug({}, "Waiting for existing connection attempt to resolve..."), await this.connectPromise, this.logger.debug({}, "Existing connection attempt resolved")) : (this.connectPromise = new Promise(async (t, i)=>{
            await this.connect(e).then(t).catch(i).finally(()=>{
                this.connectPromise = void 0;
            });
        }), await this.connectPromise), !this.connected) throw new Error(`Couldn't establish socket connection to the relay server: ${this.relayUrl}`);
    }
    async restartTransport(e) {
        this.logger.debug({}, "Restarting transport..."), !this.connectionAttemptInProgress && (this.relayUrl = e || this.relayUrl, await this.confirmOnlineStateOrThrow(), await this.transportClose(), await this.transportOpen());
    }
    async confirmOnlineStateOrThrow() {
        if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOnline"])()) throw new Error("No internet connection detected. Please restart your network and try again.");
    }
    async handleBatchMessageEvents(e) {
        if (e?.length === 0) {
            this.logger.trace("Batch message events is empty. Ignoring...");
            return;
        }
        const t = e.sort((i, s)=>i.publishedAt - s.publishedAt);
        this.logger.debug(`Batch of ${t.length} message events sorted`);
        for (const i of t)try {
            await this.onMessageEvent(i);
        } catch (s) {
            this.logger.warn(s, "Error while processing batch message event: " + s?.message);
        }
        this.logger.trace(`Batch of ${t.length} message events processed`);
    }
    async onLinkMessageEvent(e, t) {
        const { topic: i } = e;
        if (!t.sessionExists) {
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcExpiry"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_MINUTES"]), n = {
                topic: i,
                expiry: s,
                relay: {
                    protocol: "irn"
                },
                active: !1
            };
            await this.core.pairing.pairings.set(i, n);
        }
        this.events.emit(C.message, e), await this.recordMessageEvent(e, le.inbound);
    }
    async connect(e) {
        await this.confirmOnlineStateOrThrow(), e && e !== this.relayUrl && (this.relayUrl = e, await this.transportDisconnect()), this.connectionAttemptInProgress = !0, this.transportExplicitlyClosed = !1;
        let t = 1;
        for(; t < 6;){
            try {
                if (this.transportExplicitlyClosed) break;
                this.logger.debug({}, `Connecting to ${this.relayUrl}, attempt: ${t}...`), await this.createProvider(), await new Promise(async (i, s)=>{
                    const n = ()=>{
                        s(new Error("Connection interrupted while trying to subscribe"));
                    };
                    this.provider.once(L.disconnect, n), await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createExpiringPromise"])(new Promise((o, a)=>{
                        this.provider.connect().then(o).catch(a);
                    }), this.connectTimeout, `Socket stalled when trying to connect to ${this.relayUrl}`).catch((o)=>{
                        s(o);
                    }).finally(()=>{
                        this.provider.off(L.disconnect, n), clearTimeout(this.reconnectTimeout);
                    }), await new Promise(async (o, a)=>{
                        const c = ()=>{
                            a(new Error("Connection interrupted while trying to subscribe"));
                        };
                        this.provider.once(L.disconnect, c), await this.subscriber.start().then(o).catch(a).finally(()=>{
                            this.provider.off(L.disconnect, c);
                        });
                    }), this.hasExperiencedNetworkDisruption = !1, i();
                });
            } catch (i) {
                await this.subscriber.stop();
                const s = i;
                this.logger.warn({}, s.message), this.hasExperiencedNetworkDisruption = !0;
            } finally{
                this.connectionAttemptInProgress = !1;
            }
            if (this.connected) {
                this.logger.debug({}, `Connected to ${this.relayUrl} successfully on attempt: ${t}`);
                break;
            }
            await new Promise((i)=>setTimeout(i, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(t * 1))), t++;
        }
    }
    startPingTimeout() {
        var e, t, i, s, n;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNode"])()) try {
            (t = (e = this.provider) == null ? void 0 : e.connection) != null && t.socket && ((n = (s = (i = this.provider) == null ? void 0 : i.connection) == null ? void 0 : s.socket) == null || n.on("ping", ()=>{
                this.resetPingTimeout();
            })), this.resetPingTimeout();
        } catch (o) {
            this.logger.warn(o, o?.message);
        }
    }
    async createProvider() {
        this.provider.connection && this.unregisterProviderListeners();
        const e = await this.core.crypto.signJWT(this.relayUrl);
        this.provider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$provider$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JsonRpcProvider"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$ws$2d$connection$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatRelayRpcUrl"])({
            sdkVersion: _e,
            protocol: this.protocol,
            version: this.version,
            relayUrl: this.relayUrl,
            projectId: this.projectId,
            auth: e,
            useOnCloseEvent: !0,
            bundleId: this.bundleId,
            packageName: this.packageName
        }))), this.registerProviderListeners();
    }
    async recordMessageEvent(e, t) {
        const { topic: i, message: s } = e;
        await this.messages.set(i, s, t);
    }
    async shouldIgnoreMessageEvent(e) {
        const { topic: t, message: i } = e;
        if (!i || i.length === 0) return this.logger.warn(`Ignoring invalid/empty message: ${i}`), !0;
        if (!await this.subscriber.isKnownTopic(t)) return this.logger.warn(`Ignoring message for unknown topic ${t}`), !0;
        const s = this.messages.has(t, i);
        return s && this.logger.warn(`Ignoring duplicate message: ${i}`), s;
    }
    async onProviderPayload(e) {
        if (this.logger.debug("Incoming Relay Payload"), this.logger.trace({
            type: "payload",
            direction: "incoming",
            payload: e
        }), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcRequest"])(e)) {
            if (!e.method.endsWith(zt)) return;
            const t = e.params, { topic: i, message: s, publishedAt: n, attestation: o } = t.data, a = {
                topic: i,
                message: s,
                publishedAt: n,
                transportType: Q.relay,
                attestation: o
            };
            this.logger.debug("Emitting Relayer Payload"), this.logger.trace(Pi({
                type: "event",
                event: t.id
            }, a)), this.events.emit(t.id, a), await this.acknowledgePayload(e), await this.onMessageEvent(a);
        } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcResponse"])(e) && this.events.emit(C.message_ack, e);
    }
    async onMessageEvent(e) {
        await this.shouldIgnoreMessageEvent(e) || (await this.recordMessageEvent(e, le.inbound), this.events.emit(C.message, e));
    }
    async acknowledgePayload(e) {
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatJsonRpcResult"])(e.id, !0);
        await this.provider.connection.send(t);
    }
    unregisterProviderListeners() {
        this.provider.off(L.payload, this.onPayloadHandler), this.provider.off(L.connect, this.onConnectHandler), this.provider.off(L.disconnect, this.onDisconnectHandler), this.provider.off(L.error, this.onProviderErrorHandler), clearTimeout(this.pingTimeout);
    }
    async registerEventListeners() {
        let e = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOnline"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeToNetworkChange"])(async (t)=>{
            e !== t && (e = t, t ? await this.transportOpen().catch((i)=>this.logger.error(i, i?.message)) : (this.hasExperiencedNetworkDisruption = !0, await this.transportDisconnect(), this.transportExplicitlyClosed = !1));
        }), this.core.heartbeat.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HEARTBEAT_EVENTS"].pulse, async ()=>{
            if (!this.transportExplicitlyClosed && !this.connected && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAppVisible"])()) try {
                await this.confirmOnlineStateOrThrow(), await this.transportOpen();
            } catch (t) {
                this.logger.warn(t, t?.message);
            }
        });
    }
    async onProviderDisconnect() {
        clearTimeout(this.pingTimeout), this.events.emit(C.disconnect), this.connectionAttemptInProgress = !1, !this.reconnectInProgress && (this.reconnectInProgress = !0, await this.subscriber.stop(), this.subscriber.hasAnyTopics && (this.transportExplicitlyClosed || (this.reconnectTimeout = setTimeout(async ()=>{
            await this.transportOpen().catch((e)=>this.logger.error(e, e?.message)), this.reconnectTimeout = void 0, this.reconnectInProgress = !1;
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(Lt)))));
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
    async toEstablishConnection() {
        if (await this.confirmOnlineStateOrThrow(), !this.connected) {
            if (this.connectPromise) {
                await this.connectPromise;
                return;
            }
            await this.connect();
        }
    }
}
function so() {}
function Oi(r) {
    if (!r || typeof r != "object") return !1;
    const e = Object.getPrototypeOf(r);
    return e === null || e === Object.prototype || Object.getPrototypeOf(e) === null ? Object.prototype.toString.call(r) === "[object Object]" : !1;
}
function Ri(r) {
    return Object.getOwnPropertySymbols(r).filter((e)=>Object.prototype.propertyIsEnumerable.call(r, e));
}
function Ai(r) {
    return r == null ? r === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(r);
}
const ro = "[object RegExp]", no = "[object String]", oo = "[object Number]", ao = "[object Boolean]", xi = "[object Arguments]", co = "[object Symbol]", ho = "[object Date]", lo = "[object Map]", uo = "[object Set]", go = "[object Array]", po = "[object Function]", yo = "[object ArrayBuffer]", Je = "[object Object]", bo = "[object Error]", mo = "[object DataView]", fo = "[object Uint8Array]", Do = "[object Uint8ClampedArray]", vo = "[object Uint16Array]", wo = "[object Uint32Array]", _o = "[object BigUint64Array]", Eo = "[object Int8Array]", Io = "[object Int16Array]", To = "[object Int32Array]", Co = "[object BigInt64Array]", Po = "[object Float32Array]", So = "[object Float64Array]";
function Oo(r, e) {
    return r === e || Number.isNaN(r) && Number.isNaN(e);
}
function Ro(r, e, t) {
    return pe(r, e, void 0, void 0, void 0, void 0, t);
}
function pe(r, e, t, i, s, n, o) {
    const a = o(r, e, t, i, s, n);
    if (a !== void 0) return a;
    if (typeof r == typeof e) switch(typeof r){
        case "bigint":
        case "string":
        case "boolean":
        case "symbol":
        case "undefined":
            return r === e;
        case "number":
            return r === e || Object.is(r, e);
        case "function":
            return r === e;
        case "object":
            return ye(r, e, n, o);
    }
    return ye(r, e, n, o);
}
function ye(r, e, t, i) {
    if (Object.is(r, e)) return !0;
    let s = Ai(r), n = Ai(e);
    if (s === xi && (s = Je), n === xi && (n = Je), s !== n) return !1;
    switch(s){
        case no:
            return r.toString() === e.toString();
        case oo:
            {
                const c = r.valueOf(), h = e.valueOf();
                return Oo(c, h);
            }
        case ao:
        case ho:
        case co:
            return Object.is(r.valueOf(), e.valueOf());
        case ro:
            return r.source === e.source && r.flags === e.flags;
        case po:
            return r === e;
    }
    t = t ?? new Map;
    const o = t.get(r), a = t.get(e);
    if (o != null && a != null) return o === e;
    t.set(r, e), t.set(e, r);
    try {
        switch(s){
            case lo:
                {
                    if (r.size !== e.size) return !1;
                    for (const [c, h] of r.entries())if (!e.has(c) || !pe(h, e.get(c), c, r, e, t, i)) return !1;
                    return !0;
                }
            case uo:
                {
                    if (r.size !== e.size) return !1;
                    const c = Array.from(r.values()), h = Array.from(e.values());
                    for(let l = 0; l < c.length; l++){
                        const d = c[l], g = h.findIndex((_)=>pe(d, _, void 0, r, e, t, i));
                        if (g === -1) return !1;
                        h.splice(g, 1);
                    }
                    return !0;
                }
            case go:
            case fo:
            case Do:
            case vo:
            case wo:
            case _o:
            case Eo:
            case Io:
            case To:
            case Co:
            case Po:
            case So:
                {
                    if (typeof Buffer < "u" && Buffer.isBuffer(r) !== Buffer.isBuffer(e) || r.length !== e.length) return !1;
                    for(let c = 0; c < r.length; c++)if (!pe(r[c], e[c], c, r, e, t, i)) return !1;
                    return !0;
                }
            case yo:
                return r.byteLength !== e.byteLength ? !1 : ye(new Uint8Array(r), new Uint8Array(e), t, i);
            case mo:
                return r.byteLength !== e.byteLength || r.byteOffset !== e.byteOffset ? !1 : ye(new Uint8Array(r), new Uint8Array(e), t, i);
            case bo:
                return r.name === e.name && r.message === e.message;
            case Je:
                {
                    if (!(ye(r.constructor, e.constructor, t, i) || Oi(r) && Oi(e))) return !1;
                    const h = [
                        ...Object.keys(r),
                        ...Ri(r)
                    ], l = [
                        ...Object.keys(e),
                        ...Ri(e)
                    ];
                    if (h.length !== l.length) return !1;
                    for(let d = 0; d < h.length; d++){
                        const g = h[d], _ = r[g];
                        if (!Object.hasOwn(e, g)) return !1;
                        const u = e[g];
                        if (!pe(_, u, g, r, e, t, i)) return !1;
                    }
                    return !0;
                }
            default:
                return !1;
        }
    } finally{
        t.delete(r), t.delete(e);
    }
}
function Ao(r, e) {
    return Ro(r, e, so);
}
var xo = Object.defineProperty, Ni = Object.getOwnPropertySymbols, No = Object.prototype.hasOwnProperty, $o = Object.prototype.propertyIsEnumerable, Xe = (r, e, t)=>e in r ? xo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, $i = (r, e)=>{
    for(var t in e || (e = {}))No.call(e, t) && Xe(r, t, e[t]);
    if (Ni) for (var t of Ni(e))$o.call(e, t) && Xe(r, t, e[t]);
    return r;
}, z = (r, e, t)=>Xe(r, typeof e != "symbol" ? e + "" : e, t);
class zi extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IStore"] {
    constructor(e, t, i, s = B, n = void 0){
        super(e, t, i, s), this.core = e, this.logger = t, this.name = i, z(this, "map", new Map), z(this, "version", kt), z(this, "cached", []), z(this, "initialized", !1), z(this, "getKey"), z(this, "storagePrefix", B), z(this, "recentlyDeleted", []), z(this, "recentlyDeletedLimit", 200), z(this, "init", async ()=>{
            this.initialized || (this.logger.trace("Initialized"), await this.restore(), this.cached.forEach((o)=>{
                this.getKey && o !== null && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isUndefined"])(o) ? this.map.set(this.getKey(o), o) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isProposalStruct"])(o) ? this.map.set(o.id, o) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSessionStruct"])(o) && this.map.set(o.topic, o);
            }), this.cached = [], this.initialized = !0);
        }), z(this, "set", async (o, a)=>{
            this.isInitialized(), this.map.has(o) ? await this.update(o, a) : (this.logger.debug("Setting value"), this.logger.trace({
                type: "method",
                method: "set",
                key: o,
                value: a
            }), this.map.set(o, a), await this.persist());
        }), z(this, "get", (o)=>(this.isInitialized(), this.logger.debug("Getting value"), this.logger.trace({
                type: "method",
                method: "get",
                key: o
            }), this.getData(o))), z(this, "getAll", (o)=>(this.isInitialized(), o ? this.values.filter((a)=>Object.keys(o).every((c)=>Ao(a[c], o[c]))) : this.values)), z(this, "update", async (o, a)=>{
            this.isInitialized(), this.logger.debug("Updating value"), this.logger.trace({
                type: "method",
                method: "update",
                key: o,
                update: a
            });
            const c = $i($i({}, this.getData(o)), a);
            this.map.set(o, c), await this.persist();
        }), z(this, "delete", async (o, a)=>{
            this.isInitialized(), this.map.has(o) && (this.logger.debug("Deleting value"), this.logger.trace({
                type: "method",
                method: "delete",
                key: o,
                reason: a
            }), this.map.delete(o), this.addToRecentlyDeleted(o), await this.persist());
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name), this.storagePrefix = s, this.getKey = n;
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get storageKey() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
    }
    get length() {
        return this.map.size;
    }
    get keys() {
        return Array.from(this.map.keys());
    }
    get values() {
        return Array.from(this.map.values());
    }
    addToRecentlyDeleted(e) {
        this.recentlyDeleted.push(e), this.recentlyDeleted.length >= this.recentlyDeletedLimit && this.recentlyDeleted.splice(0, this.recentlyDeletedLimit / 2);
    }
    async setDataStore(e) {
        await this.core.storage.setItem(this.storageKey, e);
    }
    async getDataStore() {
        return await this.core.storage.getItem(this.storageKey);
    }
    getData(e) {
        const t = this.map.get(e);
        if (!t) {
            if (this.recentlyDeleted.includes(e)) {
                const { message: s } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", `Record was recently deleted - ${this.name}: ${e}`);
                throw this.logger.error(s), new Error(s);
            }
            const { message: i } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NO_MATCHING_KEY", `${this.name}: ${e}`);
            throw this.logger.error(i), new Error(i);
        }
        return t;
    }
    async persist() {
        await this.setDataStore(this.values);
    }
    async restore() {
        try {
            const e = await this.getDataStore();
            if (typeof e > "u" || !e.length) return;
            if (this.map.size) {
                const { message: t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("RESTORE_WILL_OVERRIDE", this.name);
                throw this.logger.error(t), new Error(t);
            }
            this.cached = e, this.logger.debug(`Successfully Restored value for ${this.name}`), this.logger.trace({
                type: "method",
                method: "restore",
                value: this.values
            });
        } catch (e) {
            this.logger.debug(`Failed to Restore value for ${this.name}`), this.logger.error(e);
        }
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
}
var zo = Object.defineProperty, Lo = (r, e, t)=>e in r ? zo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, p = (r, e, t)=>Lo(r, typeof e != "symbol" ? e + "" : e, t);
class Li {
    constructor(e, t){
        this.core = e, this.logger = t, p(this, "name", Mt), p(this, "version", Kt), p(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["default"]), p(this, "pairings"), p(this, "initialized", !1), p(this, "storagePrefix", B), p(this, "ignoredPayloadTypes", [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TYPE_1"]
        ]), p(this, "registeredMethods", []), p(this, "init", async ()=>{
            this.initialized || (await this.pairings.init(), await this.cleanup(), this.registerRelayerEvents(), this.registerExpirerEvents(), this.initialized = !0, this.logger.trace("Initialized"));
        }), p(this, "register", ({ methods: i })=>{
            this.isInitialized(), this.registeredMethods = [
                ...new Set([
                    ...this.registeredMethods,
                    ...i
                ])
            ];
        }), p(this, "create", async (i)=>{
            this.isInitialized();
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateRandomBytes32"])(), n = await this.core.crypto.setSymKey(s), o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcExpiry"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_MINUTES"]), a = {
                protocol: xt
            }, c = {
                topic: n,
                expiry: o,
                relay: a,
                active: !1,
                methods: i?.methods
            }, h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatUri"])({
                protocol: this.core.protocol,
                version: this.core.version,
                topic: n,
                symKey: s,
                relay: a,
                expiryTimestamp: o,
                methods: i?.methods
            });
            return this.events.emit(re.create, c), this.core.expirer.set(n, o), await this.pairings.set(n, c), await this.core.relayer.subscribe(n, {
                transportType: i?.transportType
            }), {
                topic: n,
                uri: h
            };
        }), p(this, "pair", async (i)=>{
            this.isInitialized();
            const s = this.core.eventClient.createEvent({
                properties: {
                    topic: i?.uri,
                    trace: [
                        G.pairing_started
                    ]
                }
            });
            this.isValidPair(i, s);
            const { topic: n, symKey: o, relay: a, expiryTimestamp: c, methods: h } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseUri"])(i.uri);
            s.props.properties.topic = n, s.addTrace(G.pairing_uri_validation_success), s.addTrace(G.pairing_uri_not_expired);
            let l;
            if (this.pairings.keys.includes(n)) {
                if (l = this.pairings.get(n), s.addTrace(G.existing_pairing), l.active) throw s.setError(Y.active_pairing_already_exists), new Error(`Pairing already exists: ${n}. Please try again with a new connection URI.`);
                s.addTrace(G.pairing_not_expired);
            }
            const d = c || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcExpiry"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_MINUTES"]), g = {
                topic: n,
                relay: a,
                expiry: d,
                active: !1,
                methods: h
            };
            this.core.expirer.set(n, d), await this.pairings.set(n, g), s.addTrace(G.store_new_pairing), i.activatePairing && await this.activate({
                topic: n
            }), this.events.emit(re.create, g), s.addTrace(G.emit_inactive_pairing), this.core.crypto.keychain.has(n) || await this.core.crypto.setSymKey(o, n), s.addTrace(G.subscribing_pairing_topic);
            try {
                await this.core.relayer.confirmOnlineStateOrThrow();
            } catch  {
                s.setError(Y.no_internet_connection);
            }
            try {
                await this.core.relayer.subscribe(n, {
                    relay: a
                });
            } catch (_) {
                throw s.setError(Y.subscribe_pairing_topic_failure), _;
            }
            return s.addTrace(G.subscribe_pairing_topic_success), g;
        }), p(this, "activate", async ({ topic: i })=>{
            this.isInitialized();
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcExpiry"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_MINUTES"]);
            this.core.expirer.set(i, s), await this.pairings.update(i, {
                active: !0,
                expiry: s
            });
        }), p(this, "ping", async (i)=>{
            this.isInitialized(), await this.isValidPing(i), this.logger.warn("ping() is deprecated and will be removed in the next major release.");
            const { topic: s } = i;
            if (this.pairings.keys.includes(s)) {
                const n = await this.sendRequest(s, "wc_pairingPing", {}), { done: o, resolve: a, reject: c } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createDelayedPromise"])();
                this.events.once((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["engineEvent"])("pairing_ping", n), ({ error: h })=>{
                    h ? c(h) : a();
                }), await o();
            }
        }), p(this, "updateExpiry", async ({ topic: i, expiry: s })=>{
            this.isInitialized(), await this.pairings.update(i, {
                expiry: s
            });
        }), p(this, "updateMetadata", async ({ topic: i, metadata: s })=>{
            this.isInitialized(), await this.pairings.update(i, {
                peerMetadata: s
            });
        }), p(this, "getPairings", ()=>(this.isInitialized(), this.pairings.values)), p(this, "disconnect", async (i)=>{
            this.isInitialized(), await this.isValidDisconnect(i);
            const { topic: s } = i;
            this.pairings.keys.includes(s) && (await this.sendRequest(s, "wc_pairingDelete", (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSdkError"])("USER_DISCONNECTED")), await this.deletePairing(s));
        }), p(this, "formatUriFromPairing", (i)=>{
            this.isInitialized();
            const { topic: s, relay: n, expiry: o, methods: a } = i, c = this.core.crypto.keychain.get(s);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatUri"])({
                protocol: this.core.protocol,
                version: this.core.version,
                topic: s,
                symKey: c,
                relay: n,
                expiryTimestamp: o,
                methods: a
            });
        }), p(this, "sendRequest", async (i, s, n)=>{
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatJsonRpcRequest"])(s, n), a = await this.core.crypto.encode(i, o), c = se[s].req;
            return this.core.history.set(i, o), this.core.relayer.publish(i, a, c), o.id;
        }), p(this, "sendResult", async (i, s, n)=>{
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatJsonRpcResult"])(i, n), a = await this.core.crypto.encode(s, o), c = (await this.core.history.get(s, i)).request.method, h = se[c].res;
            await this.core.relayer.publish(s, a, h), await this.core.history.resolve(o);
        }), p(this, "sendError", async (i, s, n)=>{
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatJsonRpcError"])(i, n), a = await this.core.crypto.encode(s, o), c = (await this.core.history.get(s, i)).request.method, h = se[c] ? se[c].res : se.unregistered_method.res;
            await this.core.relayer.publish(s, a, h), await this.core.history.resolve(o);
        }), p(this, "deletePairing", async (i, s)=>{
            await this.core.relayer.unsubscribe(i), await Promise.all([
                this.pairings.delete(i, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSdkError"])("USER_DISCONNECTED")),
                this.core.crypto.deleteSymKey(i),
                s ? Promise.resolve() : this.core.expirer.del(i)
            ]);
        }), p(this, "cleanup", async ()=>{
            const i = this.pairings.getAll().filter((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isExpired"])(s.expiry));
            await Promise.all(i.map((s)=>this.deletePairing(s.topic)));
        }), p(this, "onRelayEventRequest", async (i)=>{
            const { topic: s, payload: n } = i;
            switch(n.method){
                case "wc_pairingPing":
                    return await this.onPairingPingRequest(s, n);
                case "wc_pairingDelete":
                    return await this.onPairingDeleteRequest(s, n);
                default:
                    return await this.onUnknownRpcMethodRequest(s, n);
            }
        }), p(this, "onRelayEventResponse", async (i)=>{
            const { topic: s, payload: n } = i, o = (await this.core.history.get(s, n.id)).request.method;
            switch(o){
                case "wc_pairingPing":
                    return this.onPairingPingResponse(s, n);
                default:
                    return this.onUnknownRpcMethodResponse(o);
            }
        }), p(this, "onPairingPingRequest", async (i, s)=>{
            const { id: n } = s;
            try {
                this.isValidPing({
                    topic: i
                }), await this.sendResult(n, i, !0), this.events.emit(re.ping, {
                    id: n,
                    topic: i
                });
            } catch (o) {
                await this.sendError(n, i, o), this.logger.error(o);
            }
        }), p(this, "onPairingPingResponse", (i, s)=>{
            const { id: n } = s;
            setTimeout(()=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcResult"])(s) ? this.events.emit((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["engineEvent"])("pairing_ping", n), {}) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcError"])(s) && this.events.emit((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["engineEvent"])("pairing_ping", n), {
                    error: s.error
                });
            }, 500);
        }), p(this, "onPairingDeleteRequest", async (i, s)=>{
            const { id: n } = s;
            try {
                this.isValidDisconnect({
                    topic: i
                }), await this.deletePairing(i), this.events.emit(re.delete, {
                    id: n,
                    topic: i
                });
            } catch (o) {
                await this.sendError(n, i, o), this.logger.error(o);
            }
        }), p(this, "onUnknownRpcMethodRequest", async (i, s)=>{
            const { id: n, method: o } = s;
            try {
                if (this.registeredMethods.includes(o)) return;
                const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSdkError"])("WC_METHOD_UNSUPPORTED", o);
                await this.sendError(n, i, a), this.logger.error(a);
            } catch (a) {
                await this.sendError(n, i, a), this.logger.error(a);
            }
        }), p(this, "onUnknownRpcMethodResponse", (i)=>{
            this.registeredMethods.includes(i) || this.logger.error((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSdkError"])("WC_METHOD_UNSUPPORTED", i));
        }), p(this, "isValidPair", (i, s)=>{
            var n;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidParams"])(i)) {
                const { message: a } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", `pair() params: ${i}`);
                throw s.setError(Y.malformed_pairing_uri), new Error(a);
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidUrl"])(i.uri)) {
                const { message: a } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", `pair() uri: ${i.uri}`);
                throw s.setError(Y.malformed_pairing_uri), new Error(a);
            }
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseUri"])(i?.uri);
            if (!((n = o?.relay) != null && n.protocol)) {
                const { message: a } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", "pair() uri#relay-protocol");
                throw s.setError(Y.malformed_pairing_uri), new Error(a);
            }
            if (!(o != null && o.symKey)) {
                const { message: a } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", "pair() uri#symKey");
                throw s.setError(Y.malformed_pairing_uri), new Error(a);
            }
            if (o != null && o.expiryTimestamp && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(o?.expiryTimestamp) < Date.now()) {
                s.setError(Y.pairing_expired);
                const { message: a } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("EXPIRED", "pair() URI has expired. Please try again with a new connection URI.");
                throw new Error(a);
            }
        }), p(this, "isValidPing", async (i)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidParams"])(i)) {
                const { message: n } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", `ping() params: ${i}`);
                throw new Error(n);
            }
            const { topic: s } = i;
            await this.isValidPairingTopic(s);
        }), p(this, "isValidDisconnect", async (i)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidParams"])(i)) {
                const { message: n } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", `disconnect() params: ${i}`);
                throw new Error(n);
            }
            const { topic: s } = i;
            await this.isValidPairingTopic(s);
        }), p(this, "isValidPairingTopic", async (i)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidString"])(i, !1)) {
                const { message: s } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("MISSING_OR_INVALID", `pairing topic should be a string: ${i}`);
                throw new Error(s);
            }
            if (!this.pairings.keys.includes(i)) {
                const { message: s } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NO_MATCHING_KEY", `pairing topic doesn't exist: ${i}`);
                throw new Error(s);
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isExpired"])(this.pairings.get(i).expiry)) {
                await this.deletePairing(i);
                const { message: s } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("EXPIRED", `pairing topic: ${i}`);
                throw new Error(s);
            }
        }), this.core = e, this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name), this.pairings = new zi(this.core, this.logger, this.name, this.storagePrefix);
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
    registerRelayerEvents() {
        this.core.relayer.on(C.message, async (e)=>{
            const { topic: t, message: i, transportType: s } = e;
            if (this.pairings.keys.includes(t) && s !== Q.link_mode && !this.ignoredPayloadTypes.includes(this.core.crypto.getPayloadType(i))) try {
                const n = await this.core.crypto.decode(t, i);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcRequest"])(n) ? (this.core.history.set(t, n), await this.onRelayEventRequest({
                    topic: t,
                    payload: n
                })) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcResponse"])(n) && (await this.core.history.resolve(n), await this.onRelayEventResponse({
                    topic: t,
                    payload: n
                }), this.core.history.delete(t, n.id)), await this.core.relayer.messages.ack(t, i);
            } catch (n) {
                this.logger.error(n);
            }
        });
    }
    registerExpirerEvents() {
        this.core.expirer.on(M.expired, async (e)=>{
            const { topic: t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseExpirerTarget"])(e.target);
            t && this.pairings.keys.includes(t) && (await this.deletePairing(t, !0), this.events.emit(re.expire, {
                topic: t
            }));
        });
    }
}
var ko = Object.defineProperty, jo = (r, e, t)=>e in r ? ko(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, O = (r, e, t)=>jo(r, typeof e != "symbol" ? e + "" : e, t);
class ki extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IJsonRpcHistory"] {
    constructor(e, t){
        super(e, t), this.core = e, this.logger = t, O(this, "records", new Map), O(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]), O(this, "name", Bt), O(this, "version", Vt), O(this, "cached", []), O(this, "initialized", !1), O(this, "storagePrefix", B), O(this, "init", async ()=>{
            this.initialized || (this.logger.trace("Initialized"), await this.restore(), this.cached.forEach((i)=>this.records.set(i.id, i)), this.cached = [], this.registerEventListeners(), this.initialized = !0);
        }), O(this, "set", (i, s, n)=>{
            if (this.isInitialized(), this.logger.debug("Setting JSON-RPC request history record"), this.logger.trace({
                type: "method",
                method: "set",
                topic: i,
                request: s,
                chainId: n
            }), this.records.has(s.id)) return;
            const o = {
                id: s.id,
                topic: i,
                request: {
                    method: s.method,
                    params: s.params || null
                },
                chainId: n,
                expiry: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calcExpiry"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THIRTY_DAYS"])
            };
            this.records.set(o.id, o), this.persist(), this.events.emit(F.created, o);
        }), O(this, "resolve", async (i)=>{
            if (this.isInitialized(), this.logger.debug("Updating JSON-RPC response history record"), this.logger.trace({
                type: "method",
                method: "update",
                response: i
            }), !this.records.has(i.id)) return;
            const s = await this.getRecord(i.id);
            typeof s.response > "u" && (s.response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$validators$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isJsonRpcError"])(i) ? {
                error: i.error
            } : {
                result: i.result
            }, this.records.set(s.id, s), this.persist(), this.events.emit(F.updated, s));
        }), O(this, "get", async (i, s)=>(this.isInitialized(), this.logger.debug("Getting record"), this.logger.trace({
                type: "method",
                method: "get",
                topic: i,
                id: s
            }), await this.getRecord(s))), O(this, "delete", (i, s)=>{
            this.isInitialized(), this.logger.debug("Deleting record"), this.logger.trace({
                type: "method",
                method: "delete",
                id: s
            }), this.values.forEach((n)=>{
                if (n.topic === i) {
                    if (typeof s < "u" && n.id !== s) return;
                    this.records.delete(n.id), this.events.emit(F.deleted, n);
                }
            }), this.persist();
        }), O(this, "exists", async (i, s)=>(this.isInitialized(), this.records.has(s) ? (await this.getRecord(s)).topic === i : !1)), O(this, "on", (i, s)=>{
            this.events.on(i, s);
        }), O(this, "once", (i, s)=>{
            this.events.once(i, s);
        }), O(this, "off", (i, s)=>{
            this.events.off(i, s);
        }), O(this, "removeListener", (i, s)=>{
            this.events.removeListener(i, s);
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name);
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get storageKey() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
    }
    get size() {
        return this.records.size;
    }
    get keys() {
        return Array.from(this.records.keys());
    }
    get values() {
        return Array.from(this.records.values());
    }
    get pending() {
        const e = [];
        return this.values.forEach((t)=>{
            if (typeof t.response < "u") return;
            const i = {
                topic: t.topic,
                request: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$jsonrpc$2d$utils$2f$dist$2f$esm$2f$format$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatJsonRpcRequest"])(t.request.method, t.request.params, t.id),
                chainId: t.chainId
            };
            return e.push(i);
        }), e;
    }
    async setJsonRpcRecords(e) {
        await this.core.storage.setItem(this.storageKey, e);
    }
    async getJsonRpcRecords() {
        return await this.core.storage.getItem(this.storageKey);
    }
    getRecord(e) {
        this.isInitialized();
        const t = this.records.get(e);
        if (!t) {
            const { message: i } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NO_MATCHING_KEY", `${this.name}: ${e}`);
            throw new Error(i);
        }
        return t;
    }
    async persist() {
        await this.setJsonRpcRecords(this.values), this.events.emit(F.sync);
    }
    async restore() {
        try {
            const e = await this.getJsonRpcRecords();
            if (typeof e > "u" || !e.length) return;
            if (this.records.size) {
                const { message: t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("RESTORE_WILL_OVERRIDE", this.name);
                throw this.logger.error(t), new Error(t);
            }
            this.cached = e, this.logger.debug(`Successfully Restored records for ${this.name}`), this.logger.trace({
                type: "method",
                method: "restore",
                records: this.values
            });
        } catch (e) {
            this.logger.debug(`Failed to Restore records for ${this.name}`), this.logger.error(e);
        }
    }
    registerEventListeners() {
        this.events.on(F.created, (e)=>{
            const t = F.created;
            this.logger.info(`Emitting ${t}`), this.logger.debug({
                type: "event",
                event: t,
                record: e
            });
        }), this.events.on(F.updated, (e)=>{
            const t = F.updated;
            this.logger.info(`Emitting ${t}`), this.logger.debug({
                type: "event",
                event: t,
                record: e
            });
        }), this.events.on(F.deleted, (e)=>{
            const t = F.deleted;
            this.logger.info(`Emitting ${t}`), this.logger.debug({
                type: "event",
                event: t,
                record: e
            });
        }), this.core.heartbeat.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HEARTBEAT_EVENTS"].pulse, ()=>{
            this.cleanup();
        });
    }
    cleanup() {
        try {
            this.isInitialized();
            let e = !1;
            this.records.forEach((t)=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(t.expiry || 0) - Date.now() <= 0 && (this.logger.info(`Deleting expired history log: ${t.id}`), this.records.delete(t.id), this.events.emit(F.deleted, t, !1), e = !0);
            }), e && this.persist();
        } catch (e) {
            this.logger.warn(e);
        }
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
}
var Uo = Object.defineProperty, Fo = (r, e, t)=>e in r ? Uo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, A = (r, e, t)=>Fo(r, typeof e != "symbol" ? e + "" : e, t);
class ji extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IExpirer"] {
    constructor(e, t){
        super(e, t), this.core = e, this.logger = t, A(this, "expirations", new Map), A(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]), A(this, "name", qt), A(this, "version", Gt), A(this, "cached", []), A(this, "initialized", !1), A(this, "storagePrefix", B), A(this, "init", async ()=>{
            this.initialized || (this.logger.trace("Initialized"), await this.restore(), this.cached.forEach((i)=>this.expirations.set(i.target, i)), this.cached = [], this.registerEventListeners(), this.initialized = !0);
        }), A(this, "has", (i)=>{
            try {
                const s = this.formatTarget(i);
                return typeof this.getExpiration(s) < "u";
            } catch  {
                return !1;
            }
        }), A(this, "set", (i, s)=>{
            this.isInitialized();
            const n = this.formatTarget(i), o = {
                target: n,
                expiry: s
            };
            this.expirations.set(n, o), this.checkExpiry(n, o), this.events.emit(M.created, {
                target: n,
                expiration: o
            });
        }), A(this, "get", (i)=>{
            this.isInitialized();
            const s = this.formatTarget(i);
            return this.getExpiration(s);
        }), A(this, "del", (i)=>{
            if (this.isInitialized(), this.has(i)) {
                const s = this.formatTarget(i), n = this.getExpiration(s);
                this.expirations.delete(s), this.events.emit(M.deleted, {
                    target: s,
                    expiration: n
                });
            }
        }), A(this, "on", (i, s)=>{
            this.events.on(i, s);
        }), A(this, "once", (i, s)=>{
            this.events.once(i, s);
        }), A(this, "off", (i, s)=>{
            this.events.off(i, s);
        }), A(this, "removeListener", (i, s)=>{
            this.events.removeListener(i, s);
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name);
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    get storageKey() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//" + this.name;
    }
    get length() {
        return this.expirations.size;
    }
    get keys() {
        return Array.from(this.expirations.keys());
    }
    get values() {
        return Array.from(this.expirations.values());
    }
    formatTarget(e) {
        if (typeof e == "string") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTopicTarget"])(e);
        if (typeof e == "number") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatIdTarget"])(e);
        const { message: t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("UNKNOWN_TYPE", `Target type: ${typeof e}`);
        throw new Error(t);
    }
    async setExpirations(e) {
        await this.core.storage.setItem(this.storageKey, e);
    }
    async getExpirations() {
        return await this.core.storage.getItem(this.storageKey);
    }
    async persist() {
        await this.setExpirations(this.values), this.events.emit(M.sync);
    }
    async restore() {
        try {
            const e = await this.getExpirations();
            if (typeof e > "u" || !e.length) return;
            if (this.expirations.size) {
                const { message: t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("RESTORE_WILL_OVERRIDE", this.name);
                throw this.logger.error(t), new Error(t);
            }
            this.cached = e, this.logger.debug(`Successfully Restored expirations for ${this.name}`), this.logger.trace({
                type: "method",
                method: "restore",
                expirations: this.values
            });
        } catch (e) {
            this.logger.debug(`Failed to Restore expirations for ${this.name}`), this.logger.error(e);
        }
    }
    getExpiration(e) {
        const t = this.expirations.get(e);
        if (!t) {
            const { message: i } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NO_MATCHING_KEY", `${this.name}: ${e}`);
            throw this.logger.warn(i), new Error(i);
        }
        return t;
    }
    checkExpiry(e, t) {
        const { expiry: i } = t;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(i) - Date.now() <= 0 && this.expire(e, t);
    }
    expire(e, t) {
        this.expirations.delete(e), this.events.emit(M.expired, {
            target: e,
            expiration: t
        });
    }
    checkExpirations() {
        this.core.relayer.connected && this.expirations.forEach((e, t)=>this.checkExpiry(t, e));
    }
    registerEventListeners() {
        this.core.heartbeat.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HEARTBEAT_EVENTS"].pulse, ()=>this.checkExpirations()), this.events.on(M.created, (e)=>{
            const t = M.created;
            this.logger.info(`Emitting ${t}`), this.logger.debug({
                type: "event",
                event: t,
                data: e
            }), this.persist();
        }), this.events.on(M.expired, (e)=>{
            const t = M.expired;
            this.logger.info(`Emitting ${t}`), this.logger.debug({
                type: "event",
                event: t,
                data: e
            }), this.persist();
        }), this.events.on(M.deleted, (e)=>{
            const t = M.deleted;
            this.logger.info(`Emitting ${t}`), this.logger.debug({
                type: "event",
                event: t,
                data: e
            }), this.persist();
        });
    }
    isInitialized() {
        if (!this.initialized) {
            const { message: e } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getInternalError"])("NOT_INITIALIZED", this.name);
            throw new Error(e);
        }
    }
}
var Mo = Object.defineProperty, Ko = (r, e, t)=>e in r ? Mo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, w = (r, e, t)=>Ko(r, typeof e != "symbol" ? e + "" : e, t);
class Ui extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IVerify"] {
    constructor(e, t, i){
        super(e, t, i), this.core = e, this.logger = t, this.store = i, w(this, "name", Wt), w(this, "abortController"), w(this, "isDevEnv"), w(this, "verifyUrlV3", Yt), w(this, "storagePrefix", B), w(this, "version", Le), w(this, "publicKey"), w(this, "fetchPromise"), w(this, "init", async ()=>{
            var s;
            this.isDevEnv || (this.publicKey = await this.store.getItem(this.storeKey), this.publicKey && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])((s = this.publicKey) == null ? void 0 : s.expiresAt) < Date.now() && (this.logger.debug("verify v2 public key expired"), await this.removePublicKey()));
        }), w(this, "register", async (s)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isBrowser"])() || this.isDevEnv) return;
            const n = window.location.origin, { id: o, decryptedId: a } = s, c = `${this.verifyUrlV3}/attestation?projectId=${this.core.projectId}&origin=${n}&id=${o}&decryptedId=${a}`;
            try {
                const h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$window$2d$getters$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocument"])(), l = this.startAbortTimer(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"] * 5), d = await new Promise((g, _)=>{
                    const u = ()=>{
                        window.removeEventListener("message", x), h.body.removeChild(b), _("attestation aborted");
                    };
                    this.abortController.signal.addEventListener("abort", u);
                    const b = h.createElement("iframe");
                    b.src = c, b.style.display = "none", b.addEventListener("error", u, {
                        signal: this.abortController.signal
                    });
                    const x = (I)=>{
                        if (I.data && typeof I.data == "string") try {
                            const D = JSON.parse(I.data);
                            if (D.type === "verify_attestation") {
                                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeJWT"])(D.attestation).payload.id !== o) return;
                                clearInterval(l), h.body.removeChild(b), this.abortController.signal.removeEventListener("abort", u), window.removeEventListener("message", x), g(D.attestation === null ? "" : D.attestation);
                            }
                        } catch (D) {
                            this.logger.warn(D);
                        }
                    };
                    h.body.appendChild(b), window.addEventListener("message", x, {
                        signal: this.abortController.signal
                    });
                });
                return this.logger.debug("jwt attestation", d), d;
            } catch (h) {
                this.logger.warn(h);
            }
            return "";
        }), w(this, "resolve", async (s)=>{
            if (this.isDevEnv) return "";
            const { attestationId: n, hash: o, encryptedId: a } = s;
            if (n === "") {
                this.logger.debug("resolve: attestationId is empty, skipping");
                return;
            }
            if (n) {
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$relay$2d$auth$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeJWT"])(n).payload.id !== a) return;
                const h = await this.isValidJwtAttestation(n);
                if (h) {
                    if (!h.isVerified) {
                        this.logger.warn("resolve: jwt attestation: origin url not verified");
                        return;
                    }
                    return h;
                }
            }
            if (!o) return;
            const c = this.getVerifyUrl(s?.verifyUrl);
            return this.fetchAttestation(o, c);
        }), w(this, "fetchAttestation", async (s, n)=>{
            this.logger.debug(`resolving attestation: ${s} from url: ${n}`);
            const o = this.startAbortTimer(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ONE_SECOND"] * 5), a = await fetch(`${n}/attestation/${s}?v2Supported=true`, {
                signal: this.abortController.signal
            });
            return clearTimeout(o), a.status === 200 ? await a.json() : void 0;
        }), w(this, "getVerifyUrl", (s)=>{
            let n = s || ue;
            return Jt.includes(n) || (this.logger.info(`verify url: ${n}, not included in trusted list, assigning default: ${ue}`), n = ue), n;
        }), w(this, "fetchPublicKey", async ()=>{
            try {
                this.logger.debug(`fetching public key from: ${this.verifyUrlV3}`);
                const s = this.startAbortTimer(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FIVE_SECONDS"]), n = await fetch(`${this.verifyUrlV3}/public-key`, {
                    signal: this.abortController.signal
                });
                return clearTimeout(s), await n.json();
            } catch (s) {
                this.logger.warn(s);
            }
        }), w(this, "persistPublicKey", async (s)=>{
            this.logger.debug("persisting public key to local storage", s), await this.store.setItem(this.storeKey, s), this.publicKey = s;
        }), w(this, "removePublicKey", async ()=>{
            this.logger.debug("removing verify v2 public key from storage"), await this.store.removeItem(this.storeKey), this.publicKey = void 0;
        }), w(this, "isValidJwtAttestation", async (s)=>{
            const n = await this.getPublicKey();
            try {
                if (n) return this.validateAttestation(s, n);
            } catch (a) {
                this.logger.error(a), this.logger.warn("error validating attestation");
            }
            const o = await this.fetchAndPersistPublicKey();
            try {
                if (o) return this.validateAttestation(s, o);
            } catch (a) {
                this.logger.error(a), this.logger.warn("error validating attestation");
            }
        }), w(this, "getPublicKey", async ()=>this.publicKey ? this.publicKey : await this.fetchAndPersistPublicKey()), w(this, "fetchAndPersistPublicKey", async ()=>{
            if (this.fetchPromise) return await this.fetchPromise, this.publicKey;
            this.fetchPromise = new Promise(async (n)=>{
                const o = await this.fetchPublicKey();
                o && (await this.persistPublicKey(o), n(o));
            });
            const s = await this.fetchPromise;
            return this.fetchPromise = void 0, s;
        }), w(this, "validateAttestation", (s, n)=>{
            const o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["verifyP256Jwt"])(s, n.publicKey), a = {
                hasExpired: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(o.exp) < Date.now(),
                payload: o
            };
            if (a.hasExpired) throw this.logger.warn("resolve: jwt attestation expired"), new Error("JWT attestation expired");
            return {
                origin: a.payload.origin,
                isScam: a.payload.isScam,
                isVerified: a.payload.isVerified
            };
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.name), this.abortController = new AbortController, this.isDevEnv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTestRun"])(), this.init();
    }
    get storeKey() {
        return this.storagePrefix + this.version + this.core.customStoragePrefix + "//verify:public:key";
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    startAbortTimer(e) {
        return this.abortController = new AbortController, setTimeout(()=>this.abortController.abort(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toMiliseconds"])(e));
    }
}
var Bo = Object.defineProperty, Vo = (r, e, t)=>e in r ? Bo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, Fi = (r, e, t)=>Vo(r, typeof e != "symbol" ? e + "" : e, t);
class Mi extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IEchoClient"] {
    constructor(e, t){
        super(e, t), this.projectId = e, this.logger = t, Fi(this, "context", Xt), Fi(this, "registerDeviceToken", async (i)=>{
            const { clientId: s, token: n, notificationType: o, enableEncrypted: a = !1 } = i, c = `${Zt}/${this.projectId}/clients`;
            await fetch(c, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    client_id: s,
                    type: o,
                    token: n,
                    always_raw: a
                })
            });
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.context);
    }
}
var qo = Object.defineProperty, Ki = Object.getOwnPropertySymbols, Go = Object.prototype.hasOwnProperty, Wo = Object.prototype.propertyIsEnumerable, Ze = (r, e, t)=>e in r ? qo(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, be = (r, e)=>{
    for(var t in e || (e = {}))Go.call(e, t) && Ze(r, t, e[t]);
    if (Ki) for (var t of Ki(e))Wo.call(e, t) && Ze(r, t, e[t]);
    return r;
}, E = (r, e, t)=>Ze(r, typeof e != "symbol" ? e + "" : e, t);
class Bi extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IEventClient"] {
    constructor(e, t, i = !0){
        super(e, t, i), this.core = e, this.logger = t, E(this, "context", ei), E(this, "storagePrefix", B), E(this, "storageVersion", Qt), E(this, "events", new Map), E(this, "shouldPersist", !1), E(this, "init", async ()=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isTestRun"])()) try {
                const s = {
                    eventId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uuidv4"])(),
                    timestamp: Date.now(),
                    domain: this.getAppDomain(),
                    props: {
                        event: "INIT",
                        type: "",
                        properties: {
                            client_id: await this.core.crypto.getClientId(),
                            user_agent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatUA"])(this.core.relayer.protocol, this.core.relayer.version, _e)
                        }
                    }
                };
                await this.sendEvent([
                    s
                ]);
            } catch (s) {
                this.logger.warn(s);
            }
        }), E(this, "createEvent", (s)=>{
            const { event: n = "ERROR", type: o = "", properties: { topic: a, trace: c } } = s, h = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uuidv4"])(), l = this.core.projectId || "", d = Date.now(), g = be({
                eventId: h,
                timestamp: d,
                props: {
                    event: n,
                    type: o,
                    properties: {
                        topic: a,
                        trace: c
                    }
                },
                bundleId: l,
                domain: this.getAppDomain()
            }, this.setMethods(h));
            return this.telemetryEnabled && (this.events.set(h, g), this.shouldPersist = !0), g;
        }), E(this, "getEvent", (s)=>{
            const { eventId: n, topic: o } = s;
            if (n) return this.events.get(n);
            const a = Array.from(this.events.values()).find((c)=>c.props.properties.topic === o);
            if (a) return be(be({}, a), this.setMethods(a.eventId));
        }), E(this, "deleteEvent", (s)=>{
            const { eventId: n } = s;
            this.events.delete(n), this.shouldPersist = !0;
        }), E(this, "setEventListeners", ()=>{
            this.core.heartbeat.on(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HEARTBEAT_EVENTS"].pulse, async ()=>{
                this.shouldPersist && await this.persist(), this.events.forEach((s)=>{
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromMiliseconds"])(Date.now()) - (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$time$2f$dist$2f$cjs$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fromMiliseconds"])(s.timestamp) > ti && (this.events.delete(s.eventId), this.shouldPersist = !0);
                });
            });
        }), E(this, "setMethods", (s)=>({
                addTrace: (n)=>this.addTrace(s, n),
                setError: (n)=>this.setError(s, n)
            })), E(this, "addTrace", (s, n)=>{
            const o = this.events.get(s);
            o && (o.props.properties.trace.push(n), this.events.set(s, o), this.shouldPersist = !0);
        }), E(this, "setError", (s, n)=>{
            const o = this.events.get(s);
            o && (o.props.type = n, o.timestamp = Date.now(), this.events.set(s, o), this.shouldPersist = !0);
        }), E(this, "persist", async ()=>{
            await this.core.storage.setItem(this.storageKey, Array.from(this.events.values())), this.shouldPersist = !1;
        }), E(this, "restore", async ()=>{
            try {
                const s = await this.core.storage.getItem(this.storageKey) || [];
                if (!s.length) return;
                s.forEach((n)=>{
                    this.events.set(n.eventId, be(be({}, n), this.setMethods(n.eventId)));
                });
            } catch (s) {
                this.logger.warn(s);
            }
        }), E(this, "submit", async ()=>{
            if (!this.telemetryEnabled || this.events.size === 0) return;
            const s = [];
            for (const [n, o] of this.events)o.props.type && s.push(o);
            if (s.length !== 0) try {
                if ((await this.sendEvent(s)).ok) for (const n of s)this.events.delete(n.eventId), this.shouldPersist = !0;
            } catch (n) {
                this.logger.warn(n);
            }
        }), E(this, "sendEvent", async (s)=>{
            const n = this.getAppDomain() ? "" : "&sp=desktop";
            return await fetch(`${ii}?projectId=${this.core.projectId}&st=events_sdk&sv=js-${_e}${n}`, {
                method: "POST",
                body: JSON.stringify(s)
            });
        }), E(this, "getAppDomain", ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$utils$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAppMetadata"])().url), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(t, this.context), this.telemetryEnabled = i, i ? this.restore().then(async ()=>{
            await this.submit(), this.setEventListeners();
        }) : this.persist();
    }
    get storageKey() {
        return this.storagePrefix + this.storageVersion + this.core.customStoragePrefix + "//" + this.context;
    }
}
var Ho = Object.defineProperty, Vi = Object.getOwnPropertySymbols, Yo = Object.prototype.hasOwnProperty, Jo = Object.prototype.propertyIsEnumerable, Qe = (r, e, t)=>e in r ? Ho(r, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : r[e] = t, qi = (r, e)=>{
    for(var t in e || (e = {}))Yo.call(e, t) && Qe(r, t, e[t]);
    if (Vi) for (var t of Vi(e))Jo.call(e, t) && Qe(r, t, e[t]);
    return r;
}, v = (r, e, t)=>Qe(r, typeof e != "symbol" ? e + "" : e, t);
class Te extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reown$2f$appkit$2d$controllers$2f$node_modules$2f40$walletconnect$2f$types$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ICore"] {
    constructor(e){
        var t;
        super(e), v(this, "protocol", ze), v(this, "version", Le), v(this, "name", he), v(this, "relayUrl"), v(this, "projectId"), v(this, "customStoragePrefix"), v(this, "events", new __TURBOPACK__imported__module__$5b$externals$5d2f$events__$5b$external$5d$__$28$events$2c$__cjs$29$__["EventEmitter"]), v(this, "logger"), v(this, "heartbeat"), v(this, "relayer"), v(this, "crypto"), v(this, "storage"), v(this, "history"), v(this, "expirer"), v(this, "pairing"), v(this, "verify"), v(this, "echoClient"), v(this, "linkModeSupportedApps"), v(this, "eventClient"), v(this, "initialized", !1), v(this, "logChunkController"), v(this, "on", (a, c)=>this.events.on(a, c)), v(this, "once", (a, c)=>this.events.once(a, c)), v(this, "off", (a, c)=>this.events.off(a, c)), v(this, "removeListener", (a, c)=>this.events.removeListener(a, c)), v(this, "dispatchEnvelope", ({ topic: a, message: c, sessionExists: h })=>{
            if (!a || !c) return;
            const l = {
                topic: a,
                message: c,
                publishedAt: Date.now(),
                transportType: Q.link_mode
            };
            this.relayer.onLinkMessageEvent(l, {
                sessionExists: h
            });
        });
        const i = this.getGlobalCore(e?.customStoragePrefix);
        if (i) try {
            return this.customStoragePrefix = i.customStoragePrefix, this.logger = i.logger, this.heartbeat = i.heartbeat, this.crypto = i.crypto, this.history = i.history, this.expirer = i.expirer, this.storage = i.storage, this.relayer = i.relayer, this.pairing = i.pairing, this.verify = i.verify, this.echoClient = i.echoClient, this.linkModeSupportedApps = i.linkModeSupportedApps, this.eventClient = i.eventClient, this.initialized = i.initialized, this.logChunkController = i.logChunkController, i;
        } catch (a) {
            console.warn("Failed to copy global core", a);
        }
        this.projectId = e?.projectId, this.relayUrl = e?.relayUrl || Ue, this.customStoragePrefix = e != null && e.customStoragePrefix ? `:${e.customStoragePrefix}` : "";
        const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDefaultLoggerOptions"])({
            level: typeof e?.logger == "string" && e.logger ? e.logger : Et.logger,
            name: he
        }), { logger: n, chunkLoggerController: o } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generatePlatformLogger"])({
            opts: s,
            maxSizeInBytes: e?.maxLogBlobSizeInBytes,
            loggerOverride: e?.logger
        });
        this.logChunkController = o, (t = this.logChunkController) != null && t.downloadLogsBlobInBrowser && (window.downloadLogsBlobInBrowser = async ()=>{
            var a, c;
            (a = this.logChunkController) != null && a.downloadLogsBlobInBrowser && ((c = this.logChunkController) == null || c.downloadLogsBlobInBrowser({
                clientId: await this.crypto.getClientId()
            }));
        }), this.logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["generateChildLogger"])(n, this.name), this.heartbeat = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$heartbeat$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HeartBeat"], this.crypto = new vi(this, this.logger, e?.keychain), this.history = new ki(this, this.logger), this.expirer = new ji(this, this.logger), this.storage = e != null && e.storage ? e.storage : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$keyvaluestorage$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](qi(qi({}, It), e?.storageOptions)), this.relayer = new Si({
            core: this,
            logger: this.logger,
            relayUrl: this.relayUrl,
            projectId: this.projectId
        }), this.pairing = new Li(this, this.logger), this.verify = new Ui(this, this.logger, this.storage), this.echoClient = new Mi(this.projectId || "", this.logger), this.linkModeSupportedApps = [], this.eventClient = new Bi(this, this.logger, e?.telemetryEnabled), this.setGlobalCore(this);
    }
    static async init(e) {
        const t = new Te(e);
        await t.initialize();
        const i = await t.crypto.getClientId();
        return await t.storage.setItem(jt, i), t;
    }
    get context() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$walletconnect$2f$logger$2f$dist$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getLoggerContext"])(this.logger);
    }
    async start() {
        this.initialized || await this.initialize();
    }
    async getLogsBlob() {
        var e;
        return (e = this.logChunkController) == null ? void 0 : e.logsToBlob({
            clientId: await this.crypto.getClientId()
        });
    }
    async addLinkModeSupportedApp(e) {
        this.linkModeSupportedApps.includes(e) || (this.linkModeSupportedApps.push(e), await this.storage.setItem(Fe, this.linkModeSupportedApps));
    }
    async initialize() {
        this.logger.trace("Initialized");
        try {
            await this.crypto.init(), await this.history.init(), await this.expirer.init(), await this.relayer.init(), await this.heartbeat.init(), await this.pairing.init(), this.linkModeSupportedApps = await this.storage.getItem(Fe) || [], this.initialized = !0, this.logger.info("Core Initialization Success");
        } catch (e) {
            throw this.logger.warn(`Core Initialization Failure at epoch ${Date.now()}`, e), this.logger.error(e.message), e;
        }
    }
    getGlobalCore(e = "") {
        try {
            if (this.isGlobalCoreDisabled()) return;
            const t = `_walletConnectCore_${e}`, i = `${t}_count`;
            return globalThis[i] = (globalThis[i] || 0) + 1, globalThis[i] > 1 && console.warn(`WalletConnect Core is already initialized. This is probably a mistake and can lead to unexpected behavior. Init() was called ${globalThis[i]} times.`), globalThis[t];
        } catch (t) {
            console.warn("Failed to get global WalletConnect core", t);
            return;
        }
    }
    setGlobalCore(e) {
        var t;
        try {
            if (this.isGlobalCoreDisabled()) return;
            const i = `_walletConnectCore_${((t = e.opts) == null ? void 0 : t.customStoragePrefix) || ""}`;
            globalThis[i] = e;
        } catch (i) {
            console.warn("Failed to set global WalletConnect core", i);
        }
    }
    isGlobalCoreDisabled() {
        try {
            return typeof process < "u" && process.env.DISABLE_GLOBAL_CORE === "true";
        } catch  {
            return !0;
        }
    }
}
const Xo = Te;
;
 //# sourceMappingURL=index.es.js.map
}),
];

//# sourceMappingURL=35f47_%40walletconnect_core_dist_index_es_f994c858.js.map