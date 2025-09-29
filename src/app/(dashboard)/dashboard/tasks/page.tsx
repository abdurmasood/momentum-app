export default function TasksPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>
      <p className="text-muted-foreground">
        Manage your tasks and stay organized. This page will be enhanced with task management functionality.
      </p>
      
      <div className="mt-8 space-y-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h3 className="font-medium text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Task management, deadlines, and progress tracking features will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}