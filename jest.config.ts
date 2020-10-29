/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
	transform: { "^.+\\.ts$": "ts-jest" },
	testEnvironment: "node",
	collectCoverage: true,
	coverageDirectory: "coverage",
	coveragePathIgnorePatterns: [ "/node_modules/", "/docs/" ],
	coverageProvider: "v8",
	testRegex: "/tests/.*\\.spec\\.(ts)$",
	moduleFileExtensions: [ "ts", "js" ],
	verbose: true
};