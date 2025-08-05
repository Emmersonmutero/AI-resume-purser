import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, UploadCloud, Bot } from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-background">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none font-headline text-primary">
                    Unlock Your Career Potential with AI Resume Parser
                  </h1>
                  <p className="mx-auto lg:mx-0 max-w-[600px] text-muted-foreground text-base sm:text-lg md:text-xl font-body">
                    Effortlessly parse your resume, get AI-powered summaries, and discover job opportunities perfectly tailored to your skills and experience.
                  </p>
                </div>
                <div className="flex flex-col gap-3 xs:flex-row xs:justify-center lg:justify-start">
                  <Button asChild size="lg" className="w-full xs:w-auto">
                    <Link href="/register">Get Started for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full xs:w-auto">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="w-full h-full flex items-center justify-center order-first lg:order-last">
                  <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
                      <div className="absolute top-0 -left-2 sm:-left-4 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                      <div className="absolute top-0 -right-2 sm:-right-4 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                      <div className="absolute -bottom-4 sm:-bottom-8 left-12 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                      <img
                        src="https://placehold.co/600x600.png"
                        data-ai-hint="resume document"
                        alt="Hero"
                        className="relative mx-auto aspect-square overflow-hidden rounded-xl object-cover w-full"
                      />
                  </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 bg-secondary/50">
          <div className="container">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl font-headline">How AI Resume Parser Works for You</h2>
                <p className="max-w-[900px] text-muted-foreground text-base sm:text-lg md:text-xl font-body">
                  Our platform simplifies your job search by leveraging cutting-edge AI to connect you with the right opportunities.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none mt-8 sm:mt-12">
              <Card className="h-full">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <UploadCloud className="w-8 h-8 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg sm:text-xl">Upload & Parse</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Simply upload your resume in PDF format. Our system instantly parses and structures your information, making it ready for analysis.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Bot className="w-8 h-8 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg sm:text-xl">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    GenAI creates a professional summary and analyzes your skills and experience to understand your unique professional profile.
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg sm:text-xl">Job Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Receive a curated list of job openings that are highly relevant to your profile, complete with a match score and explanation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              &copy; 2024 AI Resume Parser. All rights reserved.
            </p>
            <nav className="flex justify-center sm:justify-end gap-4 sm:gap-6">
              <Link className="text-xs sm:text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors" href="#">
                Terms of Service
              </Link>
              <Link className="text-xs sm:text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors" href="#">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
