// Task Status
export type TaskStatus = 'todo' | 'in_progress' | 'completed'

// Traffic Light Colors
export type TrafficLightColor = 'green' | 'yellow' | 'red'

// User Role
export type UserRole = 'admin' | 'user'

// User Interface
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  position?: string
  created_at: string
}

// Task Interface
export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string // UUID in database
  status: TaskStatus
  progress: number
  deadline: string
  traffic_light: TrafficLightColor
  memo?: string // Status update memo
  created_at: string
  updated_at: string
}

// Feedback Interface
export interface Feedback {
  id: string
  task_id: string
  from_user_id: string
  to_user_id: string
  message: string
  is_read: boolean
  created_at: string
}

// Notification Interface
export interface Notification {
  id: string
  user_id: string
  type: 'feedback' | 'task_update' | 'deadline_alert'
  title: string
  message: string
  is_read: boolean
  created_at: string
}

