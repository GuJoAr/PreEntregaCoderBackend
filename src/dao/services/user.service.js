import User from "../models/user.js" 
import bcrypt from "bcrypt" 
import { generateAuthToken } from "../../config/auth.js" 
import passport from "passport" 

const userService = {
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
            const existingUser = await User.findOne({ email }) 
            if (existingUser) {
                throw new Error("El usuario ya existe") 
            }
            const hashedPassword = await bcrypt.hash(password, 10) 
            const role = email === "adminCoder@coder.com" ? "admin" : "user" 
            const newUser = new User({
                first_name: first_name,
                last_name: last_name,
                email: email,
                age: age,
                password: hashedPassword,
                role,
            }) 
            await newUser.save() 
            const access_token = generateAuthToken(newUser) 
            return { newUser, access_token } 
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
            console.log("Token login github:", access_token) 
            return { user, access_token } 
        } catch (error) {
            console.error('Error en el callback de GitHub:', error) 
            throw new Error("Error interno del servidor") 
        }
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
