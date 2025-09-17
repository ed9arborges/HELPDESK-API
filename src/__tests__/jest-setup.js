// This file contains setup code that will be executed before tests run
const { PrismaClient } = require("@prisma/client");
const { mockDeep, mockReset } = require("jest-mock-extended");

// Mock the PrismaClient
jest.mock("../database/prisma", () => {
  return {
    __esModule: true,
    default: mockDeep(PrismaClient),
  }
})

// Reset mocks before each test
beforeEach(() => {
  mockReset(jest.requireMock("../database/prisma").default);
});