"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geyserClient = exports.searcherClients = exports.searcherClient = exports.privateKey = void 0;
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("./config");
const jito_ts_1 = require("jito-ts");
const searcher_js_1 = require("jito-ts/dist/sdk/block-engine/searcher.js");
const fs = __importStar(require("fs"));
const BLOCK_ENGINE_URLS = config_1.config.get('block_engine_urls');
const AUTH_KEYPAIR_PATH = config_1.config.get('auth_keypair_path');
const GEYSER_URL = config_1.config.get('geyser_url');
const GEYSER_ACCESS_TOKEN = config_1.config.get('geyser_access_token');
const decodedKey = new Uint8Array(JSON.parse(fs.readFileSync(AUTH_KEYPAIR_PATH).toString()));
const keypair = web3_js_1.Keypair.fromSecretKey(decodedKey);
exports.privateKey = keypair;
const searcherClients = [];
exports.searcherClients = searcherClients;
for (const url of BLOCK_ENGINE_URLS) {
    const client = (0, searcher_js_1.searcherClient)(url, keypair, {
        'grpc.keepalive_timeout_ms': 4000,
    });
    searcherClients.push(client);
}
const geyserClient = (0, jito_ts_1.geyserClient)(GEYSER_URL, GEYSER_ACCESS_TOKEN, {
    'grpc.keepalive_timeout_ms': 4000,
});
exports.geyserClient = geyserClient;
// all bundles sent get automatically forwarded to the other regions.
// assuming the first block engine in the array is the closest one
const searcherClient = searcherClients[0];
exports.searcherClient = searcherClient;
