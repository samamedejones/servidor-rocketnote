require("express-async-errors")
require("dotenv/config")
const migrationsRun = require("./database/sqlite/migrations")
const express = require("express")
const AppError = require("./utils/AppError")
const routes = require("./routes")
const uploadConfigs = require("./configs/upload")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

migrationsRun()

app.use("/files", express.static(uploadConfigs.UPLOADS_FOLDER))


app.use(routes)

app.use((error, request, response, next) => {
    if(error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    return response.status(500).json({
        status: "error",
        message: "Internal server error"
    })
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))