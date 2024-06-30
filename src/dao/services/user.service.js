import bcrypt from "bcrypt" 
import { generateAuthToken } from "../../config/auth.js" 
import passport from "passport" 
import userRepository from "../Repositories/user.repository.js"
import UserDTO from "../DTO/user.dto.js"
import logger from "../../utils/logger.js" 

const userService = {
    getUserById: async (userId) => {
        try {
            logger.info(`Buscando user ID: ${userId}`)
            const user = await userRepository.findById(userId, true)
            return user
        } catch (error) {
            logger.error(`Error al buscar el user ID: ${userId} - ${error.message}`)
            throw new Error("Error al obtener usuario por su ID: " + error.message)
        }
    }, 

    getLogin: async () => {
        logger.info(`Logeado correctamete`)
        return "login"
    },

    login: async (email, password) => {
        return new Promise((resolve, reject) => {
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    logger.error(`Error durante la autenticacion del login: ${err.message}`)
                    return reject(err)
                }
                if (!user) {
                    logger.warn(`Credenciales de inicio de sesión no válidas para email: ${email}`)
                    return reject(new Error("Credenciales inválidas"))
                }
                if (email === "adminCoder@coder.com" && password === "adminCod3er123") {
                    user.role = "admin"
                }
                const access_token = generateAuthToken(user)
                logger.info(`User iniciado sesión exitosamente: ${email}`)
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
            logger.info(`Registrando nuevo user: ${email}`)
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
            logger.error(`Error al registrar el user: ${email} - ${error.message}`)
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
            logger.error(`Error en GitHub callback del user: ${user.email} - ${error.message}`)
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

    getUserByEmail: async (email) => {
        try {
            const user = await userRepository.findByEmail(email)
            return user
        } catch (error) {
            logger.error(`Error al buscar usuario por su email: ${email} - ${error.message}`)
            throw new Error("Error al obtener usuario por su email: " + error.message)
        }
    },

    savePasswordResetToken: async (userId, resetToken, resetTokenExpires) => {
        try {
            await userRepository.updateUser(userId, { resetToken, resetTokenExpires })
        } catch (error) {
            logger.error(`Error al guardar el token de restablecimiento: ${error.message}`)
            throw new Error("Error al guardar el token de restablecimiento: " + error.message)
        }
    },

    getUserByResetToken: async (token) => {
        try {
            const user = await userRepository.findByResetToken(token)
            return user
        } catch (error) {
            logger.error(`Error al buscar usuario por token de restablecimiento: ${token} - ${error.message}`)
            throw new Error("Error al obtener usuario por token de restablecimiento: " + error.message)
        }
    },

    updatePassword: async (userId, newPassword) => {
        try {
            if (!newPassword) {
                throw new Error("Nueva contraseña requerida")
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await userRepository.updateUser(userId, { password: hashedPassword })
        } catch (error) {
            logger.error(`Error al actualizar la contraseña del usuario: ${userId} - ${error.message}`)
            throw new Error("Error al actualizar la contraseña del usuario: " + error.message)
        }
    },

    clearPasswordResetToken: async (userId) => {
        try {
            await userRepository.updateUser(userId, { resetToken: null, resetTokenExpires: null })
        } catch (error) {
            logger.error(`Error al limpiar el token de restablecimiento del usuario: ${userId} - ${error.message}`)
            throw new Error("Error al limpiar el token de restablecimiento del usuario: " + error.message)
        }
    },

    getForgotPassword: async () => {
        return "forgotPassword"
    },

    getResetPassword: async () => {
        return "resetPassword"
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
