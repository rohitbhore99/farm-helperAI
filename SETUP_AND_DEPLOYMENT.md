# 🚀 Farm Helper AI - Setup & Deployment Guide

## Prerequisites

- Node.js 16+ installed
- npm or bun package manager
- Supabase account (free tier available)
- Git (optional)

---

## Step 1: Environment Setup

### 1.1 Create `.env.local` file

Create a file named `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

### 1.2 Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing one
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## Step 2: Database Setup

### 2.1 Create Tables

Go to Supabase Dashboard → **SQL Editor** and run:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Consultation',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

### 2.2 Enable Row Level Security (RLS)

```sql
-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

---

## Step 3: Storage Setup

### 3.1 Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **Create a new bucket**
3. Name it: `chat_uploads`
4. Make it **Public** (for image URLs)
5. Click **Create bucket**

### 3.2 Set Storage Policies

Go to **Storage → chat_uploads → Policies** and add:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat_uploads' AND
    auth.role() = 'authenticated'
  );

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat_uploads');
```

---

## Step 4: Authentication Setup

### 4.1 Enable Email Authentication

1. Go to Supabase Dashboard → **Authentication → Providers**
2. Enable **Email** provider
3. Configure email settings if needed

### 4.2 Configure Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Add your app URLs:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

---

## Step 5: Backend Function Setup

### 5.1 Create Edge Function

1. Go to Supabase Dashboard → **Edge Functions**
2. Create new function: `farmer-chat`
3. Copy the code from `supabase/functions/farmer-chat/index.ts`

### 5.2 Set Environment Variables

In the Edge Function settings, add:

```
LOVABLE_API_KEY=your_lovable_api_key_here
```

Get your Lovable API key from [Lovable Dashboard](https://lovable.dev)

---

## Step 6: Local Development

### 6.1 Install Dependencies

```bash
npm install
```

### 6.2 Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6.3 Test the App

1. Sign up with an email
2. Try quick actions
3. Upload an image
4. Check console for any errors

---

## Step 7: Build for Production

### 7.1 Build the Project

```bash
npm run build
```

### 7.2 Preview Production Build

```bash
npm run preview
```

### 7.3 Deploy

Choose your hosting platform:

#### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### Option B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option C: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and run:

```bash
docker build -t farm-helper-ai .
docker run -p 3000:3000 farm-helper-ai
```

---

## Troubleshooting

### Issue: "Supabase URL not found"
**Solution**: Check `.env.local` file exists and has correct values

### Issue: "Storage bucket not found"
**Solution**: Create `chat_uploads` bucket in Supabase Storage

### Issue: "Image upload fails"
**Solution**: 
- Check bucket is public
- Check file size < 5MB
- Check file is valid image format

### Issue: "AI response not working"
**Solution**:
- Check `LOVABLE_API_KEY` is set
- Check Edge Function is deployed
- Check API key is valid

### Issue: "Authentication fails"
**Solution**:
- Check email provider is enabled
- Check redirect URLs are configured
- Check `.env.local` has correct keys

---

## Environment Variables Checklist

- [ ] `VITE_SUPABASE_URL` - Set
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Set
- [ ] `LOVABLE_API_KEY` - Set in Edge Function
- [ ] Database tables created
- [ ] Storage bucket created
- [ ] RLS policies enabled
- [ ] Email authentication enabled

---

## Testing Checklist

- [ ] Sign up works
- [ ] Sign in works
- [ ] Quick actions work
- [ ] Text messages work
- [ ] Image upload works
- [ ] Image analysis works
- [ ] Location services work
- [ ] Conversation history saves
- [ ] Delete conversation works
- [ ] No console errors

---

## Performance Optimization

### 1. Enable Caching

```bash
npm run build
# Check dist folder size
```

### 2. Optimize Images

- Keep images under 5MB
- Use JPG/PNG format
- Compress before upload

### 3. Database Optimization

- Indexes are created
- RLS policies are optimized
- Queries are efficient

---

## Security Checklist

- [ ] RLS policies enabled
- [ ] Storage bucket policies set
- [ ] API keys not exposed
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Input validation enabled
- [ ] Error messages don't leak info

---

## Monitoring & Logs

### View Logs

```bash
# Supabase logs
supabase logs --function farmer-chat

# Browser console
# Press F12 → Console tab
```

### Monitor Performance

- Check Supabase dashboard for usage
- Monitor Edge Function invocations
- Check storage usage

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Database tables created
- [ ] Storage bucket created
- [ ] Edge Function deployed
- [ ] Build successful
- [ ] No console errors
- [ ] All features tested
- [ ] Performance optimized
- [ ] Security verified

---

## Support & Help

### Common Issues

1. **Build fails**: Run `npm install` again
2. **Env vars not working**: Restart dev server
3. **Database errors**: Check SQL syntax
4. **Upload fails**: Check bucket permissions

### Resources

- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)

---

## Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Deploy to production
4. ✅ Monitor performance
5. ✅ Gather user feedback
6. ✅ Plan improvements

---

**Status**: ✅ Ready for Deployment

🌾 **Farm Helper AI - Your Intelligent Farming Companion** 🌾
