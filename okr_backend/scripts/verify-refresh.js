import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();
async function run(){
  const client = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, process.env.GMAIL_REDIRECT_URI);
  client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  try{
    const tok = await client.getAccessToken();
    console.log('access token ok:', tok?.token ? 'OK' : JSON.stringify(tok));
  }catch(e){
    console.error('refresh failed:', e?.response?.data || e.message || e);
  }
}
run();