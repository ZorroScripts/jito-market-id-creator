"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RayLiqPoolv4 = exports.walletconn = exports.wallet = exports.tokenAddress = exports.tipAcct = exports.connection = exports.rpc = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const anchor_1 = require("@project-serum/anchor");
exports.rpc = ''; // ENTER YOUR RPC
exports.connection = new web3_js_1.Connection(exports.rpc, 'confirmed');
// List of tip accounts
const tiping_addresses = [
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
    "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
    "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
    "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
    "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"
];
function getRandomTipAccount() {
    const randomIndex = Math.floor(Math.random() * tiping_addresses.length);
    return new web3_js_1.PublicKey(tiping_addresses[randomIndex]);
}
exports.tipAcct = getRandomTipAccount();
exports.tokenAddress = ''; //Put your token address here!!
exports.wallet = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode('' // PRIV KEY OF POOL CREATOR
));
exports.walletconn = new anchor_1.Wallet(exports.wallet);
exports.RayLiqPoolv4 = new web3_js_1.PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
