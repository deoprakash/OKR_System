#!/usr/bin/env python3
"""
refreshtoken.py

Run an OAuth2 installed-app flow to obtain a Google OAuth refresh token
for the scope(s) you need (default: gmail.send). Prints the refresh token
to stdout and can optionally save a small env file snippet.

Usage examples:
  python scripts/refreshtoken.py --client-secrets client_secret.json
  python scripts/refreshtoken.py --save-env .env.gmail

If you prefer to provide client id/secret via environment variables, set
`GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` and run without --client-secrets.
"""
import argparse
import json
import os
import sys


try:
    from google_auth_oauthlib.flow import InstalledAppFlow
except Exception:
    print("Missing dependency: google-auth-oauthlib. Install with: pip install google-auth-oauthlib")
    raise


DEFAULT_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def build_flow_from_env(scopes):
    client_id = os.environ.get("GMAIL_CLIENT_ID")
    client_secret = os.environ.get("GMAIL_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise ValueError("GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set when not using a client secrets file")

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"]
        }
    }
    return InstalledAppFlow.from_client_config(client_config, scopes)


def main():
    p = argparse.ArgumentParser(description="Obtain a Google OAuth refresh token for gmail.send (or other scopes)")
    p.add_argument("--client-secrets", help="Path to client_secrets.json (OAuth client credentials)")
    p.add_argument("--scopes", nargs="+", default=DEFAULT_SCOPES, help="Scopes to request")
    p.add_argument("--save-env", help="Save a small .env snippet with GMAIL_REFRESH_TOKEN (optional)")
    p.add_argument("--no-browser", action="store_true", help="Run console (no local browser) auth flow")
    p.add_argument("--port", type=int, default=0, help="Port to use for the local server (default: random). Use 5000 if your client_secrets redirect URI uses port 5000.")
    args = p.parse_args()

    try:
        if args.client_secrets:
            if not os.path.exists(args.client_secrets):
                print(f"Client secrets file not found: {args.client_secrets}")
                sys.exit(2)
            flow = InstalledAppFlow.from_client_secrets_file(args.client_secrets, args.scopes)
        else:
            flow = build_flow_from_env(args.scopes)

        if args.no_browser:
            creds = flow.run_console()
        else:
            creds = flow.run_local_server(port=args.port)

        refresh_token = getattr(creds, "refresh_token", None)
        access_token = getattr(creds, "token", None)

        print("--- OAuth token result ---")
        print("Access token:", access_token)
        if refresh_token:
            print("Refresh token:", refresh_token)
        else:
            print("No refresh token was returned. Note: Google sometimes returns a refresh token only on the first authorization for this client+user. If you previously authorized, revoke access and re-run this script to force issuance.")

        if args.save_env and refresh_token:
            snippet = f"GMAIL_REFRESH_TOKEN={refresh_token}\n"
            with open(args.save_env, "w", encoding="utf-8") as fh:
                fh.write(snippet)
            print(f"Saved refresh token snippet to: {args.save_env}")

        if refresh_token:
            print("\nCopy the refresh token into your backend environment (GMAIL_REFRESH_TOKEN).")
    except Exception as err:
        print("Error during OAuth flow:", err)
        sys.exit(1)


if __name__ == "__main__":
    main()
