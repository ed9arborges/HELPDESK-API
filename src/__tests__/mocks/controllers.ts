// This file provides mock implementations for controllers used in testing

// Mock UsersController
export class UsersController {
  async index() {}
  async show() {}
  async create() {}
  async update() {}
  async updateMe() {}
  async uploadAvatar() {}
  async deleteAvatar() {}
  async delete() {}
}

// Mock SessionsController
export class SessionsController {
  async create() {}
}

// Mock ServicesController
export class ServicesController {
  async index() {}
  async show() {}
  async create() {}
  async update() {}
  async delete() {}
}

// Mock UsersUploadController
export class UsersUploadController {
  async uploadAvatar() {}
  async deleteAvatar() {}
}

// Export as needed for testing
export default {
  UsersController,
  SessionsController,
  ServicesController,
  UsersUploadController,
}
