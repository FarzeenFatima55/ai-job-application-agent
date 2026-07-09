import { getSessionUser } from "@/lib/auth/get-session-user";
import { getUserJobs } from "@/lib/jobs/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  XCircle,
  AlertCircle,
  FileText,
  Award,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AnalyticsPage() {
  const sessionUser = await getSessionUser();
  const jobs = await getUserJobs(sessionUser.id);

  // Computations
  const total = jobs.length;
  const saved = jobs.filter(j => j.status === 'saved').length;
  const applied = jobs.filter(j => j.status === 'applied').length;
  const interview = jobs.filter(j => j.status === 'interview').length;
  const offer = jobs.filter(j => j.status === 'offer').length;
  const rejected = jobs.filter(j => j.status === 'rejected').length;

  const analyzedJobs = jobs.filter(j => j.matchScore !== null);
  const avgScore = analyzedJobs.length > 0 
    ? Math.round(analyzedJobs.reduce((acc, curr) => acc + (curr.matchScore ?? 0), 0) / analyzedJobs.length)
    : 0;

  // Aggregate missing skills
  const missingSkillsCount: Record<string, number> = {};
  analyzedJobs.forEach(job => {
    job.missingSkills.forEach(skill => {
      missingSkillsCount[skill] = (missingSkillsCount[skill] ?? 0) + 1;
    });
  });

  const topMissingSkills = Object.entries(missingSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Aggregate matched skills
  const matchedSkillsCount: Record<string, number> = {};
  analyzedJobs.forEach(job => {
    job.matchedSkills.forEach(skill => {
      matchedSkillsCount[skill] = (matchedSkillsCount[skill] ?? 0) + 1;
    });
  });

  const topMatchedSkills = Object.entries(matchedSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your job application pipeline metrics, ATS performance, and AI-driven skill insights.
        </p>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{total}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {analyzedJobs.length} matches analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{avgScore}%</div>
            <Progress value={avgScore} className="h-1.5 bg-muted mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interviews</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{interview}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {applied} applications sent
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Offers Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-600 dark:text-green-400">{offer}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Success rate: {total > 0 ? Math.round((offer / total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Analytics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pipeline & Funnel Breakdown */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Application Funnel</CardTitle>
              <CardDescription className="text-xs">Your job hunting status progression.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-muted-foreground" /> Saved</span>
                  <span className="text-muted-foreground">{saved}</span>
                </div>
                <Progress value={total > 0 ? (saved / total) * 100 : 0} className="h-1.5 bg-muted" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5"><FileText className="h-3 w-3 text-blue-500" /> Applied</span>
                  <span className="text-muted-foreground">{applied}</span>
                </div>
                <Progress value={total > 0 ? (applied / total) * 100 : 0} className="h-1.5 bg-muted" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5"><Award className="h-3 w-3 text-amber-500" /> Interviewing</span>
                  <span className="text-muted-foreground">{interview}</span>
                </div>
                <Progress value={total > 0 ? (interview / total) * 100 : 0} className="h-1.5 bg-muted" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-green-500" /> Offers</span>
                  <span className="text-muted-foreground">{offer}</span>
                </div>
                <Progress value={total > 0 ? (offer / total) * 100 : 0} className="h-1.5 bg-muted" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-red-500" /> Rejected</span>
                  <span className="text-slate-500">{rejected}</span>
                </div>
                <Progress value={total > 0 ? (rejected / total) * 100 : 0} className="h-1.5 bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card className="border-border bg-gradient-to-br from-primary/5 via-card to-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                AI Career Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              {total === 0 ? (
                <p>No job statistics available yet. Paste job descriptions in the Jobs tab to generate AI metrics.</p>
              ) : avgScore < 60 ? (
                <p>Your average resume match score is quite low ({avgScore}%). We suggest reviewing the "Resume Tailoring" tab on your job records to inject job-specific keywords into your resume bullets.</p>
              ) : avgScore >= 60 && avgScore < 80 ? (
                <p>You're in a good matching zone! To hit the high-interview 80%+ threshold, focus on addressing the missing skills listed in the insights panel.</p>
              ) : (
                <p>Outstanding! Your match scores are averaging {avgScore}%. Focus on cover letter customization and application tracking to secure interviews.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Analytics & Recent History */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                Skill GAP Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Aggregate skills requested in job descriptions compared to your matches.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {/* Top Missing Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Top Missing Skills
                </h4>
                {topMissingSkills.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No missing skills aggregates.</p>
                ) : (
                  <div className="space-y-2">
                    {topMissingSkills.map(([skill, count]) => (
                      <div key={skill} className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/10 text-[10px] py-0">
                          {skill}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Requested in {count} JD(s)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Matched Skills */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-green-500 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Top Matched Skills
                </h4>
                {topMatchedSkills.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No matched skills aggregates.</p>
                ) : (
                  <div className="space-y-2">
                    {topMatchedSkills.map(([skill, count]) => (
                      <div key={skill} className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/10 text-[10px] py-0">
                          {skill}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Present in {count} match(es)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Match History */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Match History & Logs</CardTitle>
              <CardDescription className="text-xs">Recent job analysis results.</CardDescription>
            </CardHeader>
            <CardContent>
              {analyzedJobs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">No match history. Complete job analyses to populate logs.</p>
              ) : (
                <div className="divide-y divide-border/40">
                  {analyzedJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-foreground">{job.roleTitle}</h4>
                        <p className="text-[10px] text-muted-foreground">{job.company} · {format(new Date(job.createdAt), "MMM d, yyyy")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-primary">{job.matchScore}% Match</span>
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          <button className="rounded-md hover:bg-muted p-1 transition-colors">
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
