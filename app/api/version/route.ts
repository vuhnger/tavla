import { respond } from '@/lib/respond';

export const dynamic = 'force-dynamic';

export const GET = () => respond({ id: process.env.VERCEL_DEPLOYMENT_ID ?? '' });
