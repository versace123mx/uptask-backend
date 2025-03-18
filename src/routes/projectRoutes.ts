import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectControler } from "../controller/ProjectController";
import { handleInputErrors } from "../middleware/validations";
import { TaskController } from "../controller/TaskController";
import { validateProjectExists } from "../middleware/project";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controller/TeamController";
import { hasAuthorization, taskExists } from "../middleware/task";
import { NoteController } from "../controller/NoteController";

const router = Router()

//Esto le dice que todas las rutas de este archivo requieren autenticacion, mediante el middleware authenticate
router.use(authenticate)

/** Routes for Project */

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del Proyecto no pue ir vacio').trim()
        .isLength({ min: 5, max: 50 }).withMessage('El minimo de caractes permitidos es de 5 y Maximo de 50'),
    body('clientenName')
        .notEmpty().withMessage('El Nombre del cliente no puede ir vacio').trim()
        .isLength({ min: 3, max: 30 }).withMessage('El minimo de caractes permitidos para el nombre del cliente es de 3 y Maximo de 30'),
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacio').trim()
        .isLength({ min: 5, max: 120 }).withMessage('El minimo de caractes permitidos en la descripcion es de 5 y Maximo de 120'),
    handleInputErrors,
    ProjectControler.createProjects)

router.get('/',
    ProjectControler.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    ProjectControler.getProjectById)

router.put('/:id',
    param('id').isMongoId().withMessage('Id no valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del Proyecto no pue ir vacio').trim()
        .isLength({ min: 5, max: 50 }).withMessage('El minimo de caractes permitidos es de 5 y Maximo de 50'),
    body('clientenName')
        .notEmpty().withMessage('El Nombre del cliente no puede ir vacio').trim()
        .isLength({ min: 3, max: 30 }).withMessage('El minimo de caractes permitidos para el nombre del cliente es de 3 y Maximo de 30'),
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacio').trim()
        .isLength({ min: 5, max: 120 }).withMessage('El minimo de caractes permitidos en la descripcion es de 5 y Maximo de 120'),
    handleInputErrors,
    ProjectControler.updateProject)

router.delete('/:id',
    param('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    ProjectControler.deleteProject)



/** Routes for task */

//con esta linea en lugar de pasarle a todos los endpoint /:projectId el middleware de validateProjectExists
//con esta sola linea le decimos que todos los endpoint con /:projectId les pase ese middleaware
router.use('/:projectId', validateProjectExists)


/*
router.param('projectId',validateProjectExists)
podrias quitar validateProjectExists de las url y con la linea de arriba primero verifica que el proyecto exita
*/


router.post('/:projectId/task',
    param('projectId').isMongoId().withMessage('Id no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la Tarea no pue ir vacio').trim()
        .isLength({ min: 5, max: 90 })
        .withMessage('El minimo de caractes permitidos es de 5 y Maximo de 90'),
    body('description')
        .notEmpty().withMessage('La descripccion de la tarea no puede ir vacio').trim()
        .isLength({ min: 3, max: 150 })
        .withMessage('El minimo de caractes permitidos para el nombre del cliente es de 3 y Maximo de 150'),
    hasAuthorization,
    handleInputErrors,
    TaskController.createTask
)


router.get('/:projectId/task',
    param('projectId').isMongoId().withMessage('Id no valido'),
    validateProjectExists,
    handleInputErrors,
    TaskController.getProjectTasks
)


//middleware que valida que la tarea exista
//router.use('/:taskId', taskExists)

router.get('/:projectId/task/:taskId',
    taskExists,
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/task/:taskId',
    body('name')
        .notEmpty().withMessage('El nombre de la Tarea no pue ir vacio').trim()
        .isLength({ min: 5, max: 90 })
        .withMessage('El minimo de caractes permitidos es de 5 y Maximo de 90'),
    body('description')
        .notEmpty().withMessage('La descripccion de la tarea no puede ir vacio').trim()
        .isLength({ min: 3, max: 300 })
        .withMessage('El minimo de caractes permitidos para el nombre del cliente es de 3 y Maximo de 150'),
    taskExists,
    hasAuthorization,
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/task/:taskId',
    //param('projectId').isMongoId().withMessage('Id project no valido'),
    //param('taskId').isMongoId().withMessage('Id tarea no valido'),
    taskExists,
    hasAuthorization,
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/task/:taskId/status',
    //param('projectId').isMongoId().withMessage('Id no valido del proyecto'),
    //param('taskId').isMongoId().withMessage('Id no valido de la tarea'),
    body('status').notEmpty().withMessage('El estatus es obligatorio'),
    taskExists,
    handleInputErrors,
    TaskController.updateStatus
)


/**Routes for teams */

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('El email es obligatorio y debe ser un email valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
)

router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)


/**Routes for Notes */
router.post('/:projectId/task/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio').
        isLength({ min: 5, max: 250 }).
        withMessage('El minimo de caractes permitidos para el contenido de la nota es de 5 y Maximo de 250'),
    taskExists,
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/task/:taskId/notes',
    taskExists,
    NoteController.getTaskNotes
)

router.delete('/:projectId/task/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id de nota no valido'),
    taskExists,
    handleInputErrors,
    NoteController.deleteNote
)

export default router