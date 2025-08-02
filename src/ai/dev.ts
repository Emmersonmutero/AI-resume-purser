import { config } from 'dotenv';
config();

import '@/ai/flows/extract-resume-data.ts';
import '@/ai/flows/generate-resume-summary.ts';
import '@/ai/flows/match-resume-to-jobs.ts';