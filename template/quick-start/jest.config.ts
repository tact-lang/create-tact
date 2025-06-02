export default {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["/node_modules/", "/output/", "/dist/"],
    snapshotSerializers: ["@tact-lang/ton-jest/serializers"],
};
