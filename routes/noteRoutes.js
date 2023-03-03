const express = require('express')
const router = express.Router()
const notesController = require('../controllers/notesController')
const verifyJWT = require('../middleware/verifyJWT')

// router.use(verifyJWT)



router.route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNote)
 router.route('/:id') 
    .patch(notesController.updateNote)
router.route('/:id') 
    .delete(notesController.deleteNote)
router.route('/:id')
.get(notesController.getNote)

module.exports = router

