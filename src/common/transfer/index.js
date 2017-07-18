//import Socket from "../utils/socket";
//import {LoggerFactory,Redux} from "darch/src/utils";

//let Logger = new LoggerFactory("wallet", {level: "debug"});

module.exports = class Wallet {
    static actions = require("./actions");
    static reducer = require("./reducer");
}