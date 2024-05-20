import bcrypt from "bcrypt" 
import { generateAuthToken } from "../../config/auth.js" 
import passport from "passport" 
import userRepository from "../Repositories/user.repository.js"
import UserDTO from "../DTO/user.dto.js"

const userService = {
    getUserById: async (userId) => {
        try {
            const user = await userRepository.findById(userId, true)
            return user
        } catch (error) {
            throw new Error("Error al obtener usuario por su ID: " + error.message)
        }
    }, 

    getLogin: async () => {
        return "login"
    },

    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    reject(err)
                }
                if (!user) {
                    reject(new Error("Credenciales inválidas"))
                }
                if (email === "adminCoder@coder.com" && password === "adminCod3er123") {
                    user.role = "admin"
                }
                const access_token = generateAuthToken(user)
                resolve({ user, access_token })
            })({ body: { email, password } }, {})
        })
    },

    getRegister: async () => {
        return "register"
    },

    register: async (userData) => {
        const { first_name, last_name, email, age, password } = userData
        try {
            const existingUser = await userRepository.findByEmail(email)
            if (existingUser) {
                throw new Error("El usuario ya existe")
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUserDTO = new UserDTO(first_name, last_name, email, age, hashedPassword)
            const newUser = { ...newUserDTO }
            const createdUser = await userRepository.createUser(newUser)
            const access_token = generateAuthToken(createdUser)
            return { newUser: createdUser, access_token }
        } catch (error) {
            throw error
        }
    },

    getGitHub: async () => {
        return passport.authenticate("github", { scope: ["user:email"] })
    },

    gitHubCallback: async () => {
        return passport.authenticate("github", { failureRedirect: "/login" })
    },

    handleGitHubCallback: async (req) => {
        const user = req.user
        try {
            const access_token = generateAuthToken(user)
            return { user, access_token }
        } catch (error) {
            console.error('Error en el callback de GitHub:', error)
            throw new Error("Error interno del servidor")
        }
    },

    updateUser: async (userId, updatedUserData) => {
        try {
            const existingUser = await userRepository.findById(userId)
            if (!existingUser) {
                throw new Error("El usuario no existe")
            }
            existingUser.first_name = updatedUserData.first_name || existingUser.first_name
            existingUser.last_name = updatedUserData.last_name || existingUser.last_name
            existingUser.email = updatedUserData.email || existingUser.email
            await existingUser.save()
            return existingUser
        } catch (error) {
            throw new Error("Error al actualizar usuario: " + error.message)
        }
    },

    getUpdateUser: async () => {
        return "updateUser"
    },

    changePassword: async (userId, oldPassword, newPassword) => {
        try {
            const existingUser = await userRepository.findById(userId)
            if (!existingUser) {
                throw new Error("El usuario no existe")
            }
            const isPasswordValid = await bcrypt.compare(oldPassword, existingUser.password)
            if (!isPasswordValid) {
                throw new Error("La contraseña antigua es incorrecta")
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            existingUser.password = hashedPassword
            await existingUser.save()
            return { message: "Contraseña actualizada correctamente" }
        } catch (error) {
            throw new Error("Error al cambiar la contraseña: " + error.message)
        }
    },

    getChangePassword: async () => {
        return "changePassword"
    },

    logOut: async (res, req) => {
        try {
            req.session.userId = null
            req.session.user = null
            req.session.isAuthenticated = false
            res.clearCookie("jwtToken")
            return { message: "Logout funciona" }
        } catch (error) {
            console.error("Error al cerrar sesión:", error)
            throw new Error("Error interno del servidor")
        }
    }
}

export default userService
