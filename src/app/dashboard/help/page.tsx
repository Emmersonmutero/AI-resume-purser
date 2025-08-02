
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>Find answers to your questions and get support.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Help documentation and support contact information will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
