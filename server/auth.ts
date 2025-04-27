import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "employeecrm-secret-key",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      // Replit heeft veilige omgeving, maar in productie zou je dit op true moeten zetten
      secure: false,
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Speciale route voor Firebase-authenticatie synchronisatie
  app.post("/api/firebase-auth", async (req, res, next) => {
    try {
      console.log('Firebase-auth aangeroepen met:', req.body);
      const { email, firebaseUid } = req.body;
      
      if (!email || !firebaseUid) {
        console.log('Email of Firebase UID ontbreekt');
        return res.status(400).json({ message: "Email en Firebase UID zijn vereist" });
      }
      
      // Controleer of de gebruiker al bestaat
      let user = await storage.getUserByUsername(email);
      console.log('Bestaande gebruiker gevonden:', user ? 'Ja' : 'Nee');
      
      if (!user) {
        // Als de gebruiker niet bestaat, maak een nieuwe aan met een willekeurig wachtwoord
        // Dit wachtwoord wordt niet gebruikt, omdat we vertrouwen op Firebase-authenticatie
        const randomPassword = randomBytes(16).toString('hex');
        const hashedPassword = await hashPassword(randomPassword);
        
        user = await storage.createUser({
          username: email,
          password: hashedPassword,
          name: email.split('@')[0] // Gebruik eerste deel van email als naam
        });
        console.log('Nieuwe gebruiker aangemaakt:', user.id);
      }
      
      // Log de gebruiker in door een sessie te maken
      req.login(user, (err) => {
        if (err) {
          console.log('Login error:', err);
          return next(err);
        }
        console.log('Gebruiker ingelogd in sessie:', user.id);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Error in firebase-auth route:', error);
      next(error);
    }
  });
}
