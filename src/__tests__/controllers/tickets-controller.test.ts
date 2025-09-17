import { mockDeep, MockProxy } from "jest-mock-extended"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

// Mock the prisma client - must be before other imports
jest.mock("../../database/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

// Mock all controller modules that might be causing issues
jest.mock("../../controllers/users-controller", () => ({
  UsersController: class MockUsersController {
    index() {}
    show() {}
    create() {}
    update() {}
    delete() {}
    updateMe() {}
    uploadAvatar() {}
    deleteAvatar() {}
    updateRole() {}
    destroy() {}
  },
}))

// Only mock what is needed to satisfy imports
jest.mock("../../controllers/sessions-controller", () => ({
  SessionsController: class MockSessionsController {
    create() {}
  },
}))

jest.mock("../../controllers/services-controller", () => ({
  ServicesController: class MockServicesController {
    index() {}
    show() {}
    create() {}
    update() {}
    delete() {}
    destroy() {}
  },
}))

jest.mock("../../controllers/users-upload-controller", () => ({
  UsersUploadController: class MockUsersUploadController {
    uploadAvatar() {}
    deleteAvatar() {}
  },
}))

// Mock middlewares BEFORE app import so route registration sees stubs
jest.mock("../../middlewares/ensure-authenticated", () => ({
  ensureAuthenticated: (req: any, _res: any, next: any) => {
    req.user = { id: "test-user-id", role: "customer" }
    next()
  },
}))

jest.mock("../../middlewares/verify-user-authorization", () => ({
  verifyUserAuthorization: () => (_req: any, _res: any, next: any) => next(),
}))

jest.mock("../../middlewares/upload", () => ({
  uploadAvatar: { single: () => (_req: any, _res: any, next: any) => next() },
}))

// Now we can import the app and other modules
import request from "supertest"
import { app } from "../../app"
import prisma from "../../database/prisma"

const mockPrisma = prisma as unknown as MockProxy<PrismaClient>

describe("Tickets Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /tickets", () => {
    it("should create a new ticket when valid data is provided", async () => {
      const serviceId = crypto.randomUUID()

      // Mock the Prisma methods directly
      // @ts-ignore - Bypass TypeScript checking for mocks
      mockPrisma.categoryServices.findFirst.mockReturnValue({
        id: serviceId,
        name: "Test Service",
        amount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock ticket creation
      // @ts-ignore - Bypass TypeScript checking for mocks
      mockPrisma.tickets.create.mockReturnValue({
        id: "test-ticket-id",
        title: "Test Ticket",
        description: "Test ticket description",
        userId: "test-user-id",
        serviceId: serviceId,
        status: "open",
        techId: null,
        estimate: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const response = await request(app)
        .post("/tickets")
        .set("Authorization", "Bearer fake-token")
        .send({
          title: "Test Ticket",
          serviceId: serviceId,
          description: "Test ticket description",
        })

      expect(response.status).toBe(201)
      expect(response.body.ticket).toHaveProperty("id")
      expect(mockPrisma.categoryServices.findFirst).toHaveBeenCalledWith({
        where: { id: serviceId },
      })
      expect(mockPrisma.tickets.create).toHaveBeenCalled()
    })

    it("should return 400 when invalid data is provided", async () => {
      const response = await request(app)
        .post("/tickets")
        .set("Authorization", "Bearer fake-token")
        .send({
          title: "Test Ticket",
          description: "Test", // too short & missing serviceId
        })

      expect(response.status).toBe(400)
    })
  })
})
