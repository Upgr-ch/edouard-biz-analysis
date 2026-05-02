
-- Conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nouvelle analyse',
  current_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS policies for chat_messages (through conversation ownership)
CREATE POLICY "Users can view messages of own conversations"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in own conversations"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete messages of own conversations"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

-- Index for fast lookups
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
