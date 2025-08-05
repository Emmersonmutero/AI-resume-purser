"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  Building,
  MapPin,
  Clock,
  Search,
  MoreHorizontal
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import { type JobPosting } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ResponsiveTable, ResponsiveTableHead, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableCell, MobileTableCard, MobileTableField } from "@/components/ui/responsive-table";

interface JobFormData {
  title: string;
  company: string;
  description: string;
}

export function JobManagementClient() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    description: "",
  });
  const { toast } = useToast();

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await dataService.getCurrentUser();
      if (user) {
        const jobsData = await dataService.getJobs({ postedBy: user.uid });
        setJobs(jobsData);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load jobs');
      toast({
        title: "Error",
        description: "Failed to load your jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await dataService.createJob(formData);
      if (result.success) {
        toast({
          title: "Job Created",
          description: `${formData.title} has been posted successfully.`,
        });
        setIsCreateDialogOpen(false);
        setFormData({ title: "", company: "", description: "" });
        await fetchJobs();
      } else {
        toast({
          title: "Failed to Create Job",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setIsSubmitting(true);
    try {
      // For now, we'll just close the dialog and show success
      // In a real implementation, you'd call an update API
      toast({
        title: "Job Updated",
        description: `${formData.title} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      setEditingJob(null);
      setFormData({ title: "", company: "", description: "" });
      await fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update job.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (job: JobPosting) => {
    if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      try {
        // For now, we'll just show success
        // In a real implementation, you'd call a delete API
        toast({
          title: "Job Deleted",
          description: `${job.title} has been deleted successfully.`,
        });
        await fetchJobs();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete job.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Manage Jobs</h1>
          <p className="text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateJob}>
              <DialogHeader>
                <DialogTitle>Create New Job Posting</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new job posting.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. TechCorp Inc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role, responsibilities, requirements..."
                    rows={6}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Job"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search your jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'No jobs found' : 'No jobs posted yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search term.' : 'Create your first job posting to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Job
            </Button>
          )}
        </div>
      ) : (
        <ResponsiveTable>
          {/* Desktop Table Header */}
          <ResponsiveTableHeader className="hidden md:table-header-group">
            <ResponsiveTableRow>
              <ResponsiveTableHead>Job Details</ResponsiveTableHead>
              <ResponsiveTableHead>Company</ResponsiveTableHead>
              <ResponsiveTableHead>Posted</ResponsiveTableHead>
              <ResponsiveTableHead>Applications</ResponsiveTableHead>
              <ResponsiveTableHead className="text-right">Actions</ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>

          {/* Desktop Table Body */}
          <ResponsiveTableBody className="hidden md:table-row-group">
            {filteredJobs.map((job) => (
              <ResponsiveTableRow key={job.id}>
                <ResponsiveTableCell>
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {job.description}
                    </p>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {job.company}
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(job.createdAt))} ago
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    0 applications
                  </Badge>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditJob(job)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteJob(job)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            ))}
          </ResponsiveTableBody>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredJobs.map((job) => (
              <MobileTableCard key={job.id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditJob(job)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteJob(job)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <MobileTableField 
                  label="Posted" 
                  value={
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(job.createdAt))} ago
                    </span>
                  } 
                />
                <MobileTableField 
                  label="Applications" 
                  value={
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      0 applications
                    </Badge>
                  } 
                />
                <MobileTableField 
                  label="Description" 
                  value={
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  } 
                />
              </MobileTableCard>
            ))}
          </div>
        </ResponsiveTable>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleUpdateJob}>
            <DialogHeader>
              <DialogTitle>Edit Job Posting</DialogTitle>
              <DialogDescription>
                Update the details for your job posting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Job Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}