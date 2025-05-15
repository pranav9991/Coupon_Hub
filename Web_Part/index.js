const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Passport configuration
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
const { userRegistrationSchema } = require("./schema.js");
const couponListing = require('./models/couponListing.js');
const User = require('./models/user.js');

const wrapAsync = require("./utils/WrapAsync.js");
// const MONGOURL = "mongodb+srv://aj417650:crK2wj9mSv7tYnix@cluster0.wxwa6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const MONGOURL = "mongodb+srv://aj417650:crK2wj9mSv7tYnix@cluster0.wxwa6.mongodb.net/coupon_hub?retryWrites=true&w=majority&appName=Cluster0"

const app = express();
const PORT = process.env.PORT || 8000; // Fallback to env var or 8000

main().then(() => {
  console.log("Database Connected");
}).catch((err) => {
  console.log(err);
  console.log("Error in Database Connection");
})

async function main() {
  try {
    await mongoose.connect(MONGOURL, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Successfully connected to MongoDB Atlas');
    
    const conn = mongoose.connection;
    console.log('Connection details:', {
      host: conn.host,
      port: conn.port,
      database: conn.name,
      readyState: conn.readyState
    });

    // Test database operations
    try {
      const testDoc = new User({
        name: 'Test User',
        email: 'test@test.com',
        phone: '0000000000',
        password: 'test123'
      });
      await testDoc.save();
      console.log('Test document saved successfully');
      await User.deleteOne({ email: 'test@test.com' });
      console.log('Test document cleaned up');
    } catch (testErr) {
      console.error('Database operation test failed:', testErr);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Middleware for session and flash messages
app.use(session({
  secret: "yourSecretKey", 
  resave: false,
  saveUninitialized: true
}));
const flash = require('connect-flash');
app.use(flash());

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Body parser middleware - must come before routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files with consistent paths
app.use('/css', express.static(path.join(__dirname, 'public', 'CSS')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/image', express.static(path.join(__dirname, 'public', 'image')));
app.use('/photos', express.static(path.join(__dirname, 'public', 'photos')));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", wrapAsync(async (req, res) => {
  try {
      // Get recommendations
      const recommendedCoupons = await couponListing.aggregate([
          { $match: { /* your filters */ } },
          { $sample: { size: 5 } } // Get 5 random coupons for now
      ]);
      
      res.render("index", { 
          recommendedCoupons,
          messages: req.flash()
      });
  } catch (error) {
      console.error("Error loading home page:", error);
      res.status(500).send("Error loading page");
  }
}));

// Route: Sign In Page
app.get("/signin", (req, res) => {
  res.render("signin");
});

// Route: Sign Up Page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Route: Logout (Destroy Session)
app.get("/signout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Route: Sign In (Using Passport)
app.post("/validateUser", (req, res, next) => {
  console.log('Login attempt:', {
    email: req.body.email,
    time: new Date().toISOString()
  });
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', {
        error: err,
        stack: err.stack,
        time: new Date().toISOString()
      });
      return next(err);
    }
    if (!user) {
      console.log('Login failed:', {
        reason: info.message || 'Invalid credentials',
        email: req.body.email, 
        time: new Date().toISOString()
      });
      req.flash('error', info.message || 'Invalid email or password');
      return res.redirect('/signin');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', {
          error: err,
          userId: user._id,
          time: new Date().toISOString()
        });
        return next(err);
      }
      console.log('Login successful:', {
        userId: user._id,
        email: user.email,
        time: new Date().toISOString()
      });
      return res.redirect('/');
    });
  })(req, res, next);
});

// Route: Register User (Signup Handling)
app.post("/addUser", wrapAsync(async (req, res) => {
  console.log(`[${new Date().toISOString()}] Registration attempt`);
  console.debug('Request headers:', req.headers);
  console.debug('Request body:', req.body);
  if (!req.body) {
    console.error('No request body received');
    return res.status(400).json({ error: "Request body is missing" });
  }
  console.log('1. Validating registration data:', req.body);
  const { error } = userRegistrationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.error('Validation failed:', error.details);
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).render("signup", { 
      error: errorMessages.join(', '),
      formData: req.body // Preserve form data on error
    });
  }

  console.log('2. Extracting form data');
  const { name, email, phone, password } = req.body;
  console.log('Extracted data:', {name, email, phone});
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).render("signup", { error: "Email already registered" });
  }

  console.log('3. Hashing password');
  let newUser;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    console.log('4. Creating new user document');
    newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });
    console.log('User document created:', newUser);
  } catch (hashErr) {
    console.error('Error hashing password:', hashErr);
    throw hashErr;
  }

  try {
    console.log('Attempting to save user to database...');
    console.log('User document to save:', newUser);
    
    // Validate the document before saving
    const validationError = newUser.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError.errors);
      throw validationError;
    }

    const savedUser = await newUser.save();
    console.log('User saved successfully. Document:', savedUser);
    
    // Verify the save operation
    const verifyUser = await User.findById(savedUser._id);
    if (!verifyUser) {
      console.error('CRITICAL: User document not found after save!');
      req.flash("error", "Registration failed - please try again");
      return res.redirect("/signup");
    }

    // Log in user using passport
    req.login(savedUser, (err) => {
      if (err) {
        console.error('Login after registration failed:', err);
        return res.redirect("/signup");
      }
      console.log('User logged in after registration');
      return res.redirect("/");
    });
    
  } catch (err) {
    console.error('SAVE OPERATION FAILED:');
    console.error('Error:', err);
    console.error('Error code:', err.code);
    console.error('Error name:', err.name);
    console.error('Full error:', JSON.stringify(err, null, 2));
    
    if (err.code === 11000) {
      req.flash("error", "Email already registered");
    } else {
      req.flash("error", "Registration failed - please try again");
    }
    return res.redirect("/signup");
  }
}));

