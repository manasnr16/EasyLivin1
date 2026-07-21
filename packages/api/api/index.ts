/**
 * VERCEL SERVERLESS ENTRY POINT
 *
 * Vercel's Node.js runtime expects a file under /api exporting a request
 * handler — it does not call app.listen() (see src/index.ts, which is the
 * long-running-server entry point used for local dev / non-serverless hosts).
 * Exporting the Express app directly works because Express apps are valid
 * (req, res) handlers.
 */

import 'dotenv/config';
import { createApp } from '../src/app.js';

export default createApp();
