export interface Notification {
  id: string;
  avatar: string;
  fallback: string;
  text: string;
  time: string;
}

/**
 * Mock notifications data for development
 */
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
];

/**
 * Fetch notifications from API or return mock data based on environment
 */
export async function getNotifications(): Promise<Notification[]> {
  // In production, this would fetch from an API
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL) {
    try {
      // TODO: Implement actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`);
      // const data = await response.json();
      // return data;
      
      // For now, return mock data even in production until API is implemented
      return MOCK_NOTIFICATIONS;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return MOCK_NOTIFICATIONS; // Fallback to mock data
    }
  }
  
  // Return mock data for development
  return MOCK_NOTIFICATIONS;
}

/**
 * Synchronous version that returns mock data immediately
 * Use this for components that need data synchronously during render
 */
export function getNotificationsSync(): Notification[] {
  return MOCK_NOTIFICATIONS;
}