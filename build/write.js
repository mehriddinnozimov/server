"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function default_1(req) {
    const file = path_1.default.join(__dirname, 'log');
    (0, fs_1.writeFileSync)(file, JSON.stringify(req));
}
exports.default = default_1;
