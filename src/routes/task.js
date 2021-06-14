const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')// added for user authentication
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => { // added auth as a second argument for authentication
    //const task = new Task(req.body) // the version before auth
    const task = new Task({ // updated the lane above to fit for authenticatiın. Now I have added user id as for the owner filed.
        ...req.body, // the task description and completed if provided
        owner: req.user._id // this comes from auth
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findById(req.params.id)

        /* updates.forEach((update) => {
            user[update] = req.body[update] // burada bracket notation kullanıyoruz çünkü değerler dinamik olarak arrayden geliyor ve . notation kullanamayacağız.
        }) */
        updates.forEach((update) => task[update] = req.body[update]) // yukarının short hand formu
        await task.save() // burada middleware devreye girecek
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router