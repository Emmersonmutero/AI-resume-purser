"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  MapPin, 
  Clock, 
  Building, 
  Users, 
  Star,
  ExternalLink,
  Filter,
  SlidersHorizontal,
  Calendar,
  Heart,
  Send
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import { type JobPosting } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface JobFilters {
  search: string;
  jobType?: string;
  experienceLevel?: string;
  remote?: boolean;
  location?: string;
}

export function JobsListingClient() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
  });
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const jobsData = await dataService.getJobs({ limit: 50 });
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load jobs');
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }

    // Additional filters can be added here
    setFilteredJobs(filtered);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleApplyToJob = async (job: JobPosting) => {
    try {
      // For demonstration, we'll calculate a mock match score
      const matchScore = Math.floor(Math.random() * 30) + 70; // 70-100%
      
      const result = await dataService.applyToJob(job.id, job.title, matchScore);
      if (result.success) {
        toast({
          title: "Application Submitted",
          description: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
        });
      } else {
        toast({
          title: "Application Failed",
          description: result.error || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Application Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const toggleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      toast({
        title: "Job Unsaved",
        description: "Job removed from your saved list.",
      });
    } else {
      newSavedJobs.add(jobId);
      toast({
        title: "Job Saved",
        description: "Job added to your saved list.",
      });
    }
    setSavedJobs(newSavedJobs);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
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
          <h1 className="text-2xl font-bold font-headline">Browse Jobs</h1>
          <p className="text-muted-foreground">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button onClick={fetchJobs} variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Refresh Jobs
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs by title, company, or keywords..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
              <SheetDescription>
                Refine your job search with these filters.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Experience Level</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or filters to find more jobs.
          </p>
          <Button onClick={() => setFilters({ search: "" })} variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-6 truncate">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSaveJob(job.id)}
                    className="ml-2 p-1 h-8 w-8"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        savedJobs.has(job.id) ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {job.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Posted {formatDistanceToNow(new Date(job.createdAt))} ago
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApplyToJob(job)}
                      className="flex-1"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredJobs.length >= 50 && (
        <div className="text-center">
          <Button variant="outline" onClick={fetchJobs}>
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  );
}