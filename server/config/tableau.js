import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const TABLEAU_CONFIG = {
  embeddedId: process.env.TABLEAU_EMBEDDED_ID,
  keyId: process.env.TABLEAU_EMBEDDED_KEY_ID,
  secret: process.env.TABLEAU_EMBEDDED_SECRET,
  userEmail: process.env.TABLEAU_USER_EMAIL,
  domain: process.env.TABLEAU_DOMAIN,
  siteId: process.env.TABLEAU_SITE_ID
};

export function generateTableauJWT() {
  const header = {
    'alg': 'HS256',
    'typ': 'JWT',
    'kid': TABLEAU_CONFIG.keyId,
    'iss': TABLEAU_CONFIG.embeddedId
  };

  const payload = {
    'iss': TABLEAU_CONFIG.embeddedId,
    'exp': Math.floor(Date.now() / 1000) + (10 * 60), // 10 minutes
    'jti': uuidv4(),
    'aud': 'tableau',
    'sub': TABLEAU_CONFIG.userEmail,
    'scp': ['tableau:views:embed', 'tableau:insights:embed']
  };

  return jwt.sign(payload, TABLEAU_CONFIG.secret, { header });
}

export function buildTableauUrl(dashboardPath, isMobile = false) {
  const baseUrl = `https://${TABLEAU_CONFIG.domain}/t/${TABLEAU_CONFIG.siteId}/views`;
  const viewMode = isMobile ? ':iphone' : '';
  return `${baseUrl}/${dashboardPath}${viewMode}`;
}

export default TABLEAU_CONFIG;