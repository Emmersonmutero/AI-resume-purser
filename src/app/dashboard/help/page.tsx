
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function HelpPage() {
  const faqs = [
    {
      question: "What file types can I upload for my resume?",
      answer: "ResumeFlow currently supports PDF (.pdf) and Text (.txt) files. Please ensure your file is under 5MB."
    },
    {
      question: "How does the AI matching work?",
      answer: "Our AI analyzes the content of your uploaded resume—your skills, experience, and education—and compares it against the descriptions of job vacancies posted by recruiters on the platform. It then calculates a match score for each job to show you the most relevant opportunities."
    },
    {
      question: "I'm a recruiter. How do I post a job?",
      answer: "From your Recruiter Dashboard, click the 'Post New Job' button. A dialog will appear where you can enter the job title, company name, and a detailed description. Once you submit, the job will be live for job seekers to apply to."
    },
    {
      question: "Can I see who has applied to my job postings?",
      answer: "Yes. The 'Recent Applicants' table on your Recruiter Dashboard shows a list of all candidates who have applied to your jobs, along with their name, the job they applied for, and their AI-calculated match score."
    },
    {
      question: "How do I change my password?",
      answer: "You can change your password by navigating to the Settings page from the user menu in the top right. You will find a 'Change Password' section where you can enter your current and new passwords."
    },
     {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All authentication is handled securely through Firebase, and your resume data is processed by our AI and stored securely. We do not share your personal data without your consent."
    }
  ];

  return (
     <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="p-4 sm:p-6 lg:p-8">
             <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>Find answers to frequently asked questions below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
