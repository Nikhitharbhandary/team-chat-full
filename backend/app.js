// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors=require("cors");
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const multer = require('multer');
const path = require('path');



// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify your upload directory here
  },
 filename: (req, file, cb) => {
    cb(null, file.originalname); // Save file with original name
  }
});;
const upload = multer({ storage: storage });


const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;
app.use(cors());
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// mongoose.connect('mongodb://localhost:27017/team_chat', {
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(error => console.error('Error connecting to MongoDB', error));
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));
//register

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String
});


//login

const loggedUserSchema = new mongoose.Schema({
  email: String,
  password: String,
  loginTime: { type: Date, default: Date.now }
});


//org

const orgSchema = new mongoose.Schema({
  orgname: String,
    
     email: String,
  
});


//channel

const channelSchema = new mongoose.Schema({
  channelname: String,
   email: String,
    orgname: String  // Add orgname field
  
});


//invite

const inviteSchema = new mongoose.Schema({
  emailid: String,
  channelname: String,
  invitedBy:String,
  orgname:String,
  sentAt: { type: Date, default: Date.now }
});



//userregister

const peopleSchema = new mongoose.Schema({
  name: String,
  phone:String,
  address:String,
  dob: Date,
  email: String,
  password: String,
  invitedBy:String,
  orgname:String

  
});



//userlogin

const loggedPeopleSchema = new mongoose.Schema({
  email: String,
  password: String,
  loginTime: { type: Date, default: Date.now },
  channelName: String ,// Add channelName field
   orgname:String
});

//message
const messageSchema = new mongoose.Schema({
  username: String,
  channelName: String,
  text: String,
  timestamp: Date,
   file: String // Store file name or path here

});

//usermessage
const usermessageSchema = new mongoose.Schema({
  username: String,
  name: String,
  text: String,
  timestamp: Date,
   file: String, // Store file name or path here,
   senderReceiver:String

});


const User = mongoose.model('User', userSchema);
const LoggedUser = mongoose.model('LoggedUser', loggedUserSchema);
const Organization = mongoose.model('Organization', orgSchema);
const Channel = mongoose.model('Channel', channelSchema);
const Invite = mongoose.model('Invite', inviteSchema);
const People = mongoose.model('People', peopleSchema);
const LoggedPeople = mongoose.model('LoggedPeople', loggedPeopleSchema);
const Message = mongoose.model('Message', messageSchema);
const UserMessage = mongoose.model('UserMessage', usermessageSchema);


app.use(bodyParser.json());


