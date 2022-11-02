import * as Models from "@/data/db/models/index"
import * as OldModels from "@/data/database"

const runMigration = async () => {
  const ModelKeys = Object.keys(Models)

  for(let i in ModelKeys) {
    const key = ModelKeys[i]
    console.log(`Handling ${key} model migration`)

    var data = await OldModels[key].findAll({ raw: true })

    await Models[key].bulkCreate(data)
  }
}

runMigration()