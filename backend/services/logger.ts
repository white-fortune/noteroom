import winston from "winston"
import path from "path"
import { config } from "dotenv"

config({ path: path.join(__dirname, '../../.env') })

const logFile = path.join(__dirname, '../../../logs/nrlogs.log')
const errorLogFile = path.join(__dirname, '../../../logs/nr_errorlogs.log')


const logger = winston.createLogger({
    level: process.env.LOG_STATE && process.env.LOG_STATE === "print" ? "info" : "silent",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({timestamp, level, message}) => {
            return `${(new Date(String(timestamp))).toString()} [${level.toUpperCase()}]: ${message}`;
        })
    )
})

if (process.env.LOG_CONSOLE && process.env.LOG_CONSOLE === "true") {
    logger.add(new winston.transports.Console())
}
if (process.env.LOG_SAVE && process.env.LOG_SAVE === "true") {
    logger.add(new winston.transports.File({ filename: logFile }))
    logger.add(new winston.transports.File({ filename: errorLogFile, level: "error" }))
}

export default logger