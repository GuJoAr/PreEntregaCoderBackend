import userService from "../services/user.service.js" 

const userController = {
    getLogin: async (req, res) => {
        try {
            const loginView = await userService.getLogin() 
            res.render(loginView) 
        } catch (error) {
            console.error("error de inicio de sesión:", error) 
            res.status(500).json({ error: "error del servidor" }) 
        }
    },

    login: async (req, res, next) => {
        const { email, password } = req.body 
        try {
            const { user, access_token } = await userService.login(email, password) 
            req.session.token = access_token 
            req.session.userId = user._id 
            req.session.user = user 
            req.session.isAuthenticated = true 
            console.log("Datos del login:", user, "token:", access_token) 
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
            }).send({ status: "Success", message: user, access_token, userId: user._id }) 
        } catch (error) {
            console.error("error al iniciar sesión:", error) 
            return res.status(500).json({ error: "error del servidor" }) 
        }
    },

    getRegister: async (req, res) => {
        try {
            const registerView = await userService.getRegister() 
            res.render(registerView) 
        } catch (error) {
            console.error("error al obtener la vista de registro:", error) 
            res.status(500).json({ error: "error del servidor" }) 
        }
    },

    register: async (req, res, next) => {
        const userData = req.body 
        try {
            const { newUser, access_token } = await userService.register(userData) 
            req.session.token = access_token 
            req.session.userId = newUser._id 
            req.session.user = newUser 
            req.session.isAuthenticated = true 
            console.log("Datos del registro:", newUser, "token:", access_token) 
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
            }).send({ status: "Success", message: newUser, access_token, userId: newUser._id })
        } catch (error) {
            console.error("error al registrar usuario:", error) 
            next(error) 
        }
    },

    getGitHub: async (req, res) => {
        try {
            const githubAuth = await userService.getGitHub() 
            res.redirect(githubAuth) 
        } catch (error) {
            console.error("error al obtener la autenticación de GitHub:", error) 
            res.status(500).json({ error: "error del servidor" }) 
        }
    },

    gitHubCallback: async (req, res, next) => {
        try {
            await userService.gitHubCallback()(req, res, next) 
        } catch (error) {
            console.error("error de GitHub:", error) 
            res.status(500).json({ error: "error del servidor" }) 
        }
    },

    handleGitHubCallback: async (req, res) => {
        try {
            const { user, access_token } = await userService.handleGitHubCallback(req) 
            req.session.token = access_token 
            req.session.userId = user._id 
            req.session.user = user 
            req.session.isAuthenticated = true 
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
            }).send({ status: "Success", message: user, access_token, userId: user._id }) 
        } catch (error) {
            console.error('error de GitHub:', error) 
            res.status(500).json({ error: "error del servidor" }) 
        }
    },

    logOut: async (req, res) => {
        try {
            await userService.logOut(res, req) 
            return res.json({ message: "logout exitoso" }) 
        } catch (error) {
            console.error("error al cerrar sesion:", error) 
            res.status(500).json({ error: "error del servidor" }) 
        }
    }
}

export default userController 