import { SHT } from "meta";

const addon = require('../build/Release/node-cpp-sequential-native');

export = addon as {
  SHTSimple: SHT
  SHTSimpleLookup: SHT
}
