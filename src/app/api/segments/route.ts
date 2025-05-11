const segment = await prisma.segment.create({
  data: {
    name: validatedData.name,
    description: validatedData.description,
    criteria: criteria,
    rules: criteria,
  },
}); 