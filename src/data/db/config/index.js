import path from "path"
import { DEBUG } from "@/helper/args"
import { Sequelize } from "sequelize"
import { DBLogger } from "@/helper/logger"
import keys from "@/data/keys"

// Create Sequelize DB in prod or dev
const { host, dialect, username, password, database } = keys.db ? keys.db : {}

var db = null

if (DEBUG) {
  db = new Sequelize({ dialect: "sqlite", storage: path.join(process.cwd(), "storage", "db.sqlite"), logging: (msg) => DBLogger.info(msg) }) 
} else {
  db = new Sequelize({
    host,
    dialect: dialect ? dialect : 'mysql',
    username,
    password,
    database,
    logging: (msg) => DBLogger.info(msg)
  })
}

db.authenticate()

export default db