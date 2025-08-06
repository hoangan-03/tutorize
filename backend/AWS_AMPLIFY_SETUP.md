# AWS Amplify Deployment Guide - Google Service Account

## 🚀 Deploying to AWS Amplify

### Step 1: Prepare Your JSON Credentials

First, convert your service account JSON to a single line string:

```bash
# In your local machine where you have the JSON file
cat tutorize-e1b9136198de.json | jq -c .
```

This will output something like:

```json
{"type":"service_account","project_id":"tutorize","private_key_id":"e1b9136198de...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...","client_email":"tutorize2025@tutorize.iam.gserviceaccount.com",...}
```

### Step 2: Set Environment Variables in Amplify Console

1. **Go to AWS Amplify Console**
   - Navigate to your app
   - Go to "App settings" → "Environment variables"

2. **Add Environment Variables**
   Click "Manage variables" and add:

   | Variable                      | Value                                                    |
   | ----------------------------- | -------------------------------------------------------- |
   | `GOOGLE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account","project_id":"tutorize",...}` |
   | `GOOGLE_DRIVE_FOLDER_ID`      | `your_folder_id_here`                                    |

3. **Important Notes:**
   - Use the single-line JSON string (no newlines)
   - Don't include quotes around the JSON in Amplify console
   - Make sure the JSON is valid (test with `jq` command)

### Step 3: Build Settings (Optional)

If you need to install the `googleapis` package, make sure your `package.json` includes it:

```json
{
  "dependencies": {
    "googleapis": "^latest"
  }
}
```

### Step 4: Deploy

```bash
# Push your code to trigger deployment
git add .
git commit -m "Add Google Drive upload functionality"
git push origin main
```

## 📱 Alternative: Using AWS Amplify CLI

If you prefer using the CLI:

```bash
# Install Amplify CLI if not already installed
npm install -g @aws-amplify/cli

# Configure environment variables
amplify env add
# Choose your environment name (e.g., 'prod')

# Add environment variables
amplify env update

# Deploy
amplify publish
```

## 🔧 Environment Variable Configuration

### Method 1: Amplify Console (Recommended)

1. **AWS Amplify Console** → Your App
2. **App settings** → **Environment variables**
3. **Manage variables** → **Add variable**

