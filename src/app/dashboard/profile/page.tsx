
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is where your profile information will be displayed and can be edited.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Profile settings and details will be available here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
