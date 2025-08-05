'use client';

import { 
  handleResumeUpload, 
  getUserResumes, 
  deleteUserResume,
  createJobPosting,
  applyForJob,
  getApplicantsForRecruiter,
  getUserRole,
  type ProcessedResumeData,
  type UserResume,
  type JobPosting,
  type Application
} from './actions';
import { apiClient } from './api-client';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface DashboardData {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: string;
  } | null;
  resumes: UserResume[];
  jobs: JobPosting[];
  applications: Application[];
  matches: any[];
  stats: {
    totalResumes: number;
    totalJobs: number;
    totalApplications: number;
    matchRate: number;
    goodMatches: number;
    greatMatches: number;
  };
}

export interface NotificationData {
  id: string;
  type: 'application' | 'job_match' | 'resume_processed' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  metadata?: Record<string, any>;
}

class DataService {
  private currentUser: FirebaseUser | null = null;
  private userRole: string | null = null;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.userRole = await getUserRole(user.uid);
      } else {
        this.userRole = null;
        this.clearCache();
      }
    });
  }

  private clearCache() {
    this.cache.clear();
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  // Auth methods
  async getCurrentUser() {
    if (!this.currentUser) return null;
    
    const cacheKey = `user:${this.currentUser.uid}`;
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    const role = this.userRole || await getUserRole(this.currentUser.uid);
    const userData = {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: this.currentUser.displayName,
      photoURL: this.currentUser.photoURL,
      role
    };

    this.setCachedData(cacheKey, userData, 10);
    return userData;
  }

  // Resume methods
  async uploadResume(file: File): Promise<{ data: ProcessedResumeData | null; error: string | null }> {
    if (!this.currentUser) {
      return { data: null, error: 'User not authenticated' };
    }

    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const result = await handleResumeUpload(formData);
      if (result.data) {
        // Clear cache to force refresh
        this.cache.delete(`resumes:${this.currentUser.uid}`);
        this.cache.delete(`dashboard:${this.currentUser.uid}`);
      }
      return result;
    } catch (error: any) {
      return { data: null, error: error.message || 'Failed to upload resume' };
    }
  }

  async getUserResume(): Promise<UserResume | null> {
    if (!this.currentUser) return null;

    const cacheKey = `resumes:${this.currentUser.uid}`;
    const cached = this.getCachedData<UserResume>(cacheKey);
    if (cached) return cached;

    try {
      const resume = await getUserResumes();
      if (resume) {
        this.setCachedData(cacheKey, resume, 5);
      }
      return resume;
    } catch (error) {
      console.error('Error fetching user resume:', error);
      return null;
    }
  }

  async deleteResume(): Promise<{ success?: boolean; error?: string }> {
    if (!this.currentUser) {
      return { error: 'User not authenticated' };
    }

    try {
      const result = await deleteUserResume();
      if (result.success) {
        // Clear cache
        this.cache.delete(`resumes:${this.currentUser.uid}`);
        this.cache.delete(`dashboard:${this.currentUser.uid}`);
      }
      return result;
    } catch (error: any) {
      return { error: error.message || 'Failed to delete resume' };
    }
  }

  // Job methods
  async getJobs(params?: {
    limit?: number;
    search?: string;
    jobType?: string;
    remote?: boolean;
    postedBy?: string;
  }): Promise<JobPosting[]> {
    const cacheKey = `jobs:${JSON.stringify(params || {})}`;
    const cached = this.getCachedData<JobPosting[]>(cacheKey);
    if (cached) return cached;

    try {
      let jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      
      if (params?.limit) {
        jobsQuery = query(jobsQuery, limit(params.limit));
      }
      
      if (params?.postedBy) {
        jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', params.postedBy), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(jobsQuery);
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as JobPosting[];

      // Apply client-side filters
      let filteredJobs = jobs;
      
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredJobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm)
        );
      }

      this.setCachedData(cacheKey, filteredJobs, 3);
      return filteredJobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  async createJob(jobData: { title: string; company: string; description: string }): Promise<{ success?: boolean; error?: string }> {
    if (!this.currentUser || this.userRole !== 'recruiter') {
      return { error: 'Only recruiters can create job postings' };
    }

    const formData = new FormData();
    Object.entries(jobData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const result = await createJobPosting(formData);
      if (result.success) {
        // Clear jobs cache
        Array.from(this.cache.keys())
          .filter(key => key.startsWith('jobs:'))
          .forEach(key => this.cache.delete(key));
      }
      return result;
    } catch (error: any) {
      return { error: error.message || 'Failed to create job posting' };
    }
  }

  // Application methods
  async getApplications(): Promise<Application[]> {
    if (!this.currentUser) return [];

    const cacheKey = `applications:${this.currentUser.uid}`;
    const cached = this.getCachedData<Application[]>(cacheKey);
    if (cached) return cached;

    try {
      let applications: Application[] = [];

      if (this.userRole === 'recruiter') {
        applications = await getApplicantsForRecruiter(this.currentUser.uid);
      } else {
        // For job seekers, get their applications
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('applicantId', '==', this.currentUser.uid),
          orderBy('appliedAt', 'desc')
        );
        const snapshot = await getDocs(applicationsQuery);
        applications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Application[];
      }

      this.setCachedData(cacheKey, applications, 5);
      return applications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async applyToJob(jobId: string, jobTitle: string, matchScore: number): Promise<{ success?: boolean; error?: string }> {
    if (!this.currentUser || this.userRole !== 'job-seeker') {
      return { error: 'Only job seekers can apply to jobs' };
    }

    try {
      const resume = await this.getUserResume();
      if (!resume) {
        return { error: 'Please upload a resume before applying' };
      }

      const result = await applyForJob(jobId, jobTitle, matchScore, resume.processedData.resumeData);
      if (result.success) {
        // Clear applications cache
        this.cache.delete(`applications:${this.currentUser.uid}`);
      }
      return result;
    } catch (error: any) {
      return { error: error.message || 'Failed to submit application' };
    }
  }

  // Dashboard data
  async getDashboardData(): Promise<DashboardData> {
    if (!this.currentUser) {
      return {
        user: null,
        resumes: [],
        jobs: [],
        applications: [],
        matches: [],
        stats: {
          totalResumes: 0,
          totalJobs: 0,
          totalApplications: 0,
          matchRate: 0,
          goodMatches: 0,
          greatMatches: 0
        }
      };
    }

    const cacheKey = `dashboard:${this.currentUser.uid}`;
    const cached = this.getCachedData<DashboardData>(cacheKey);
    if (cached) return cached;

    try {
      const [user, resume, jobs, applications] = await Promise.all([
        this.getCurrentUser(),
        this.getUserResume(),
        this.getJobs({ limit: 20 }),
        this.getApplications()
      ]);

      const resumes = resume ? [resume] : [];
      const matches = resume?.processedData?.matches || [];

      // Calculate stats
      const stats = {
        totalResumes: resumes.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
        matchRate: matches.length > 0 ? Math.round((matches.filter(m => m.score > 70).length / matches.length) * 100) : 0,
        goodMatches: matches.filter(m => m.score > 70 && m.score <= 85).length,
        greatMatches: matches.filter(m => m.score > 85).length
      };

      const dashboardData: DashboardData = {
        user,
        resumes,
        jobs,
        applications,
        matches,
        stats
      };

      this.setCachedData(cacheKey, dashboardData, 3);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Notifications
  async getNotifications(): Promise<NotificationData[]> {
    if (!this.currentUser) return [];

    const cacheKey = `notifications:${this.currentUser.uid}`;
    const cached = this.getCachedData<NotificationData[]>(cacheKey);
    if (cached) return cached;

    try {
      // For now, generate mock notifications based on user activity
      const notifications: NotificationData[] = [];
      
      const applications = await this.getApplications();
      const resume = await this.getUserResume();

      // Add application-based notifications
      applications.slice(0, 5).forEach((app, index) => {
        notifications.push({
          id: `app-${app.id}`,
          type: 'application',
          title: 'Application Update',
          message: `Your application for ${app.jobTitle} is being reviewed`,
          read: false,
          createdAt: app.appliedAt?.toDate() || new Date(),
          userId: this.currentUser!.uid,
          metadata: { applicationId: app.id }
        });
      });

      // Add resume processing notification
      if (resume) {
        notifications.push({
          id: `resume-${resume.id}`,
          type: 'resume_processed',
          title: 'Resume Processed',
          message: `Your resume has been analyzed and ${resume.processedData.matches.length} job matches found`,
          read: false,
          createdAt: resume.uploadedAt?.toDate() || new Date(),
          userId: this.currentUser!.uid,
          metadata: { resumeId: resume.id }
        });
      }

      // Sort by date
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this.setCachedData(cacheKey, notifications.slice(0, 10), 2);
      return notifications.slice(0, 10);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Search and filtering
  async searchJobs(searchTerm: string, filters?: {
    jobType?: string;
    experienceLevel?: string;
    remote?: boolean;
    location?: string;
  }): Promise<JobPosting[]> {
    return this.getJobs({
      search: searchTerm,
      ...filters
    });
  }

  // Real-time job matching
  async getJobMatches(resumeId?: string): Promise<any[]> {
    if (!this.currentUser) return [];

    const resume = await this.getUserResume();
    if (!resume) return [];

    const cacheKey = `matches:${this.currentUser.uid}`;
    const cached = this.getCachedData<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const matches = resume.processedData.matches || [];
      this.setCachedData(cacheKey, matches, 10);
      return matches;
    } catch (error) {
      console.error('Error fetching job matches:', error);
      return [];
    }
  }

  // Statistics and analytics
  async getAnalytics(): Promise<any> {
    if (!this.currentUser) return null;

    const dashboardData = await this.getDashboardData();
    const applications = dashboardData.applications;
    const matches = dashboardData.matches;

    return {
      applicationsByMonth: this.groupApplicationsByMonth(applications),
      matchScoreDistribution: this.getMatchScoreDistribution(matches),
      topJobCategories: this.getTopJobCategories(matches),
      applicationSuccessRate: this.calculateSuccessRate(applications)
    };
  }

  private groupApplicationsByMonth(applications: Application[]) {
    const groups: Record<string, number> = {};
    applications.forEach(app => {
      const date = app.appliedAt?.toDate() || new Date();
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).map(([month, count]) => ({ month, count }));
  }

  private getMatchScoreDistribution(matches: any[]) {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    matches.forEach(match => {
      if (match.score >= 90) distribution.excellent++;
      else if (match.score >= 80) distribution.good++;
      else if (match.score >= 70) distribution.fair++;
      else distribution.poor++;
    });
    return distribution;
  }

  private getTopJobCategories(matches: any[]) {
    const categories: Record<string, number> = {};
    matches.forEach(match => {
      const category = match.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  private calculateSuccessRate(applications: Application[]) {
    if (applications.length === 0) return 0;
    // This would need to be implemented based on application status
    return Math.round(Math.random() * 30 + 10); // Mock data for now
  }

  // Cache management
  invalidateCache(pattern?: string) {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => this.cache.delete(key));
    } else {
      this.clearCache();
    }
  }

  // Force refresh data
  async refreshDashboard() {
    if (!this.currentUser) return;
    
    this.invalidateCache();
    return this.getDashboardData();
  }
}

export const dataService = new DataService();