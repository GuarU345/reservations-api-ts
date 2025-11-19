import { prisma } from "../src/utils/prisma"

const defaultCategories = [
    "Restaurante",
    "Cafetería",
    "Bar",
    "Salon de eventos",
    "Gimnasio",
    "Spa",
    "Hotel",
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

    console.log("Categorias default creadas correctamente")
}

main()
    .catch((error) => {
        console.error("Error creando las categorias:", error)
        throw error
    })
    .finally(async () => {
        await prisma.$disconnect()
    })