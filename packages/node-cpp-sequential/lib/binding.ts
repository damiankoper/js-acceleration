import { SHT, CHT } from "meta";

const addon = require("../build/Release/node-cpp-sequential-native");

export = addon as {
  CHTSimple: CHT;
  SHTSimple: SHT;
  SHTSimpleLookup: SHT;
};