// Get all coupons
app.get("/allCoupons", async (req, res) => {
  try {
    const coupons = await couponListing.find({ is_redeemed: { $ne: 'off' } });

    res.render("allCoupons", { coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).send("Error loading coupons");
  }
});

// Coupon details route
app.get("/coupons/:id", async (req, res) => {
  try {
    const coupon = await couponListing.findById(req.params.id);
    if (!coupon) {
      return res.status(404).send("Coupon not found");
    }
    res.render("couponDetails", { coupon });
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    res.status(500).send("Error loading coupon details");
  }
});

// Handle coupon purchase with enhanced logging

app.get("/search", wrapAsync(async (req, res) => {
  const searchQuery = req.query.search;
  try {
      const coupons = await couponListing.find({
          $or: [
              { Title: { $regex: searchQuery, $options: 'i' } },
              { organizationName: { $regex: searchQuery, $options: 'i' } },
              { code: { $regex: searchQuery, $options: 'i' } },
              { category: { $regex: searchQuery, $options: 'i' } }
          ]
      });
      res.render("allCoupons", { coupons });
  } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).send("Error loading coupons");
  }
}));

app.post("/allCoupons", wrapAsync(async (req, res) => {
  try {
    console.log('Raw coupon submission:', req.body);
    
    // Check if user is logged in
    if (!req.isAuthenticated()) {
      req.flash("error", "You must be logged in to submit coupons");
      return res.redirect("/signin");
    }

    const { code, organizationName, category, Title, discount, price, expiry, description } = req.body;
    
    // Validate required fields
    if (!code || !code.trim()) {
      throw new Error("Coupon code is required");
    }

    if (code.length < 4) {
      throw new Error("Coupon code must be at least 4 characters");
    }

    if (!organizationName) {
      throw new Error("Organization name is required");
    }

    // Set default values
    const orgImages = {
      Dominos: '/photos/dominos.png',
      Swiggy: '/photos/swiggy.png',
      Zomato: '/photos/zomato.jpg',
      Dell: '/photos/dell.webp',
      One8: '/photos/one8.jpg',
      Croma: '/photos/croma.jpg'
    };

    const newCoupon = new couponListing({
      code: code.trim(),
      organizationName: organizationName.trim(),
      category: category?.trim() || 'General',
      Title: Title?.trim() || 'No title provided',
      discount: discount?.trim() || '0%',
      price: price || 0,
      expiry: expiry || new Date(Date.now() + 30*24*60*60*1000), // Default: 30 days from now
      image: orgImages[organizationName] || '/photos/default.png',
      description: description?.trim() || 'No terms specified',
      is_redeemed: 'on'
    });

    // Validate before saving
    const validationError = newCoupon.validateSync();
    if (validationError) {
      throw validationError;
    }

    await newCoupon.save();
    req.flash("success", "Coupon submitted successfully!");
    return res.redirect("/allCoupons");
    
  } catch (err) {
    console.error('Coupon submission error:', err);
    req.flash("error", err.message || "Failed to save coupon. Please try again.");
    return res.redirect("/allCoupons");
  }
}));

// Route to check all users in database (for debugging)
app.get("/checkUsers", wrapAsync(async (req, res) => {
  try {
    const users = await User.find({});
    console.log('Users in database:', users);
    res.json({ 
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      users 
    });
  } catch (err) {
    console.error('Error checking users:', err);
    res.status(500).json({ error: err.message });
  }
}));

