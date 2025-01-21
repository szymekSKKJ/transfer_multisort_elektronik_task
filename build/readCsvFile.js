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
exports.readCsvFile = void 0;
const fs_1 = __importDefault(require("fs"));
const papaparse_1 = __importDefault(require("papaparse"));
const readCsvFile = (pathToFike) => __awaiter(void 0, void 0, void 0, function* () {
    // In this case we read the file locally but instead we can simulate a SQL query which can looks like this:
    // SELECT id, date, price FROM share_prices
    // "share_prices" is the name of table
    // The currency is not needed
    const response = yield new Promise((resolve) => {
        fs_1.default.readFile(pathToFike, "utf8", (error, data) => {
            if (error) {
                resolve([null, error]);
            }
            const result = papaparse_1.default.parse(data, {
                header: true,
                skipEmptyLines: true,
            }).data;
            resolve([result, null]);
        });
    });
    return response;
});
exports.readCsvFile = readCsvFile;
