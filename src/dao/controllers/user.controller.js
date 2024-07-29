import userService from "../services/user.service.js"
import crypto from "crypto"
import { transport } from "../../app.js"
import { entorno } from "../../config/config.js"

const userController = {
    getUsers: async (req, res) => {
        let currentPage = req.query.page || 1;
        const userId = req.session.userId;
        const user = req.session.user;
        const jwtToken = req.session.token;
        const userRole = req.session.userRole;
        try {
            const response = await userService.getUsers(currentPage);
            if (req.accepts("html")) {
                return res.render("usersList", { response, userId, user, jwtToken, userRole });
            }
        } catch (error) {
            console.error("Error al obtener la lista de usuarios:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    getUserById: async (req, res) => {
        const userId = req.params.uid
        const isAuthenticated = req.session
        const jwtToken = req.session.token
        let currentPage = req.query.page || 1
        try {
            const user = await userService.getUserById(userId)
            const response = await userService.getUsers(currentPage)
            if (req.accepts("html")) {
                return res.render("user", { User: user, user, isAuthenticated, jwtToken })
            }
        } catch (error) {
            console.error("Error al obtener usuario por ID:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getLogin: async (req, res) => {
        try {
            const loginView = await userService.getLogin()
            res.render(loginView)
        } catch (error) {
            console.error("Error al obtener la vista de inicio de sesión:", error)
            res.status(500).json({ error: "Error interno del servidor" })
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
            req.session.userRole = user.role
            console.log("Login:", user, "token:", access_token)
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
            }).send({ status: "Success", message: user, access_token, userId: user._id, userRole: user.role })
        } catch (error) {
            console.error("Error al iniciar sesión:", error)
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getRegister: async (req, res) => {
        try {
            const registerView = await userService.getRegister()
            res.render(registerView)
        } catch (error) {
            console.error("Error en la vista de registro:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    register: async (req, res, next) => {
        const userData = req.body
        const file = req.file
        try {
            const { newUser, access_token } = await userService.register(userData, file)
            req.session.token = access_token
            req.session.userId = newUser._id
            req.session.user = newUser
            req.session.isAuthenticated = true
            req.session.userRole = newUser.role
            console.log("Registro:", newUser, "token:", access_token)
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
            }).send({ status: "Success", message: newUser, access_token, userId: newUser._id, userRole: newUser.role })
        } catch (error) {
            console.error("Error al registrar usuario:", error)
            next(error)
        }
    },

    getGitHub: async (req, res) => {
        try {
            const githubAuth = await userService.getGitHub()
            res.redirect(githubAuth)
        } catch (error) {
            console.error("Error al obtener la autenticación de GitHub:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    gitHubCallback: async (req, res, next) => {
        try {
            await userService.gitHubCallback()(req, res, next)
        } catch (error) {
            console.error("Error en el callback de GitHub:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    handleGitHubCallback: async (req, res) => {
        try {
            const { user, access_token } = await userService.handleGitHubCallback(req)
            req.session.token = access_token
            req.session.userId = user._id
            req.session.user = user
            req.session.isAuthenticated = true
            req.session.userRole = user.role
            res.cookie("jwtToken", access_token, {
                httpOnly: true,
            }).send({ status: "Success", message: user, access_token, userId: user._id, userRole: user.role })
        } catch (error) {
            console.error('Error en el callback de GitHub:', error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    updateUser: async (req, res) => {
        const userId = req.params.uid
        const updatedUserData = req.body
        try {
            const updatedUser = await userService.updateUser(userId, updatedUserData)
            res.json(updatedUser)
        } catch (error) {
            console.error("Error al actualizar usuario:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getUpdateUser: async (req, res) => {
        const user = req.session.user
        const isAuthenticated = req.session.isAuthenticated
        const jwtToken = req.session.token
        try {
            const updateUserView = await userService.getUpdateUser()
            res.render(updateUserView, { isAuthenticated, jwtToken, user })
        } catch (error) {
            console.error("Error al obtener la vista de editar usuario:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getForgotPassword: async (req, res) => {
        try {
            const forgotView = await userService.getForgotPassword();
            res.render(forgotView);
        } catch (error) {
            console.error("Error al obtener la vista de olvidar contraseña:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    requestPasswordReset: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await userService.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpires = Date.now() + 3600000;
            await userService.savePasswordResetToken(user._id, resetToken, resetTokenExpires);
            const resetUrl = `http://${req.headers.host}/api/sessions/resetPassword/${resetToken}`;
            const mailOptions = {
                to: user.email,
                from: entorno.EMAIL_USERNAME,
                subject: 'Restablecimiento de contraseña',
                text: `Está solicitado el restablecimiento de la contraseña de su cuenta.\n\n
                Haga clic en el siguiente enlace:\n\n
                ${resetUrl}\n\n`
            };
            await transport.sendMail(mailOptions);
            res.status(200).json({ message: 'Correo de restablecimiento de contraseña enviado con éxito' });
        } catch (error) {
            console.error("Error al solicitar restablecimiento de contraseña:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    getResetPassword: async (req, res) => {
        try {
            const resetPasswordView = await userService.getResetPassword();
            res.render(resetPasswordView);
        } catch (error) {
            console.error("Error al obtener la vista del reset de contraseña:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { newPassword } = req.body;
        const userId = req.session.userId;
        try {
            const user = await userService.getUserByResetToken(token);
            if (!user || user.resetTokenExpires < Date.now()) {
                return res.status(400).json({ error: "Token de restablecimiento inválido o expirado" });
            }
            await userService.updatePassword(userId, newPassword);
            await userService.clearPasswordResetToken(userId);
            res.status(200).json({ message: "Contraseña restablecida con éxito" });
        } catch (error) {
            console.error("Error al restablecer la contraseña:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    changePassword: async (req, res) => {
        const userId = req.params.uid
        const { oldPassword, newPassword } = req.body
        try {
            const changedPassword = await userService.changePassword(userId, oldPassword, newPassword)
            res.json(changedPassword)
        }
        catch (error) {
            console.error("Error al cambiar la contraseña:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getChangePassword: async (req, res) => {
        const isAuthenticated = req.session
        const jwtToken = req.session.token
        try {
            const changePasswordView = await userService.getChangePassword()
            res.render(changePasswordView, { isAuthenticated, jwtToken })
        } catch (error) {
            console.error("Error al obtener la vista de cambiar contraseña:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    changePremiumRole: async (req, res) => {
        const userId = req.params.uid;
        const files = req.files;
        try {
            const updatedPremium = await userService.changePremiumRole(userId, files);
            res.json(updatedPremium);
        } catch (error) {
            console.error("Error al cambiar el rol del usuario:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },    
    
    getChangePremiumRole: async (req, res) => {
        const userId = req.params.uid;
        const user = req.session.user;
        const jwtToken = req.session.token;
        try {
            const changeUserRoleView = await userService.getChangePremiumRole();
            res.render(changeUserRoleView, { user, jwtToken, userId })
        } catch (error) {
            console.error("Error al obtener la vista de cambio de role:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    getChangeUserRole: async (req, res) => {
        const user = req.session.user
        const isAuthenticated = req.session.isAuthenticated
        const jwtToken = req.session.token
        const userId = req.params.uid
        try {
            const changeUserRoleView = await userService.getChangeUserRole();
            res.render(changeUserRoleView, { user, isAuthenticated, jwtToken, userId })
        } catch (error) {
            console.error("Error al obtener la vista de cambio de role:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    changeUserRole: async (req, res) => {
        const userId = req.params.uid
        try {
            const updatedUser = await userService.changeUserRole(userId)
            res.json(updatedUser)
        } catch (error) {
            console.error("Error al cambiar el rol del usuario:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getUploadDocs: async (req, res) => {
        const userId = req.params.uid
        const isAuthenticated = req.session
        const jwtToken = req.session.token
        try {
            const user = await userService.getUserById(userId)
            const uploadDocsView = await userService.getDocs()
            res.render(uploadDocsView, { user, isAuthenticated, jwtToken })
        } catch (error) {
            console.error("Error al obtener la vista de subida de documentos:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    uploadDocs: async (req, res) => {
        const userId = req.params.uid
        const files = req.files
        try {
            const uploadedDocs = await userService.uploadDocs(userId, files)
            res.json(uploadedDocs)
        }
        catch (error) {
            console.error("Error al subir los documents:", error)
            res.status(500).json({ error: "Error interno del servidor" })
        }
    },

    getDocsByUser: async (req, res) => {
        const userId = req.params.uid;
        const isAuthenticated = req.session;
        const jwtToken = req.session.token;
        try {
            const getDocs = await userService.getDocsByUser(userId);
            if (req.accepts('html')) {
                return res.render('docs', { Docs: getDocs, isAuthenticated, jwtToken });
            }
        } catch (error) {
            console.error("Error al obtener la vista de ver los documentos del user:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    deleteInactiveUser: async (req, res) => {
        try {
            // elimina los usuarios que tengan 2 dias seguidos sin conectarse
            const inactivityPeriod = 2 * 24 * 60 * 60 * 1000;
            const user = await userService.findInactiveUser(inactivityPeriod);
            if (user.role == "admin") {
                return res.status(404).json({ error: "No se puede eliminar el administrador" });
            }
            const deleteInactiveUser = await userService.deleteInactiveUser(user._id);
            if (!deleteInactiveUser) {
                return res.status(404).json({ error: "No se ha podido eliminar el usuario inactivo" });
            }
            const mailOptions = {
                to: user.email,
                from: EMAIL_USERNAME,
                subject: 'Se le ha eliminado su cuenta',
                text: `Este mensaje fue enviado porque usted no se ha conectado en 2 dias seguidos y su cuenta ha sido eliminada.`
            };
            await transport.sendMail(mailOptions);
            res.status(200).json({ message: 'Correo de aviso de eliminación de usuario enviado con éxito' });
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    adminChangeUserRole: async (req, res) => {
        const userId = req.params.uid;
        try {
            const changeUserRole = await userService.adminChangeUserRole(userId);
            if (!changeUserRole) {
                return res.status(404).json({ error: "No se ha podido cambiar el rol del usuario" })
            }
            res.status(200).json({ message: 'Cambio del rol exitoso' });
        } catch (error) {
            console.error("Error al cambiar el rol del usuario:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    deleteUser: async (req, res) => {
        const userId = req.params.uid;
        try {
            const deleteUser = await userService.deleteUser(userId);
            if (!deleteUser) {
                return res.status(404).json({ error: "No se ha podido eliminar el usuario" });
            }
            res.status(200).json({ message: 'Eliminación del usuario con exito' });
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    logOut: async (req, res) => {
        const userId = req.session.userId;
        try {
            await userService.logOut(res, userId);
            req.session.userId = null;
            req.session.user = null;
            req.session.isAuthenticated = false;
            return res.json({ message: "Logout funciona" });
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export default userController