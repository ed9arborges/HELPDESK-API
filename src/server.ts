import { app } from "@/app"
import { env } from "./env"
import prisma from "@/database/prisma"

const PORT = env.PORT

// Ensure database connection before starting the server
async function bootstrap() {
  try {
    await prisma.$connect()
    console.log("Database connection established successfully ✅")

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (err) {
    console.error("Failed to connect to the database ❌", err)
    process.exit(1)
  }
}

void bootstrap()
