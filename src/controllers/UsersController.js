const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite")
const UserRepository = require("../repositories/UserRepository")
const UserCreateServices = require("../services/UserCreateServices")

class UsersController {

    async create(request, response) {
        const { name, email, password } = request.body

        const userRepository = new UserRepository()
        const userCreateServices = new UserCreateServices(userRepository)
        await userCreateServices.execute({ name, email, password })
      
        return response.status(201).json({ message: "Usuário cadastrado com sucesso" })
    }


    async update(request, response) {
        const { name, email, password, old_password } = request.body
        const user_id = request.user.id

        const database = await sqliteConnection()
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])

        if(!user) {
            throw new AppError("Usuário não encontrado")
        }

        const userWithUpdateEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])
        if(userWithUpdateEmail && userWithUpdateEmail.id !== user.id){
            throw new AppError("Este e-mail já está em uso")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if(password && !old_password) {
            throw new AppError("A senha antiga não foi informada")
        }

        if(password && old_password) {
        const checkPassword = await compare(old_password, user.password)

        if(!checkPassword) {
            throw new AppError("A senha antiga está invalida")
        }

        user.password = await hash(password, 8)
    }

        await database.run(`
            UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
            [user.name, user.email, user.password, user_id]
        )
        return response.json()
    }

}

module.exports = UsersController   