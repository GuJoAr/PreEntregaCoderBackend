import express from "express" 
import userController from "../dao/controllers/user.controller.js"
import { authToken,isUser ,isAdmin, isUserOrPremium, isAll } from "../config/auth.js"
import { configureDocumentMulter, configureProfileMulter } from "../utils/utils.js"

const userRouter = express.Router() 
const profileUpload = configureProfileMulter()
const documentUpload = configureDocumentMulter()
const getPremium = documentUpload.fields([
    {name: "identificacion", maxCount: 1},
    {name: "comprobanteDomicilio", maxCount: 1},
    {name: "comprobanteCuenta", maxCount: 1}
])

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

// Maneja el renderizado del change role
userRouter.get("/premium/:uid", authToken, isUserOrPremium, userController.getChangeUserRole)

// Maneja la solicitud para cerrar la sesion del usuario
userRouter.get("/logout", authToken, userController.logOut)

// Maneja el renderizado de la subida de documentos
userRouter.get("/:uid/documents", authToken, isAll, userController.getUploadDocs)

// Maneja la solicitud para actualizar los datos del usuario
userRouter.put("/updateUser/:uid", authToken, userController.updateUser)

// Maneja la solicitud para cambiar la contraseña del usuario
userRouter.put("/changePassword/:uid", authToken, userController.changePassword)

// Maneja la solicitud para cambiar el rol del usuario
userRouter.put("/premium/:uid", authToken, isUserOrPremium, getPremium, userController.changeUserRole)

// Maneja la solicitud de login de usuarios
userRouter.post("/login", userController.login) 

// Maneja la solicitud de registros de usuarios
userRouter.post("/register", profileUpload.single("profile"), userController.register) 

// Maneja la solicitud para enviar los mensajes para cambiar la contraseña
userRouter.post("/requestPasswordReset", userController.requestPasswordReset)

// Maneja la solicitud para cambiar la contraseña del usuario
userRouter.post("/resetPassword/:token", userController.resetPassword)

// Maneja la solicitud para subir documentos
userRouter.post("/:uid/documents", authToken, isAll, documentUpload.array("documents", 10), userController.uploadDocs)

export default userRouter 

