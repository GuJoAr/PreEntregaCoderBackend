import express from "express" 
import userController from "../dao/controllers/user.controller.js"
import { authToken, isUserOrPremium } from "../config/auth.js"

const userRouter = express.Router() 

// Maneja el renderizado del login
userRouter.get("/login", userController.getLogin) 

// Maneja el renderizado del register
userRouter.get("/register", userController.getRegister) 

// Iniciar sesión con GitHub
userRouter.get("/github", userController.getGitHub)

// Callback de GitHub después de la autenticación
userRouter.get("/githubcallback", userController.gitHubCallback, userController.handleGitHubCallback)

// Maneja el renderizado del forgot password
userRouter.get("/forgotPassword", userController.getForgotPassword)

// Maneja el renderizado del reset password
userRouter.get("/resetPassword/:token", userController.getResetPassword)

// Maneja la solicitud para cerrar la sesion del usuario
userRouter.get("/logout", authToken, userController.logOut)

// Maneja la solicitud de login de usuarios
userRouter.post("/login", userController.login) 

// Maneja la solicitud de registros de usuarios
userRouter.post("/register", userController.register) 

// Maneja la solicitud para enviar los mensajes para cambiar la contraseña
userRouter.post("/requestPasswordReset", userController.requestPasswordReset)

// Maneja la solicitud para cambiar la contraseña del usuario
userRouter.post("/resetPassword/:token", userController.resetPassword)

export default userRouter 

