const express = require('express')
const mongoose = require('mongoose')
const app = express()
const User = require('./model/userModel')
const db = require('./dbConnection/db')
db()
const methodOverride = require('method-override');
app.use(methodOverride('_method'));




app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')




//root route
app.get('/', (req, res) => {
    res.redirect('/login')
})

//register route

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password, email, mobile } = req.body

    try {
        const registerUser = await User.create({ username, password, email, mobile })
        console.log(registerUser)
        res.redirect('/login')
    } catch (error) {
        console.log("user not created")
    }

})




//login route

app.get('/login', (req, res) => {
    res.render('login')
})



app.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {

        if (username == 'admin' && password == "admin") {
            res.redirect('/adminpanel')
        }
        else {

            const findUser = await User.findOne({ username: username })
            console.log(findUser);

            if (findUser) {

                if (findUser.password === password) {
                    res.redirect('/welcome')
                }
                else {
                    res.json("wrong credentials")
                }

            }
            else {
                res.status(404).json("User not found !")
            }
        }

    } catch (error) {
        console.log("some error happend")
        res.status(500).json("server error")
    }

})



//welcome page

app.get('/welcome', (req, res) => {
    res.render('welcome')
})




//admin panel

app.get('/adminpanel', async (req, res) => {
    try {

        const users = await User.find()
        // console.log(users)
        res.render('adminPanel', { users })

    } catch (error) {
        res.status(404).json("error getting users")
    }
})


//add user 

app.get('/adduser', (req, res) => {
    res.render('addUser')
})


app.post('/adduser', async (req, res) => {
    const { username, email, mobile } = req.body
    password = "admin"
    try {

        const newuser = await User.create({ username, email, mobile ,password})
        console.log(newuser);
        res.redirect('/adminpanel')

    } catch (error) {
        console.log(error)
        res.status(400).json('cannot creat user !')
    }
})



//edit user 

app.get('/edituser/:id', async (req, res) => {
    const id = req.params.id
    try {
        const finduser = await User.findById(id)
        if(!finduser)
        {
            return res.status(404).json("user not found")
        }

        res.render('edituser',{finduser})
        console.log("person to edit :",finduser)



    } catch (error) {
        
        console.log("user not found for editing")
    }
})


app.put('/edituser/:id', async (req,res)=>
{
    const id = req.params.id

    try {

        const updateuser = await User.findByIdAndUpdate(id,req.body)
        console.log(updateuser)
        res.redirect('/adminpanel')
        
    } catch (error) {
        
        console.log(error)
    }
})


//delete user




app.delete('/deleteuser/:id', async (req,res)=>
{

    const id = req.params.id
    try {
        const deleteuser = await User.findByIdAndDelete(id)
        console.log("deleted user : ",deleteuser)
        res.redirect('/adminpanel')
    } catch (error) {
        console.log(error);
        
    }
})
























app.listen(3000, () => {
    console.log("server is running in port 3000");

})
