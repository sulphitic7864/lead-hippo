import Stripe from 'stripe';
import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';
let stripe:Stripe|undefined;
export function getStripe(){
  if(!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.includes('replace_me')) throw new HttpError(503,'Stripe is not configured.','STRIPE_NOT_CONFIGURED');
  stripe ??= new Stripe(env.STRIPE_SECRET_KEY);
  return stripe;
}
