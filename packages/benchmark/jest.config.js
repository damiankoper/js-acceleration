export default {
  moduleFileExtensions: ["js", "json", "ts"],
  modulePaths: ["."],
  moduleDirectories: ["src", "node_modules"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  rootDir: ".",
  testRegex: ".\\.spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules"],
  maxWorkers: "50%",
  coverageDirectory: "./coverage",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [],
};