//1. registration endpoint
app.post('/register', async (req, res) => {
  try {
 
 const { firstName, lastName, email, password } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





//2. login endpoint

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
 const existingLoggedUser = await LoggedUser.findOne({ email });
    if (!existingLoggedUser) {
      const loggedUser = new LoggedUser({
        email: user.email,
        password: user.password
      });

      await loggedUser.save();
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// forgot password end point
app.put('/update-user', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    // Check if email exists in LoggedUser collection
    const loggedUser = await LoggedUser.findOne({ email });
    if (!loggedUser) {
      return res.status(404).json({ message: 'User not registered' });
    }

    // Update password in LoggedUser collection
    loggedUser.password = newPassword;
    await loggedUser.save();

    // Update password in User collection (if applicable)
    const user = await User.findOne({ email });
    if (user) {
      user.password = newPassword;
      await user.save();
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






// Endpoint to remove the email
app.post('/api/logout', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
// Remove the email from the LoggedUser collection
    await LoggedUser.deleteOne({ email });

    // Remove the email from the LoggedPeople collection
    await LoggedPeople.deleteOne({ email });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});






// 4. Organization creation endpoint
app.post('/organization', async (req, res) => {
  try {
    const { orgname, email } = req.body; // Expect email from request body

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if the user with this email is logged in
    const loggedUser = await LoggedUser.findOne({ email });
    if (!loggedUser) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Check if an organization with the same name already exists
    const existingOrg = await Organization.findOne({ orgname });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists' });
    }

    // Create new organization
    const newOrg = new Organization({
      orgname,
      email // Save the email of the user who created the organization
    });

    await newOrg.save();
    res.status(201).json({ message: 'Organization created successfully', orgname: newOrg.orgname,  email: email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// 5. Fetch organizations endpoint


app.get('/organization', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).send('Email query parameter is required.');
  }

  try {
    const organizations = await Organization.find({ email: email });
    if (organizations.length === 0) {
      return res.status(404).send('No organizations found for this email.');
    }
    res.json(organizations);
  } catch (err) {
    console.error('Error checking organization status:', err);
    res.status(500).send(err);
  }
});


// Route to handle deletion of an organization
app.delete('/organization/:orgname', async (req, res) => {
  try {
    const { orgname } = req.params;
    const { email } = req.query;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if the user with this email is logged in
    const loggedUser = await LoggedUser.findOne({ email });
    if (!loggedUser) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Delete the organization
    const result = await Organization.deleteOne({ orgname });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



//6. create channel endpoint


app.post('/channel', async (req, res) => {
  try {
    const { channelname, orgname, email } = req.body; // Extract email from request body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Fetch the logged-in user's email
    const loggedUser = await LoggedUser.findOne({ email });
    if (!loggedUser) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Check if a channel with the same name already exists
    const existingChannel = await Channel.findOne({ channelname });
    if (existingChannel) {
      return res.status(400).json({ message: 'Channel already exists' });
    }

    // Fetch the organization associated with the logged-in user
    const organization = await Organization.findOne({ email: loggedUser.email });
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found for the logged-in user' });
    }

    // Create new channel
    const newChannel = new Channel({
      channelname,
      email, // Save the email of the user who created the channel
      orgname
    });

    await newChannel.save();
    res.status(201).json({ message: 'Channel created successfully', channel: channelname, email: email, orgname:orgname });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




//7.  Fetch Channels endpoint
app.get('/channels', async (req, res) => {
  const { email, orgname } = req.query;

  if (!email || !orgname) {
    return res.status(400).send('Email and orgname query parameters are required.');
  }

  try {
    const channels = await Channel.find({ email, orgname });
    if (channels.length === 0) {
      return res.status(404).send('No channels found for this email and orgname.');
    }
    res.status(200).json(channels);
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).send(err);
  }
});


// 14. Fetch  usrs

  



// 8. Delete channel route
app.delete('/channels/:channelName', async (req, res) => {
  try {
    const channelName = req.params.channelName;
    
    // Find and delete the channel
    const result = await Channel.deleteOne({ channelname: channelName });
    
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Channel deleted successfully' });
    } else {
      res.status(404).json({ message: 'Channel not found' });
    }
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ message: 'Failed to delete channel' });
  }
});


// 9. Invite people endpoint


// Create Nodemailer transporter using SMTP with secure method
let transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  auth: {
    user: 'nikhitharbhandary07@gmail.com', 
    pass: 'khsn tebu nbyp dkxz' 
  },
  secure: true, // Use SSL
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
}));
// Endpoint to check if an invite exists
app.post('/invite/check', async (req, res) => {
  const { emailid, orgname } = req.body;

  try {
    if (!emailid ||  !orgname) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the invite already exists
    const invite = await Invite.findOne({ emailid, orgname });
    if (invite) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking invite:', error);
    res.status(500).json({ error: 'Failed to check invite' });
  }
});

app.post('/invite', async (req, res) => {
  const { email, channelName, invitedBy, orgname  } = req.body;

  try {
    // Save invitation data to MongoDB
    
   const invitation = new Invite({
      emailid: email,
      channelname: channelName,
      invitedBy :invitedBy ,
      orgname:orgname
    });

    await invitation.save();

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Team Chat" <nikhitharbhandary07@gmail.com>', // sender address
      to: email, // list of receivers
      subject: 'Invitation to ' + channelName, // Subject line
      text: 'You have been invited to join the channel ' + channelName, // plain text body
       html: `
    <p>You have been invited to join the channel <strong>${channelName}</strong>.</p>
    <p>Click <a href="http://localhost:4200/user/userlogin">here</a> to log in and join the channel.</p>
  `  // html body
    });

    console.log('invitation sent successfully: %s', info.messageId);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send invitation email.');
  }
});




//10. User register endpoint


app.use(bodyParser.json());


app.post('/userregister', async (req, res) => {
  try {
 
 const { name, phone,address,dob, email, password } = req.body;

    // Check if user with the same email already exists
    const existingPeople = await People.findOne({ email });
    if (existingPeople) {
      return res.status(400).json({ message: 'Email already exists' });
    }
// Check if email is in the Invite collection
    const invite = await Invite.findOne({ emailid: email });
    let invitedBy = null;
    let orgname = null;

    if (invite) {
      invitedBy = invite.invitedBy;
      orgname = invite.orgname;
    }
      // Create new user
    const newPeople = new People({
      name,
      phone,
      address,
      dob,
      email,
      password,
      invitedBy,  // Add invitedBy field
      orgname      // Add orgname field
    });

    await newPeople.save();
    res.status(201).json(newPeople);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//11.  User login endpoint
app.post('/userlogin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const people = await People.findOne({ email });
    if (!people || people.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const invite = await Invite.findOne({ emailid: email });
    if (!invite) {
      return res.status(400).json({ message: 'No invitation found for this email' });
    }

    // Store the channelName in LoggedPeople
    let loggedPeople = await LoggedPeople.findOne({ email });
    if (!loggedPeople) {
      loggedPeople = new LoggedPeople({
        email: people.email,
        password: people.password,
        channelName: invite.channelname,// Store the channelName
        orgname:invite.orgname
          
      });
    } else {
      loggedPeople.channelName = invite.channelname; // Update the channelName if the user is already logged in
      loggedPeople.orgname=invite.orgname;
    }

    await loggedPeople.save();

    res.status(200).json({ message: 'Login successful',  username: people.name, channelName: invite.channelname,orgname:invite.orgname });
  } catch (error) {
    console.error('Error in /userlogin:', error);
    res.status(500).json({ message: error.message });
  }
});


app.put('/update-people', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    // Check if email exists in LoggedUser collection
    const loggedPeople = await LoggedPeople.findOne({ email });
    if (!loggedPeople) {
      return res.status(404).json({ message: 'User not registered' });
    }

    // Update password in LoggedUser collection
    loggedPeople.password = newPassword;
    await loggedPeople.save();

    // Update password in User collection (if applicable)
    const people = await People.findOne({ email });
    if (people) {
      people.password = newPassword;
      await people.save();
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//12. fetch loggeduser endpoint

app.get('/loggeduser', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).send({ message: 'Email is required' });
  }

  try {
    const user = await LoggedUser.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send({ email: user.email });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});



//13.  Fetch channel name for email endpoint
app.get('/invite', async (req, res) => {
  const { email } = req.query;

  try {
    // Find invitation based on email
    const invite = await Invite.findOne({ emailid: email });

    if (!invite) {
      return res.status(404).json({ message: 'No invitation found for this email' });
    }

    res.status(200).json({ channelName: invite.channelname });
  } catch (error) {
    console.error('Error fetching channel name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// 14. Fetch invited user details(username(name))


app.get('/uusername', async (req, res) => {
  const { email, orgname } = req.query;

  if (!email || !orgname) {
    return res.status(400).send('Email and orgname query parameters are required.');
  }

  try {
    const users = await People.find({ invitedBy: email, orgname }); // Correct filter here
    if (users.length === 0) {
      return res.status(404).send('No users found for this email and orgname.');
    }
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send(err);
  }
});




// 14. Fetch invited user details(userchat)
app.get('/invited-usersp', async (req, res) => {

  try {
    const invites = await Invite.find({});
    const users = [];

    for (const invite of invites) {
      const person = await People.findOne({ email: invite.emailid });
      if (person) {
        users.push({
         id: person._id, // Original MongoDB ID
          username: person.name,
          email: invite.emailid,
          phone: person.phone,
          channelName: invite.channelname
        });
      }
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 14. Fetch invited user details based on email and orgname(admin chat, fetch_user)
app.get('/invited-users', async (req, res) => {
  const { email, orgname } = req.query;

  if (!email || !orgname) {
    return res.status(400).send('Email and orgname query parameters are required.');
  }

  try {
    // Find invites based on email and orgname
    const invites = await Invite.find({ orgname: orgname });

    if (invites.length === 0) {
      return res.status(404).send('No invites found for the given orgname.');
    }

    const users = [];
    for (const invite of invites) {
      const person = await People.findOne({ email: invite.emailid });
      if (person) {
        users.push({
          id: person._id, // Original MongoDB ID
          username: person.name,
          email: invite.emailid,
          phone: person.phone,
          channelName: invite.channelname
        });
      }
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching invited users:', error);
    res.status(500).send('Internal server error');
  }
});


// 15. Update user endpoint
app.put('/users/:id', async (req, res) => {
  try {
    console.log('Update request received for user ID:', req.params.id);
    console.log('Request body:', req.body);

    // Ensure you're passing the correct parameters for update
    const user = await People.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
        channelName: req.body.channelName // Update channelName
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also update the invite collection
    await Invite.findOneAndUpdate(
      { emailid: req.body.email },
      { channelname: req.body.channelName }
    );

    console.log('Updated user:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
});


//16.  Delete user endpoint
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Delete request received for user ID:', userId);

    // Find and delete the user
    const deletedUser = await People.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally, delete related entries in the Invite collection
    await Invite.deleteMany({ emailid: deletedUser.email });

    console.log('Deleted user:', deletedUser);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
});



//17. store message endpoint

app.post('/messages', upload.single('file'), (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  
  const { username, channelName, text, timestamp } = req.body;

 const file = req.file ? req.file.filename : null; // Get the file name if uploaded
 console.log("Nikhitha",req.body.file);

  const newMessage = new Message({ username, channelName, text, timestamp, file:req.body.file });
  newMessage.save()
    .then(savedMessage => {
      res.json(savedMessage);
    })
    .catch(error => {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// 18.  fetch  message end point

app.get('/messages/:channelName', (req, res) => {
  const channelName = req.params.channelName;
  Message.find({ channelName })
    .then(messages => {
      res.json(messages);
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


//19. store message endpoint(username)

app.post('/usermessages', upload.single('file'), (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  
  const { username, name, text, timestamp } = req.body;
   // Determine which to place first based on alphabetical order
  let senderReceiver;
  if (username.localeCompare(name) < 0) {
    senderReceiver = `${username}${name}`;
  } else {
    senderReceiver = `${name}${username}`;
  }

 const file = req.file ? req.file.filename : null; // Get the file name if uploaded
 console.log("Nikhitha",req.body.file);

  const newMessage = new UserMessage({ username, name, text, timestamp,senderReceiver, file:req.body.file});
  newMessage.save()
    .then(savedMessage => {
      res.json(savedMessage);
    })
    .catch(error => {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// 20.  fetch  message end point(username)

app.get('/usermessages', async (req, res) => {
  const senderReceiver = req.query.senderReceiver;

  if (!senderReceiver) {
    return res.status(400).json({ error: 'Missing senderReceiver query parameter' });
  }

  try {
    const messages = await UserMessage.find({ senderReceiver }); // Sort messages by timestamp, descending
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 21 Endpoint to serve uploaded files

// File upload route
// Upload a file
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newMessage = new Message({
      username: req.body.username,
      channelName: req.body.channelName,
      text: req.body.text,
      timestamp: new Date(),
      file: req.file.filename // Save the filename
    });

    await newMessage.save();
    res.status(201).json({ message: 'File uploaded successfully', file: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve static files (optional, if you want to serve uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// 22. Fetch user profile details based on email
app.get('/userprofile', async (req, res) => {
  try {
    const user = await People.findOne({ email: req.query.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//23.  Update profile route

app.put('/updateProfile', async (req, res) => {
  try {
    const updatedUser = await People.findOneAndUpdate(
      { email: req.body.email },
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//24. leave channel for user
// Endpoint to remove the email from collections
app.post('/leave-channel', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Remove the email from the LoggedUser collection
    await LoggedUser.deleteOne({ email });

    // Remove the email from the LoggedPeople collection
    await LoggedPeople.deleteOne({ email });

    // Remove the email from the People collection
    await People.deleteOne({ email });

    // Remove the email from the Invite collection
    await Invite.deleteOne({ emailid: email });

    res.status(200).json({ message: 'Successfully left the channel and removed from records.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
 });
