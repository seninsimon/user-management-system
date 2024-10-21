const express = require('express')
const mongoose = require('mongoose')
const app = express()
const User = require('./model/userModel')
const db = require('./dbConnection/db')
db()
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const session = require('express-session')
const nocache = require('nocache')
app.use(nocache());
const bcrypt = require('bcrypt');


app.use(express.static('public'))


app.use(session(
    {
        secret: 'my-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }
))


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')




//root route
app.get('/', (req, res) => {
    res.redirect('/login')
})

//register route

app.get('/register', (req, res) => {
    if (req.session.username) {
        res.redirect('/welcome')
    }
    else
    {
        res.render('register')
    }
    
})

app.post('/register', async (req, res) => {
    const { username, password, email, mobile } = req.body
     console.log(`username${username}:password${password}`)
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const registerUser = await User.create({ username, password:hashedPassword, email, mobile })
        console.log(registerUser)
        res.redirect('/login')
    } catch (error) {
        console.log("user not created")
    }

})


//login route

app.get('/login', (req, res) => {

    if(req.session.admin)
    {
         res.redirect('/adminpanel')
    }
    else if (req.session.username) {
        res.redirect('/welcome')
    }
    else {
        res.render('login')
    }

})



app.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {

        if (username == 'admin' && password == "admin") {
            req.session.admin ='admin'
            res.redirect('/adminpanel')
        }
        else {

            const findUser = await User.findOne({ username: username })
            console.log(findUser);

            if (findUser) {

                
                const passwordMatch = await bcrypt.compare(password, findUser.password);
                console.log("boolean val :" ,passwordMatch)
                if (passwordMatch) {
                    req.session.username = username
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
    const name = req.session.username
    if(name)
    {
        res.render('welcome', { username: name })
    }
    else
    {
        res.redirect('/login')
    }
   
})

//logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error in destroying session');
        }

        res.clearCookie('connect.sid');
        console.log('Session destroyed and logged out');
        res.redirect('/login')

    })
})

//admin logout

app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error in destroying session');
        }

        res.clearCookie('connect.sid');
        console.log('Session admin destroyed and logged out');
        res.redirect('/login')

    })
})




//admin panel

app.get('/adminpanel', async (req, res) => {

    
    try {
        if(req.session.admin)
            {
                const users = await User.find()
                // console.log(users)
                res.render('adminPanel', { users })
            }
            else
            {
                res.redirect('/login')
            }


    } catch (error) {
        res.status(404).json("error getting users")
    }
})

// search user

app.get('/adminpanel/searchuser', async (req, res) => {
    const searchQuery = req.query.search;  // Get the search term from the query string

    try {
        if(req.session.admin) {
            // Use a case-insensitive search with regex to match partial input
            const users = await User.find({
                $or: [
                    { username: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            });

            res.render('adminPanel', { users });  // Render the search results in admin panel
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log('Error while searching users:', error);
        res.status(500).json("Server error occurred while searching");
    }
});




//add user 

app.get('/adduser', (req, res) => {
    if(req.session.admin)
    {
        res.render('addUser')
    }
    else
    {
        res.redirect('/login')
    }
    
})


app.post('/adduser', async (req, res) => {
    const { username, email, mobile ,password } = req.body
    
    try {
  
        const hashedPassword = await bcrypt.hash(password, 10);
        const newuser = await User.create({ username, email, mobile, password : hashedPassword })
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
        if(req.session.admin)
        {
            const finduser = await User.findById(id)
            if (!finduser) {
                return res.status(404).json("user not found")
            }
    
            res.render('edituser', { finduser })
            console.log("person to edit :", finduser)
        }
        else
        {
            res.redirect("/login")
        }
       



    } catch (error) {

        console.log("user not found for editing")
    }
})


app.put('/edituser/:id', async (req, res) => {
    const id = req.params.id

    try {

        const updateuser = await User.findByIdAndUpdate(id, req.body)
        console.log(updateuser)
        res.redirect('/adminpanel')

    } catch (error) {

        console.log(error)
    }
})


//delete user

app.delete('/deleteuser/:id', async (req, res) => {

    const id = req.params.id
    try {
        const deleteuser = await User.findByIdAndDelete(id)
        console.log("deleted user : ", deleteuser)
        res.redirect('/adminpanel')
    } catch (error) {
        console.log(error);

    }
})


//search users

  

















app.listen(3000, () => {
    console.log("server is running in port 3000");

})
