import { SHT } from "meta";

const addon = require('../build/Release/node-cpp-sequential-native');

export = addon as {
  SHTSequentialSimple: SHT
  SHTSequentialSimpleLookup: SHT
}
