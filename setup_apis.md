# 🚀 PANDUAN LENGKAP SETUP API UNTUK SALESCALLERAI

## 📋 RINGKASAN API YANG DIPERLUKAN

### ✅ SUDAH SIAP (BUILT-IN):
- Database & Authentication ✅
- User Management ✅  
- Product Management ✅
- Knowledge Base ✅
- Reports Dashboard ✅
- API Routes Structure ✅

### 🔑 PERLU API KEYS (PILIH SESUAI BUDGET):

## 1. 📞 VOICE CALLING APIs

### OPTION A: RETELL AI (RECOMMENDED - MUDAH SETUP)
**Website**: https://retellai.com
**Cost**: ~$0.10 per minute
**Features**: 
- AI voice calling dengan Malaysian accent
- Built-in speech-to-text
- Natural conversation flow
- Easy integration

**Setup Steps**:
1. Daftar di https://retellai.com
2. Create new agent
3. Configure voice (pilih Malaysian/Singaporean accent)
4. Copy API key dan Agent ID
5. Masukkan ke .env:
```
RETELL_API_KEY="key_xxxxxxxxxx"
RETELL_AGENT_ID="agent_xxxxxxxxxx"
```

### OPTION B: TWILIO VOICE (LEBIH MURAH)
**Website**: https://twilio.com
**Cost**: ~$0.05 per minute
**Features**:
- Voice calling worldwide
- SMS dan WhatsApp
- Flexible configuration

**Setup Steps**:
1. Daftar di https://twilio.com
2. Buy phone number (+60 untuk Malaysia)
3. Get Account SID dan Auth Token
4. Masukkan ke .env:
```
TWILIO_SID="ACxxxxxxxxxx"
TWILIO_TOKEN="xxxxxxxxxx"
TWILIO_PHONE_NUMBER="+60123456789"
```

## 2. 🤖 AI PROCESSING (WAJIB)

### OPENAI API
**Website**: https://openai.com/api
**Cost**: ~$0.002 per 1K tokens (~RM0.01 per conversation)
**Features**:
- GPT-4 untuk conversation
- Whisper untuk speech-to-text
- Malaysian language support

**Setup Steps**:
1. Daftar di https://platform.openai.com
2. Add payment method (minimum $5)
3. Create API key
4. Masukkan ke .env:
```
OPENAI_API_KEY="sk-xxxxxxxxxx"
```

## 3. 📱 WHATSAPP APIs

### OPTION A: WASAPBOT (FREE - LOCAL)
**Cost**: Free (self-hosted)
**Features**: Local WhatsApp bot

**Setup Steps**:
1. Install wasapbot di server
2. Configure endpoint
3. Masukkan ke .env:
```
WASAPBOT_ENDPOINT="http://localhost:3000/wasapbot/sendMessage"
WASAPBOT_API_KEY="your-wasapbot-key"
```

### OPTION B: TWILIO WHATSAPP (OFFICIAL)
**Cost**: ~$0.005 per message
**Features**: Official WhatsApp Business API

**Setup Steps**:
1. Apply WhatsApp Business approval di Twilio
2. Wait for approval (1-2 weeks)
3. Use same Twilio credentials

## 4. 💳 PAYMENT APIs (OPTIONAL)

### UNTUK MALAYSIA: BILLPLZ
**Website**: https://billplz.com
**Cost**: 2.9% per transaction
**Setup Steps**:
1. Daftar business account
2. Get API key
3. Masukkan ke .env:
```
BILLPLZ_SECRET_KEY="xxxxxxxxxx"
```

### UNTUK INTERNATIONAL: STRIPE
**Website**: https://stripe.com
**Cost**: 2.9% + $0.30 per transaction
**Setup Steps**:
1. Daftar Stripe account
2. Get API keys
3. Masukkan ke .env:
```
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxx"
```

## 🎯 RECOMMENDED SETUP UNTUK MALAYSIA

### BUDGET MINIMUM (~RM50/bulan):
```
OPENAI_API_KEY="sk-xxxxxxxxxx"           # RM20/bulan
TWILIO_SID="ACxxxxxxxxxx"                # RM30/bulan
TWILIO_TOKEN="xxxxxxxxxx"
TWILIO_PHONE_NUMBER="+60123456789"
BILLPLZ_SECRET_KEY="xxxxxxxxxx"          # Free setup
```

### BUDGET PREMIUM (~RM100/bulan):
```
OPENAI_API_KEY="sk-xxxxxxxxxx"           # RM20/bulan
RETELL_API_KEY="key_xxxxxxxxxx"          # RM80/bulan
RETELL_AGENT_ID="agent_xxxxxxxxxx"
BILLPLZ_SECRET_KEY="xxxxxxxxxx"          # Free setup
```

## 🚀 CARA SETUP STEP-BY-STEP

### STEP 1: UPDATE .env FILE
```bash
cd /home/code/salescallerai
nano .env
```

### STEP 2: MASUKKAN API KEYS
Copy paste API keys yang sudah didapat ke dalam .env file

### STEP 3: RESTART SERVER
```bash
npm run dev
```

### STEP 4: TEST CALLING SYSTEM
1. Login ke https://salescallerai.lindy.site
2. Masuk ke Reports → Calls
3. Test make call functionality

## 📊 ESTIMASI COST PER BULAN

### SMALL BUSINESS (100 calls/bulan):
- OpenAI: RM20
- Twilio Voice: RM15 (100 calls × 3 min × RM0.05)
- WhatsApp: RM5 (100 messages × RM0.05)
- **Total: RM40/bulan**

### MEDIUM BUSINESS (500 calls/bulan):
- OpenAI: RM50
- Retell AI: RM150 (500 calls × 3 min × RM0.10)
- WhatsApp: RM25
- **Total: RM225/bulan**

### LARGE BUSINESS (2000 calls/bulan):
- OpenAI: RM100
- Retell AI: RM600 (2000 calls × 3 min × RM0.10)
- WhatsApp: RM100
- **Total: RM800/bulan**

## 🎯 NEXT STEPS SETELAH SETUP API

1. **Test Voice Calling** - Make test call
2. **Configure AI Agent** - Update prompts di Knowledge Base
3. **Setup WhatsApp** - Test messaging
4. **Add Payment Gateway** - Setup Billplz/Stripe
5. **Import Leads** - Upload customer database
6. **Train Team** - Onboard sales team

## 🆘 SUPPORT & TROUBLESHOOTING

Jika ada masalah dengan setup API:
1. Check .env file format
2. Verify API keys validity
3. Check network connectivity
4. Review server logs
5. Contact API provider support

