// This file contains setup code that will be executed before tests run
import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset } from "jest-mock-extended"

// Mock the PrismaClient
jest.mock("../database/prisma", () => {
  return {
    __esModule: true,
    default: mockDeep<PrismaClient>(),
  }
})

// Reset mocks before each test
beforeEach(() => {
  mockReset(jest.requireMock("../database/prisma").default)
})
