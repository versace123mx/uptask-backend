import { Router } from "express";
import { AuthController } from "../controller/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validations";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post('/create-account',
    body('name').notEmpty().withMessage('El Campo nombre no debe estar vacio')
        .isLength({ min: 5, max: 70 }).withMessage('El Nombre debe de tener un minimo de caractes de 5 y Maximo de 70'),
    body('email').notEmpty().withMessage('El Campo email no debe estar vacio')
        .isEmail().withMessage('El email no es valido, verifica su formato'),
    body('password').notEmpty().withMessage('El Campo Password no debe estar vacio')
        .isLength({ min: 8, max: 25 }).withMessage('El Campo Password debe de tener un minimo de caractes de 8 y Maximo de 25 cracteres'),
    body('password_confirmation')
        .notEmpty().withMessage('El Campo confirmar Password no debe estar vacio')
        .isLength({ min: 8, max: 25 }).withMessage('El Campo Confirmar Password debe de tener un minimo de caractes de 8 y Maximo de 25 cracteres')
        .custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Los Password no son iguales')
            }
            return true
        }),
    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token').notEmpty().withMessage('El token no puede estar vacio'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email').notEmpty().withMessage('El Campo email no debe estar vacio')
        .isEmail().withMessage('El email no es valido, verifica su formato'),
    body('password')
        .notEmpty().withMessage('El Campo Password no debe estar vacio'),
    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email').notEmpty().withMessage('El Campo email no debe estar vacio')
        .isEmail().withMessage('El email no es valido, verifica su formato'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email').notEmpty().withMessage('El Campo email no debe estar vacio')
        .isEmail().withMessage('El email no es valido, verifica su formato'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('El token no puede estar vacio'),
    handleInputErrors,
    AuthController.validateToken
)

router.put('/update-password/:token',
    param('token')
    .isNumeric().withMessage('Token no valido'),
    body('password').notEmpty().withMessage('El Campo Password no debe estar vacio')
        .isLength({ min: 8, max: 25 }).withMessage('El Campo Password debe de tener un minimo de caractes de 8 y Maximo de 25 cracteres'),
    body('password_confirmation')
        .notEmpty().withMessage('El Campo confirmar Password no debe estar vacio')
        .isLength({ min: 8, max: 25 }).withMessage('El Campo Confirmar Password debe de tener un minimo de caractes de 8 y Maximo de 25 cracteres')
        .custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Los Password no son iguales')
            }
            return true
        }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

/**Profile */
router.put('/profile',
    body('name').notEmpty().withMessage('El Campo nombre no debe estar vacio')
        .isLength({ min: 5, max: 70 }).withMessage('El Nombre debe de tener un minimo de caractes de 5 y Maximo de 70'),
    body('email').notEmpty().withMessage('El Campo email no debe estar vacio')
        .isEmail().withMessage('El email no es valido, verifica su formato'),
    authenticate,
    handleInputErrors,
    AuthController.updateProfile
)

router.put('/update-password',
    body('current_password').notEmpty().withMessage('El Campo Password Actual no debe estar vacio'),
    body('password').notEmpty().withMessage('El Campo New Password no debe estar vacio')
        .isLength({ min: 8, max: 25 }).withMessage('El Campo New Password debe de tener un minimo de caractes de 8 y Maximo de 25 cracteres'),
    body('password_confirmation')
        .notEmpty().withMessage('El Campo confirmar Password no debe estar vacio')
        .isLength({ min: 8, max: 25 }).withMessage('El Campo Confirmar Password debe de tener un minimo de caractes de 8 y Maximo de 25 cracteres')
        .custom((value, { req }) => {
            if (value != req.body.password) {
                throw new Error('Los Password no son iguales')
            }
            return true
        }),
    authenticate,
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)


router.post('/check-password',
    body('password').notEmpty().withMessage('El Campo Password no debe estar vacio'),
    authenticate,
    handleInputErrors,
    AuthController.checkPassword
)
export default router