import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultCategories = [
  "Restaurantes",
  "Cafeterías",
  "Bares",
  "Salones de eventos",
  "Gimnasios",
  "Spa y bienestar",
  "Hoteles",
]

async function main() {
  for (const category of defaultCategories) {
    const existingCategory = await prisma.business_categories.findFirst({
      where: { category },
    })

    if (existingCategory) {
      if (!existingCategory.active) {
        await prisma.business_categories.update({
          where: { id: existingCategory.id },
          data: { active: true },
        })
      }
      continue
    }

    await prisma.business_categories.create({
      data: { category },
    })
  }

  console.log("Default business categories seeded successfully")
}

main()
  .catch((error) => {
    console.error("Error seeding business categories:", error)
    throw error
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
