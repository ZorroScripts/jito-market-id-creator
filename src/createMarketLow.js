"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTx = exports.buildAndSendTx = exports.mkMrktLow = exports.createMarket = exports.MARKET_STATE_LAYOUT_V2 = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("../config");
const anchor_1 = require("@project-serum/anchor");
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const jitoPool_1 = require("./jitoPool");
const prompt = (0, prompt_sync_1.default)();
const bundledTxns = [];
const PROGRAMIDS = raydium_sdk_1.MAINNET_PROGRAM_ID;
const makeTxVersion = raydium_sdk_1.TxVersion.V0;
const addLookupTableInfo = raydium_sdk_1.LOOKUP_TABLE_CACHE;
function accountFlagsLayout(property = 'accountFlags') {
    const ACCOUNT_FLAGS_LAYOUT = new raydium_sdk_1.WideBits(property);
    ACCOUNT_FLAGS_LAYOUT.addBoolean('initialized');
    ACCOUNT_FLAGS_LAYOUT.addBoolean('market');
    ACCOUNT_FLAGS_LAYOUT.addBoolean('openOrders');
    ACCOUNT_FLAGS_LAYOUT.addBoolean('requestQueue');
    ACCOUNT_FLAGS_LAYOUT.addBoolean('eventQueue');
    ACCOUNT_FLAGS_LAYOUT.addBoolean('bids');
    ACCOUNT_FLAGS_LAYOUT.addBoolean('asks');
    return ACCOUNT_FLAGS_LAYOUT;
}
exports.MARKET_STATE_LAYOUT_V2 = (0, raydium_sdk_1.struct)([
    (0, raydium_sdk_1.blob)(5),
    accountFlagsLayout('accountFlags'),
    (0, raydium_sdk_1.publicKey)('ownAddress'),
    (0, raydium_sdk_1.u64)('vaultSignerNonce'),
    (0, raydium_sdk_1.publicKey)('baseMint'),
    (0, raydium_sdk_1.publicKey)('quoteMint'),
    (0, raydium_sdk_1.publicKey)('baseVault'),
    (0, raydium_sdk_1.u64)('baseDepositsTotal'),
    (0, raydium_sdk_1.u64)('baseFeesAccrued'),
    (0, raydium_sdk_1.publicKey)('quoteVault'),
    (0, raydium_sdk_1.u64)('quoteDepositsTotal'),
    (0, raydium_sdk_1.u64)('quoteFeesAccrued'),
    (0, raydium_sdk_1.u64)('quoteDustThreshold'),
    (0, raydium_sdk_1.publicKey)('requestQueue'),
    (0, raydium_sdk_1.publicKey)('eventQueue'),
    (0, raydium_sdk_1.publicKey)('bids'),
    (0, raydium_sdk_1.publicKey)('asks'),
    (0, raydium_sdk_1.u64)('baseLotSize'),
    (0, raydium_sdk_1.u64)('quoteLotSize'),
    (0, raydium_sdk_1.u64)('feeRateBps'),
    (0, raydium_sdk_1.u64)('referrerRebatesAccrued'),
    (0, raydium_sdk_1.blob)(7),
]);
function createMarket(input, jitoTip) {
    return __awaiter(this, void 0, void 0, function* () {
        // -------- step 1: make instructions --------
        const createMarketInstruments = yield makeCreateMarketInstructionSimple({
            connection: config_1.connection,
            wallet: input.wallet.publicKey,
            baseInfo: input.baseToken,
            quoteInfo: input.quoteToken,
            lotSize: 1, // default 1
            tickSize: 0.00001, // default 0.01
            dexProgramId: PROGRAMIDS.OPENBOOK_MARKET,
            makeTxVersion,
        });
        yield buildAndSendTx(createMarketInstruments.innerTransactions, jitoTip);
    });
}
exports.createMarket = createMarket;
function mkMrktLow() {
    return __awaiter(this, void 0, void 0, function* () {
        // Constants for the token
        const baseAddr = config_1.tokenAddress;
        const jitoTipAmtInput = '0.01';
        const jitoTipAmt = parseFloat(jitoTipAmtInput) * web3_js_1.LAMPORTS_PER_SOL;
        let myToken = new web3_js_1.PublicKey(baseAddr);
        let tokenInfo = yield (0, spl_token_1.getMint)(config_1.connection, myToken, 'finalized', raydium_sdk_1.TOKEN_PROGRAM_ID);
        const baseToken = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey(baseAddr), tokenInfo.decimals); // TOKEN
        const quoteToken = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'); // SOL
        console.log(`Creating market:`);
        yield createMarket({
            baseToken,
            quoteToken,
            wallet: config_1.wallet,
        }, jitoTipAmt).catch(error => {
            console.error('Error creating market:', error);
        });
    });
}
exports.mkMrktLow = mkMrktLow;
function buildAndSendTx(innerSimpleV0Transaction, jitoTip) {
    return __awaiter(this, void 0, void 0, function* () {
        const { blockhash } = yield config_1.connection.getLatestBlockhash('finalized');
        const willSendTx = yield (0, raydium_sdk_1.buildSimpleTransaction)({
            connection: config_1.connection,
            makeTxVersion,
            payer: config_1.wallet.publicKey,
            innerTransactions: innerSimpleV0Transaction,
            recentBlockhash: blockhash,
            addLookupTableInfo: addLookupTableInfo,
        });
        return yield sendTx(config_1.wallet, willSendTx, blockhash, jitoTip);
    });
}
exports.buildAndSendTx = buildAndSendTx;
function sendTx(payer, txs, blockhash, jitoTipAmt) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const iTx of txs) {
            if (iTx instanceof web3_js_1.VersionedTransaction) {
                iTx.sign([payer]);
                bundledTxns.push(iTx);
            }
        }
        const tipSwapIxn = web3_js_1.SystemProgram.transfer({
            fromPubkey: config_1.wallet.publicKey,
            toPubkey: config_1.tipAcct,
            lamports: BigInt(jitoTipAmt),
        });
        const message = new web3_js_1.TransactionMessage({
            payerKey: config_1.wallet.publicKey,
            recentBlockhash: blockhash,
            instructions: [tipSwapIxn],
        }).compileToV0Message();
        const versionedTx = new web3_js_1.VersionedTransaction(message);
        const serializedMsg = versionedTx.serialize();
        console.log("Txn size:", serializedMsg.length);
        versionedTx.sign([config_1.wallet]);
        bundledTxns.push(versionedTx);
        yield (0, jitoPool_1.sendBundle)(bundledTxns);
        bundledTxns.length = 0;
        return;
    });
}
exports.sendTx = sendTx;
function makeCreateMarketInstructionSimple({ connection, wallet, baseInfo, quoteInfo, lotSize, tickSize, dexProgramId, makeTxVersion, lookupTableCache, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const market = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: dexProgramId });
        const requestQueue = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: dexProgramId });
        const eventQueue = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: dexProgramId });
        const bids = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: dexProgramId });
        const asks = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: dexProgramId });
        const baseVault = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: raydium_sdk_1.TOKEN_PROGRAM_ID });
        const quoteVault = (0, raydium_sdk_1.generatePubKey)({ fromPublicKey: wallet, programId: raydium_sdk_1.TOKEN_PROGRAM_ID });
        const feeRateBps = 0;
        const quoteDustThreshold = new anchor_1.BN(100);
        function getVaultOwnerAndNonce() {
            const vaultSignerNonce = new anchor_1.BN(0);
            // eslint-disable-next-line no-constant-condition
            while (true) {
                try {
                    const vaultOwner = web3_js_1.PublicKey.createProgramAddressSync([market.publicKey.toBuffer(), vaultSignerNonce.toArrayLike(Buffer, 'le', 8)], dexProgramId);
                    return { vaultOwner, vaultSignerNonce };
                }
                catch (e) {
                    vaultSignerNonce.iaddn(1);
                    if (vaultSignerNonce.gt(new anchor_1.BN(25555)))
                        throw Error('find vault owner error');
                }
            }
        }
        const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce();
        const baseLotSize = new anchor_1.BN(Math.round(10 ** baseInfo.decimals * lotSize));
        const quoteLotSize = new anchor_1.BN(Math.round(lotSize * 10 ** quoteInfo.decimals * tickSize));
        if (baseLotSize.eq(raydium_sdk_1.ZERO))
            throw Error('lot size is too small');
        if (quoteLotSize.eq(raydium_sdk_1.ZERO))
            throw Error('tick size or lot size is too small');
        const ins = yield makeCreateMarketInstruction({
            connection,
            wallet,
            marketInfo: {
                programId: dexProgramId,
                id: market,
                baseMint: baseInfo.mint,
                quoteMint: quoteInfo.mint,
                baseVault,
                quoteVault,
                vaultOwner,
                requestQueue,
                eventQueue,
                bids,
                asks,
                feeRateBps,
                quoteDustThreshold,
                vaultSignerNonce,
                baseLotSize,
                quoteLotSize,
            },
        });
        return {
            address: ins.address,
            innerTransactions: yield (0, raydium_sdk_1.splitTxAndSigners)({
                connection,
                makeTxVersion,
                computeBudgetConfig: undefined,
                payer: wallet,
                innerTransaction: ins.innerTransactions,
                lookupTableCache,
            }),
        };
    });
}
function makeCreateMarketInstruction({ connection, wallet, marketInfo, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const ins1 = [];
        const accountLamports = yield connection.getMinimumBalanceForRentExemption(165);
        ins1.push(web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.baseVault.seed,
            newAccountPubkey: marketInfo.baseVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.quoteVault.seed,
            newAccountPubkey: marketInfo.quoteVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeAccountInstruction)(marketInfo.baseVault.publicKey, marketInfo.baseMint, marketInfo.vaultOwner), (0, spl_token_1.createInitializeAccountInstruction)(marketInfo.quoteVault.publicKey, marketInfo.quoteMint, marketInfo.vaultOwner));
        const ins2 = [];
        ins2.push(web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.id.seed,
            newAccountPubkey: marketInfo.id.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(exports.MARKET_STATE_LAYOUT_V2.span),
            space: exports.MARKET_STATE_LAYOUT_V2.span,
            programId: marketInfo.programId,
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.requestQueue.seed,
            newAccountPubkey: marketInfo.requestQueue.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(764), // CHANGE
            space: 764, // CHANGE
            programId: marketInfo.programId,
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.eventQueue.seed,
            newAccountPubkey: marketInfo.eventQueue.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(11308), // CHANGE
            space: 11308, // CHANGE
            programId: marketInfo.programId,
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.bids.seed,
            newAccountPubkey: marketInfo.bids.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(14524), // CHANGE
            space: 14524, // CHANGE
            programId: marketInfo.programId,
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: marketInfo.asks.seed,
            newAccountPubkey: marketInfo.asks.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(14524), // CHANGE
            space: 14524, // CHANGE
            programId: marketInfo.programId,
        }), yield initializeMarketInstruction({
            programId: marketInfo.programId,
            marketInfo: {
                id: marketInfo.id.publicKey,
                requestQueue: marketInfo.requestQueue.publicKey,
                eventQueue: marketInfo.eventQueue.publicKey,
                bids: marketInfo.bids.publicKey,
                asks: marketInfo.asks.publicKey,
                baseVault: marketInfo.baseVault.publicKey,
                quoteVault: marketInfo.quoteVault.publicKey,
                baseMint: marketInfo.baseMint,
                quoteMint: marketInfo.quoteMint,
                baseLotSize: marketInfo.baseLotSize,
                quoteLotSize: marketInfo.quoteLotSize,
                feeRateBps: marketInfo.feeRateBps,
                vaultSignerNonce: marketInfo.vaultSignerNonce,
                quoteDustThreshold: marketInfo.quoteDustThreshold,
            },
        }));
        return {
            address: {
                marketId: marketInfo.id.publicKey,
                requestQueue: marketInfo.requestQueue.publicKey,
                eventQueue: marketInfo.eventQueue.publicKey,
                bids: marketInfo.bids.publicKey,
                asks: marketInfo.asks.publicKey,
                baseVault: marketInfo.baseVault.publicKey,
                quoteVault: marketInfo.quoteVault.publicKey,
                baseMint: marketInfo.baseMint,
                quoteMint: marketInfo.quoteMint,
            },
            innerTransactions: [
                {
                    instructions: ins1,
                    signers: [],
                    instructionTypes: [
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.initAccount,
                        raydium_sdk_1.InstructionType.initAccount,
                    ],
                },
                {
                    instructions: ins2,
                    signers: [],
                    instructionTypes: [
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.initMarket,
                    ],
                },
            ],
        };
    });
}
function initializeMarketInstruction({ programId, marketInfo, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataLayout = (0, raydium_sdk_1.struct)([
            (0, raydium_sdk_1.u8)('version'),
            (0, raydium_sdk_1.u32)('instruction'),
            (0, raydium_sdk_1.u64)('baseLotSize'),
            (0, raydium_sdk_1.u64)('quoteLotSize'),
            (0, raydium_sdk_1.u16)('feeRateBps'),
            (0, raydium_sdk_1.u64)('vaultSignerNonce'),
            (0, raydium_sdk_1.u64)('quoteDustThreshold'),
        ]);
        const keys = [
            { pubkey: marketInfo.id, isSigner: false, isWritable: true },
            { pubkey: marketInfo.requestQueue, isSigner: false, isWritable: true },
            { pubkey: marketInfo.eventQueue, isSigner: false, isWritable: true },
            { pubkey: marketInfo.bids, isSigner: false, isWritable: true },
            { pubkey: marketInfo.asks, isSigner: false, isWritable: true },
            { pubkey: marketInfo.baseVault, isSigner: false, isWritable: true },
            { pubkey: marketInfo.quoteVault, isSigner: false, isWritable: true },
            { pubkey: marketInfo.baseMint, isSigner: false, isWritable: false },
            { pubkey: marketInfo.quoteMint, isSigner: false, isWritable: false },
            // Use a dummy address if using the new dex upgrade to save tx space.
            {
                pubkey: marketInfo.authority ? marketInfo.quoteMint : raydium_sdk_1.SYSVAR_RENT_PUBKEY,
                isSigner: false,
                isWritable: false,
            },
        ]
            .concat(marketInfo.authority ? { pubkey: marketInfo.authority, isSigner: false, isWritable: false } : [])
            .concat(marketInfo.authority && marketInfo.pruneAuthority
            ? { pubkey: marketInfo.pruneAuthority, isSigner: false, isWritable: false }
            : []);
        const data = Buffer.alloc(dataLayout.span);
        dataLayout.encode({
            version: 0,
            instruction: 0,
            baseLotSize: marketInfo.baseLotSize,
            quoteLotSize: marketInfo.quoteLotSize,
            feeRateBps: marketInfo.feeRateBps,
            vaultSignerNonce: marketInfo.vaultSignerNonce,
            quoteDustThreshold: marketInfo.quoteDustThreshold,
        }, data);
        return new web3_js_1.TransactionInstruction({
            keys,
            programId,
            data,
        });
    });
}
