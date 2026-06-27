import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Database,
  Activity,
  Cpu,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Play,
  UserCheck,
  UserX,
  Shield,
  FileText,
  Zap,
  Loader2,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  is_approved: boolean;
  is_disabled: boolean;
  created_at: string;
  role: string;
}

interface Dataset {
  id: string;
  name: string;
  type: string;
  status: string;
  file_size: number;
  created_at: string;
  processed_at: string | null;
  error_message: string | null;
}

interface ProcessingJob {
  id: string;
  job_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  datasetsProcessed: number;
  jobsToday: number;
}

const Admin = () => {
  const { user, session, isAdmin, loading: authLoading } = useAdminAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [uploadingDataset, setUploadingDataset] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetType, setDatasetType] = useState<string>("price");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      // Fetch users
      setLoadingUsers(true);
      const usersRes = await supabase.functions.invoke('admin-users', {
        body: { action: 'list_users' },
      });
      if (usersRes.data?.users) {
        setUsers(usersRes.data.users);
      }

      // Fetch stats
      const statsRes = await supabase.functions.invoke('admin-users', {
        body: { action: 'get_stats' },
      });
      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }

      // Fetch datasets
      const datasetsRes = await supabase.functions.invoke('admin-workflow', {
        body: { action: 'get_datasets' },
      });
      if (datasetsRes.data?.datasets) {
        setDatasets(datasetsRes.data.datasets);
      }

      // Fetch jobs
      const jobsRes = await supabase.functions.invoke('admin-workflow', {
        body: { action: 'get_jobs' },
      });
      if (jobsRes.data?.jobs) {
        setJobs(jobsRes.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (isAdmin && session) {
      fetchData();
    }
  }, [isAdmin, session, fetchData]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success("All data refreshed successfully");
    setIsRefreshing(false);
  };

  const handleTriggerJob = async (jobType: string) => {
    setTriggeringJob(jobType);
    try {
      const { data, error } = await supabase.functions.invoke('admin-workflow', {
        body: { action: 'trigger_job', jobType },
      });

      if (error) throw error;

      toast.success(data.message || 'Job completed successfully');
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to trigger job';
      toast.error(errorMessage);
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploadingDataset(true);
    try {
      // Read file content
      const content = await selectedFile.text();

      // Validate schema
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('process-dataset', {
        body: {
          action: 'validate',
          fileContent: content,
          fileType: datasetType,
          fileName: selectedFile.name,
        },
      });

      if (validationError) throw validationError;

      if (!validationResult.valid && validationResult.errors.length > 0) {
        toast.error(`Validation failed: ${validationResult.errors[0]}`);
        setUploadingDataset(false);
        return;
      }

      // Upload to storage
      const filePath = `${datasetType}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create dataset record
      const { data: dataset, error: insertError } = await supabase
        .from('datasets')
        .insert({
          name: selectedFile.name,
          type: datasetType,
          file_path: filePath,
          file_size: selectedFile.size,
          uploaded_by: user?.id,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Process dataset
      await supabase.functions.invoke('process-dataset', {
        body: {
          action: 'process',
          datasetId: dataset.id,
        },
      });

      toast.success(`Dataset uploaded and processed: ${validationResult.count} items`);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload dataset';
      toast.error(errorMessage);
    } finally {
      setUploadingDataset(false);
    }
  };

  const handleUpdateUser = async (updates: {
    isApproved?: boolean;
    isDisabled?: boolean;
    newRole?: string;
  }) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'update_user',
          targetUserId: selectedUser.user_id,
          ...updates,
        },
      });

      if (error) throw error;

      toast.success('User updated successfully');
      setUserDialogOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      toast.error(errorMessage);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">User management, dataset uploads, and workflow control</p>
        </div>
        <Button variant="neon" className="gap-2" onClick={handleRefreshAll} loading={isRefreshing}>
          {!isRefreshing && <RefreshCw className="h-4 w-4" />}
          {isRefreshing ? "Refreshing..." : "Refresh All"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{stats?.activeUsers || 0}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{stats?.pendingApprovals || 0}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <Database className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Datasets</p>
              <p className="text-2xl font-bold text-foreground">{stats?.datasetsProcessed || 0}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Cpu className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jobs Today</p>
              <p className="text-2xl font-bold text-foreground">{stats?.jobsToday || 0}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Workflow Management */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Workflow Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => handleTriggerJob('reprocess_data')}
            disabled={!!triggeringJob}
          >
            {triggeringJob === 'reprocess_data' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <RefreshCw className="h-6 w-6" />
            )}
            <span>Reprocess Data</span>
            <span className="text-xs text-muted-foreground">Re-run data pipelines</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => handleTriggerJob('refresh_ai')}
            disabled={!!triggeringJob}
          >
            {triggeringJob === 'refresh_ai' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Cpu className="h-6 w-6" />
            )}
            <span>Refresh AI Analysis</span>
            <span className="text-xs text-muted-foreground">Update predictions</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => handleTriggerJob('full_sync')}
            disabled={!!triggeringJob}
          >
            {triggeringJob === 'full_sync' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Play className="h-6 w-6" />
            )}
            <span>Full Sync</span>
            <span className="text-xs text-muted-foreground">Complete data refresh</span>
          </Button>
        </div>

        {/* Recent Jobs */}
        {jobs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Jobs</h4>
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    {job.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : job.status === 'running' ? (
                      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                    ) : job.status === 'failed' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-400" />
                    )}
                    <span className="text-sm text-foreground">{job.job_type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Dataset Management */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dataset Management
          </h3>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="neon" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Dataset</DialogTitle>
                <DialogDescription>
                  Upload a CSV file for price data or JSON for news data. Schema will be validated before processing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Dataset Type</Label>
                  <Select value={datasetType} onValueChange={setDatasetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price Data (CSV)</SelectItem>
                      <SelectItem value="news">News Data (JSON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input
                    type="file"
                    accept={datasetType === 'price' ? '.csv' : '.json'}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {datasetType === 'price'
                      ? 'Required fields: date, material, price'
                      : 'Required fields: id, title, summary, date'}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploadingDataset}
                  loading={uploadingDataset}
                >
                  {uploadingDataset ? 'Processing...' : 'Upload & Process'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recent Datasets */}
        {datasets.length > 0 ? (
          <div className="space-y-2">
            {datasets.slice(0, 5).map((dataset) => (
              <div
                key={dataset.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-white/5"
              >
                <div className="flex items-center gap-4">
                  {dataset.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : dataset.status === 'processing' ? (
                    <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                  ) : dataset.status === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-400" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{dataset.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dataset.type === 'price' ? 'Price Data' : 'News Data'} •{' '}
                      {(dataset.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(dataset.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No datasets uploaded yet</p>
        )}
      </GlassCard>

      {/* User Management */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{u.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-primary/20 text-primary border-primary/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.is_disabled ? (
                        <span className="flex items-center gap-1 text-sm text-destructive">
                          <UserX className="h-4 w-4" /> Disabled
                        </span>
                      ) : u.is_approved ? (
                        <span className="flex items-center gap-1 text-sm text-green-400">
                          <UserCheck className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-yellow-400">
                          <Clock className="h-4 w-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Dialog
                        open={userDialogOpen && selectedUser?.id === u.id}
                        onOpenChange={(open) => {
                          setUserDialogOpen(open);
                          if (!open) setSelectedUser(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(u)}
                          >
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage User</DialogTitle>
                            <DialogDescription>
                              Update user permissions and access for {u.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Select
                                defaultValue={u.role}
                                onValueChange={(value) =>
                                  handleUpdateUser({ newRole: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              {!u.is_approved && (
                                <Button
                                  variant="outline"
                                  className="flex-1 gap-2"
                                  onClick={() => handleUpdateUser({ isApproved: true })}
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Approve
                                </Button>
                              )}
                              <Button
                                variant={u.is_disabled ? 'outline' : 'destructive'}
                                className="flex-1 gap-2"
                                onClick={() =>
                                  handleUpdateUser({ isDisabled: !u.is_disabled })
                                }
                              >
                                <UserX className="h-4 w-4" />
                                {u.is_disabled ? 'Enable' : 'Disable'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Admin;