app.get("/recommend", wrapAsync(async (req, res) => {
  try {
      // Get user's browsing history (you'll need to implement this)
      // const userId = req.user?.id; // If you have user authentication
      
      // Advanced recommendations based on multiple factors
      const recommendedCoupons = await couponListing.aggregate([
          {
              $match: {
                  // Add any filters here (e.g., valid dates)
                  // date: { $gte: new Date() }
              }
          },
          {
              $addFields: {
                  popularityScore: {
                      $add: [
                          { $multiply: [{ $toInt: "$is_redeemed" }, 5] }, // Redeemed coupons get higher score
                          { $cond: [{ $eq: ["$OrganizationName", "Dominos"] }, 2, 0] }, // Example: boost Dominos
                          { $cond: [{ $eq: ["$couponType", "Food"] }, 1, 0] } // Example: boost Food category
                      ]
                  }
              }
          },
          { $sort: { popularityScore: -1, date: -1 } },
          { $limit: 5 }
      ]);
      
      res.render("index", { recommendedCoupons });
  } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).send("Error loading recommendations");
  }
}));

// Enhanced error logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Detailed error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Headers:', req.headers);
  console.error('Params:', req.params);
  console.error('Query:', req.query);
  console.error('Body:', req.body);
  console.error('Error:', err);
  console.error('Stack:', err.stack);

  // Send appropriate error response
  if (req.accepts('json')) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    res.status(500).render('error', {
      message: 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
});

// Start server with recursive port handling
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
 });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};


const axios = require('axios'); // Ensure axios is installed

// Chatbot API URL
const CHATBOT_API_URL = 'http://127.0.0.1:5000/chatbot';

// Chatbot Route - Render Chat Interface
app.get("/chatbot", wrapAsync(async (req, res) => {
  // Initialize session messages if not present
  if (!req.session.chatMessages) {
    req.session.chatMessages = [];
  }
  res.render("chatbot", {
    messages: req.session.chatMessages,
    flashMessages: req.flash()
  });
}));

// Chatbot Route - Handle User Message
app.post("/chatbot", wrapAsync(async (req, res) => {
  const userInput = req.body.message;
  if (!userInput || !userInput.trim()) {
    req.flash('error', 'Please enter a message.');
    return res.redirect('/chatbot');
  }

  // Initialize session messages if not present
  if (!req.session.chatMessages) {
    req.session.chatMessages = [];
  }

  // Add user message
  req.session.chatMessages.push({ role: 'user', content: userInput });

  // Call Flask API
  try {
    const response = await axios.post(CHATBOT_API_URL, { message: userInput }, { timeout: 5000 });
    const botReply = response.data.response || 'Sorry, I couldn’t process that request.';
    req.session.chatMessages.push({ role: 'assistant', content: botReply });
  } catch (error) {
    console.error('Chatbot API error:', error);
    req.session.chatMessages.push({ role: 'assistant', content: 'Error: Could not connect to the chatbot server.' });
  }

  res.redirect('/chatbot');
}));


// Handle coupon purchase
// Handle coupon purchase
// Handle coupon purchase
// SERVER SIDE ROUTE
app.post("/coupons/:id/purchase", wrapAsync(async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Purchase attempt for coupon ${req.params.id}`);
    console.log('Request details:', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Validate coupon ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.warn('Invalid coupon ID:', req.params.id);
      req.flash('error', 'Invalid coupon ID');
      return res.redirect('/allCoupons');
    }

    // Query coupon
    const coupon = await couponListing.findById(req.params.id);
    console.log('Coupon found:', coupon ? 'Yes' : 'No');
    
    if (!coupon) {
      console.warn('Coupon not found:', req.params.id);
      req.flash('error', 'Coupon not found');
      return res.redirect('/allCoupons');
    }

    console.log('Redemption status check - is_redeemed:', coupon.is_redeemed);
    
    // Fix the inverted logic: Assuming 'off' means "redeemed" in your system
    if (coupon.is_redeemed === 'off') {
      console.log('Coupon already redeemed');
      req.flash('error', 'This coupon has already been redeemed');
      return res.redirect(`/coupons/${req.params.id}`);
    }

    // Mark as redeemed
    console.log('Marking coupon as redeemed...');
    coupon.is_redeemed = 'off';
    await coupon.save();
    console.log('Coupon marked as redeemed successfully');

    // Use redirect instead of render to avoid potential template issues
    console.log('Redirecting to confirmation page...');
    return res.render('purchaseConfirmation', { coupon });
    
  } catch (error) {
    console.error('Error processing purchase:', error.message, error.stack);
    req.flash('error', 'Error processing purchase: ' + error.message);
    return res.redirect(`/coupons/${req.params.id}`);
  }
}));

// Add a new route to handle the confirmation page
app.get('/purchase-confirmation/:id', wrapAsync(async (req, res) => {
  try {
    const coupon = await couponListing.findById(req.params.id);
    console.log(coupon)
    if (!coupon) {
      req.flash('error', 'Coupon not found');
      return res.redirect('/allCoupons');
    }
    return res.render('purchaseConfirmation', { coupon });
  } catch (error) {
    console.error('Error displaying confirmation:', error.message, error.stack);
    req.flash('error', 'Error displaying confirmation: ' + error.message);
    return res.redirect('/allCoupons');
  }
}));
// Start the server
startServer(PORT);
