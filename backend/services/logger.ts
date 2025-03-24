import winston from "winston"
import path from "path"
import { config } from "dotenv"

config({ path: path.join(__dirname, '../.env') })

const logFile = path.join(__dirname, '../../../logs/nrlogs.log')
const errorLogFile = path.join(__dirname, '../../../logs/nr_errorlogs.log')


const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({timestamp, level, message}) => {
            return `${(new Date(String(timestamp))).toString()} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: logFile }),
        new winston.transports.File({ filename: errorLogFile, level: "error" })
    ]
})

if (process.env.DEVELOPMENT && process.env.DEVELOPMENT === "true") {
    logger.add(new winston.transports.Console())
}

export default logger