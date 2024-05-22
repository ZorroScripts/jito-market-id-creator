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
const prompt_sync_1 = __importDefault(require("prompt-sync"));
const createMarketLow_1 = require("./src/createMarketLow");
const createMarketHigh_1 = require("./src/createMarketHigh");
const prompt = (0, prompt_sync_1.default)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let running = true;
        while (running) {
            console.log("\nMenu:");
            console.log("1. Create Market id Low (0.29 SOL)");
            console.log("2. Create Market id High (2.78 SOL)");
            const answer = prompt("Choose an option or 'exit': ");
            switch (answer) {
                case '1':
                    yield (0, createMarketLow_1.mkMrktLow)();
                    break;
                case '2':
                    yield (0, createMarketHigh_1.mkMrktHigh)();
                    break;
                case 'exit':
                    running = false;
                    break;
                default:
                    console.log("Invalid option, please choose again.");
            }
        }
        console.log("Exiting...");
        process.exit(0);
    });
}
main().catch(err => {
    console.error("Error:", err);
});
