import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import healthRouter from './routes/health';
import destinationsRouter from './routes/destinations';
import itineraryRouter from './routes/itinerary';
import authRouter from './routes/auth';
import savedRouter from './routes/saved';
import preferencesRouter from './routes/preferences';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    permittedCrossDomainPolicies: false,
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
  }),
);

app.use(
  cors({
    origin: config.NODE_ENV === 'production' ? config.FRONTEND_ORIGIN : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: false,
  }),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMIT', message: 'Too many requests. Slow down.' },
    },
  }),
);

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

app.use('/api/health', healthRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/auth', authRouter);
app.use('/api/saved', savedRouter);
app.use('/api/preferences', preferencesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
