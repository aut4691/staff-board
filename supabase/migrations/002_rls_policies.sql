-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tasks Policies
-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (assigned_to = auth.uid());

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (assigned_to = auth.uid());

-- Admins can insert/update/delete any task
CREATE POLICY "Admins can manage all tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Feedbacks Policies
-- Users can view feedbacks sent to them
CREATE POLICY "Users can view received feedbacks"
  ON public.feedbacks FOR SELECT
  USING (to_user_id = auth.uid());

-- Admins can view all feedbacks
CREATE POLICY "Admins can view all feedbacks"
  ON public.feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert feedbacks
CREATE POLICY "Admins can create feedbacks"
  ON public.feedbacks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update feedbacks sent to them (mark as read)
CREATE POLICY "Users can update received feedbacks"
  ON public.feedbacks FOR UPDATE
  USING (to_user_id = auth.uid());

-- Comments Policies
-- Users can view comments on feedbacks they received
CREATE POLICY "Users can view comments on their feedbacks"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks
      WHERE feedbacks.id = comments.feedback_id
      AND feedbacks.to_user_id = auth.uid()
    )
  );

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert comments on feedbacks they received
CREATE POLICY "Users can create comments on their feedbacks"
  ON public.comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.feedbacks
      WHERE feedbacks.id = comments.feedback_id
      AND feedbacks.to_user_id = auth.uid()
    )
  );

-- Notifications Policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications (via service role)
-- This will be handled by database functions/triggers

