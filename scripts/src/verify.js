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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sui_js_1 = require("@mysten/sui.js");
var fs = require("fs");
globalThis.fetch = fetch;
var loadLocalJSON = function (filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    catch (error) {
        console.error("Error loading local JSON file:", error);
        return null;
    }
};
var getKeypair = function () {
    var privatekey0x = process.env.SUI_PRIVATE_KEY;
    var privatekey = privatekey0x.replace(/^0x/, "");
    var privateKeyBase64 = Buffer.from(privatekey, "hex").toString("base64");
    return sui_js_1.Ed25519Keypair.fromSecretKey((0, sui_js_1.fromB64)(privateKeyBase64));
};
var setupTransactionBlock = function (vk_bytes, public_inputs_bytes, proof_points_bytes) {
    var pkgID = "0xd0cb8699235e0785e6aba7b19e1065efbd359eea0ed702dc68228ecbda3de3e0";
    var txb = new sui_js_1.TransactionBlock();
    txb.moveCall({
        target: "".concat(pkgID, "::verifier::verify_proof"),
        typeArguments: [],
        arguments: [
            txb.pure(vk_bytes, "vector<u8>"),
            txb.pure(public_inputs_bytes, "vector<u8>"),
            txb.pure(proof_points_bytes, "vector<u8>"),
        ],
    });
    return txb;
};
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var localData, vk_bytes, public_inputs_bytes, proof_points_bytes, provider, signer, address, txb, dryRunResult, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                localData = loadLocalJSON("../prover/output_data.json");
                if (!localData)
                    return [2 /*return*/];
                vk_bytes = localData.vk_bytes, public_inputs_bytes = localData.public_inputs_bytes, proof_points_bytes = localData.proof_points_bytes;
                console.log({ vk_bytes: vk_bytes, public_inputs_bytes: public_inputs_bytes, proof_points_bytes: proof_points_bytes });
                provider = new sui_js_1.JsonRpcProvider(new sui_js_1.Connection({
                    fullnode: "https://sui-testnet.nodeinfra.com",
                }));
                signer = new sui_js_1.RawSigner(getKeypair(), provider);
                return [4 /*yield*/, signer.getAddress()];
            case 1:
                address = _a.sent();
                console.log({ address: address });
                txb = setupTransactionBlock(vk_bytes, public_inputs_bytes, proof_points_bytes);
                return [4 /*yield*/, signer.dryRunTransactionBlock({
                        transactionBlock: txb,
                    })];
            case 2:
                dryRunResult = _a.sent();
                console.log(dryRunResult);
                return [4 /*yield*/, signer.signAndExecuteTransactionBlock({
                        transactionBlock: txb,
                    })];
            case 3:
                result = _a.sent();
                console.log(result);
                console.log("hello");
                return [2 /*return*/];
        }
    });
}); };
main();
