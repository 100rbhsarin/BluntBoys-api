const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()

    // If no notes 
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    // // Add username to each note before sending the response 
    // // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // // You could also do this with a for...of loop
    // const notesWithUser = await Promise.all(notes.map(async (note) => {
    //     const user = await User.findById(note.user).lean().exec()
    //     return { ...note, username: user.username }
    // }))

    res.json(notes)
})

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
    const { img, title, text } = req.body

    // Confirm data
    if ( !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    // Create and store the new user 
    const note = await Note.create({ title, text ,img })

    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const {  title, text } = req.body
   
   const {id}= req.params

    // Confirm data
    if (!id  || !title || !text ) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.title = title
    note.text = text

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {


        Note.findByIdAndRemove({ _id: req.params.id }, function (err, employee) {
        if (err) res.json(err);
        else res.json('Employee Deleted Successfully');
        });
    // const { id } = req.body

    // // Confirm data
    // if (!id) {
    //     return res.status(400).json({ message: 'Note ID required' })
    // }

    // // Confirm note exists to delete 
    // const note = await Note.findById(id).exec()

    // if (!note) {
    //     return res.status(400).json({ message: 'Note not found' })
    // }

    // const result = await note.deleteOne()

    // const reply = `Note '${result.title}' with ID ${result._id} deleted`

    // res.json(reply)
})


const getNote = asyncHandler(async (req, res) => {
    let id = req.params.id;
    Note.findById(id, function (err, notes) {
       res['_id']= String(res['_id'])
        console.log(notes)
    res.json(notes);
    });
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote,
    getNote
}