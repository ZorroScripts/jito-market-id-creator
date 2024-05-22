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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBundle = void 0;
const jito_1 = require("./clients/jito");
const types_js_1 = require("jito-ts/dist/sdk/block-engine/types.js");
function sendBundle(bundledTxns) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bundleId = yield jito_1.searcherClient.sendBundle(new types_js_1.Bundle(bundledTxns, bundledTxns.length));
            console.log(`Bundle ${bundleId} sent.`);
        }
        catch (error) {
            const err = error;
            console.error("Error sending bundle:", err.message);
            if ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.includes('Bundle Dropped, no connected leader up soon')) {
                console.error("Error sending bundle: Bundle Dropped, no connected leader up soon.");
            }
            else {
                console.error("An unexpected error occurred:", err.message);
            }
        }
    });
}
exports.sendBundle = sendBundle;