```
Key: GOOGLE_SERVICE_ACCOUNT_JSON
Value: {"type":"service_account","project_id":"tutorize","private_key_id":"e1b9136198de86c571f63f142f5fd418d5b4858c","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwtROqutw67LZ6\nApDoRXw65vppTe2s4lsG4DtQIJlxdvzGOBcA3/sEptK3PsjTTkijMjLHscXuoID+\ndN83cFv8T68FWUZimAEj5S80zjW+5q5LJ8X4rvv3P/4MPBYtRZwKrwJrZyc18GtJ\n+s/RFfH0ZE7Oe52Kmkk1El55ewa/XBkN3cJljOKAk6keEllvTqdz6Ov9GjIPN0BY\nql9wwA/lfEm2XE4iq/unf1ozCw7ZmI0EHCZJHB0X1fe19WTvShUfHFhoYTqOdl8y\nDTbysX814m3zVAeZav3stRP+TdzpyKLN59HG6XqxeKmsgKsqdeFarsxxoskpXFAl\nR6avKAxTAgMBAAECggEAB0f6PsP+VtRfk1jhuImMbnhUlgDLUHqBh7IAMfN17Ntk\nbicQqCi3FQT8b8KI9CrfeDRMUMlQUd5rf/5cjNIbaDUcVvaCnYWxDAzhp8pdtgBy\nfT1vBnLwhhO/YM1lBkDQdHw95Wx6Q5Ek7yuWYyYp6WR+/syHKgUJMA1bSTZxiXJk\nF8TZBZZb0L7hlQ7zSNIRTqgE9+EvUE+kJypMKwrJwMFHJ/mCxUdFaXSqzwcAOMVP\nAllFGGggelFwWfRj7ufwN9fxrUx4Liksk5NEdLohADtDELdyMbf6wSyuO3yxacH4\nbN7DZ3DHmexwA4WEdAoIm5MWufYYlFDMktEPPFd3QQKBgQDYd+IBNdLKjCn58FgT\nG4n7MoJTyw2YOjm5O0LydopHE3zl5F0Iq2n4blvqm6HBozq9njJx6cJysFI2zZr+\nZVr3V5VhgBUzj2adh96ytmsSA/A4UHXcv3luY03TTF1iYGb3GVNvnYSiluFjo5CN\n16jZKVDIWV9Vnv0wVhZ8/ULKoQKBgQDQ+lPsudrQw4ZgpkanemLXR7U0n+vSjnat\ntAL80vsOG6rrD+RwqQ0FlBWjRdIBMOmeuwe6QOzw9f45vXJlQFBbBvW/5ok8cbxU\nnVgoY3d9q21ry8XaWcjxB8xB1I/Ythqs6YqQ5GckeQ/dZLU7lFsvEiAqGtAVOtpV\ndjkwVV9GcwKBgQCtScszDNNiMjKoUy8unK0o2pZaXgLUCkiLcFV3pE2t+HvTzaxs\ndEyxBCew+EXVrcYoZawcZPW0ulIWbSHW5Wyc9RAwrUhLrlCHa21rw3yTP3PeoQq5\nXM7o/7YdoNRhHKtQxIV2pLK5Ne/Yw+fEpRAWSGzS9jjLYitttnzqMhR2AQKBgDiB\nx9m186YJiLdvnqFApaNin2voZkLcBNk5WKl2fy40awX+mR2hiITeou8wPPXXfQRP\nvGovjiIl0iVYxar9Nf03J5JJSwiOFIeouCLLqo7PoNnKEujU6FHMcv3F9VN7AkGJ\nMM+3AvDIz3Jk/eBrYDCdLRdVgriK3mjHe/VG0GljAoGAM9mlvIgv2Hdp0h77NHgm\nXmcIqBm64e9mXwSky5Bu9T6JmuhDR4k+isMDPRzG7dgeZxSBDLdp2W3givds6Fbt\n1yuZzRLiutA/gG4eMhtMpqxSzTdgvbyZ6Vf0kDu3v0Hfmf1kw6K0psXUmr7QNImY\n1VFQoZkGJbOIB4Irzy8tuMQ=\n-----END PRIVATE KEY-----\n","client_email":"tutorize2025@tutorize.iam.gserviceaccount.com","client_id":"103848453265248160704","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/tutorize2025%40tutorize.iam.gserviceaccount.com","universe_domain":"googleapis.com"}

Key: GOOGLE_DRIVE_FOLDER_ID
Value: your_folder_id_here
```

### Method 2: Using amplify.yml Build Spec

Create/update `amplify.yml` in your project root:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    appRoot: frontend
  - backend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
    appRoot: backend
```

## 🔍 Testing Your Deployment

### 1. Check Environment Variables

After deployment, you can verify your environment variables are set:

```javascript
// Add temporary logging in your service (remove after testing)
console.log(
  'GOOGLE_SERVICE_ACCOUNT_JSON exists:',
  !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
);
console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
```

### 2. Test Upload Endpoint

```bash
# Test your deployed endpoint
curl -X POST https://your-amplify-app.amplifyapp.com/api/upload/image \
  -H "Authorization: Bearer your_jwt_token" \
  -F "file=@test-image.jpg" \
  -F "exerciseId=123"
```

## 🚨 Troubleshooting

### Common Issues:

1. **"JSON Parse Error"**
   - Make sure JSON is on a single line
   - Verify no extra quotes in Amplify console
   - Test JSON validity: `echo 'your_json' | jq .`

2. **"Credentials not configured"**
   - Check environment variable names match exactly
   - Verify variables are set in the correct Amplify environment
   - Redeploy after adding environment variables

3. **"Authentication failed"**
   - Verify service account JSON is complete and valid
   - Check Google Drive API is enabled in your project
   - Ensure service account has proper permissions

### Debug Commands:

```bash
# Validate your JSON locally
cat tutorize-e1b9136198de.json | jq empty && echo "Valid JSON" || echo "Invalid JSON"

# Convert to single line and validate
cat tutorize-e1b9136198de.json | jq -c . | jq empty && echo "Valid compressed JSON"
```

## 🔐 Security Best Practices for Amplify

- ✅ Use environment variables (never commit JSON files)
- ✅ Use different service accounts for dev/staging/prod
- ✅ Limit service account permissions to minimum required
- ✅ Regularly rotate service account keys
- ✅ Monitor Google Cloud audit logs
- ✅ Use separate Google Drive folders per environment

Your Amplify deployment will now securely handle Google Drive uploads without requiring user authentication! 🎉
