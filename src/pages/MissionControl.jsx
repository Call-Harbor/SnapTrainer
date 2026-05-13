import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertTriangle, CheckCircle2, Clock, GitBranch, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { getUserEmail, getUserId } from '@/lib/ownership';

export default function MissionControl() {
  const { user } = useAuth();
  const [selectedRunId, setSelectedRunId] = useState(null);
  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['orchestration-runs', user?.id, user?.email],
    queryFn: async () => {
      if (!base44.entities.OrchestrationRun) return [];
      const allRuns = await base44.entities.OrchestrationRun.list('-created_date', 100);
      const userId = getUserId(user);
      const email = getUserEmail(user);
      return allRuns.filter((run) =>
        run.owner_user_id === userId ||
        run.owner_email === email ||
        run.aiface_owner_user_id === userId ||
        run.aiface_owner_email === email
      );
    },
    initialData: [],
    enabled: Boolean(user),
  });

  const { data: evalRuns = [] } = useQuery({
    queryKey: ['eval-runs', user?.id, user?.email],
    queryFn: async () => {
      if (!base44.entities.EvalRun) return [];
      const allRuns = await base44.entities.EvalRun.list('-created_date', 100);
      const userId = getUserId(user);
      const email = getUserEmail(user);
      return allRuns.filter((run) =>
        run.owner_user_id === userId ||
        run.owner_email === email ||
        run.aiface_owner_user_id === userId ||
        run.aiface_owner_email === email
      );
    },
    initialData: [],
    enabled: Boolean(user),
  });

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) || runs[0],
    [runs, selectedRunId]
  );
  const selectedEval = evalRuns.find((item) => item.run_id === selectedRun?.run_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Activity className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Mission Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No orchestration runs yet.
            </div>
          ) : (
            <ScrollArea className="h-[70vh] pr-3">
              <div className="space-y-2">
                {runs.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      selectedRun?.id === run.id
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/50 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{run.user_goal || 'Untitled run'}</p>
                      <Badge variant="outline" className="text-[10px]">{run.status || 'unknown'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {run.execution_mode || 'unknown mode'}
                    </p>
                    {run.created_date && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {format(new Date(run.created_date), 'd MMM yyyy HH:mm')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {!selectedRun ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center text-muted-foreground">
              Select a run to inspect.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Run inspection</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedRun.run_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedRun.execution_mode}</Badge>
                    <Badge variant="outline">{selectedRun.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <Metric icon={Clock} label="Stage" value={selectedRun.current_stage || selectedRun.run_state?.currentStage || '-'} />
                  <Metric icon={ListChecks} label="Subtasks" value={selectedRun.run_state?.subtasks?.length || 0} />
                  <Metric icon={Activity} label="Events" value={selectedRun.telemetry_events?.length || selectedRun.run_state?.telemetry?.length || 0} />
                  <Metric icon={CheckCircle2} label="Eval" value={selectedEval?.scores?.overall ?? selectedRun.evaluation_result?.overall ?? '-'} />
                </div>

                {selectedEval && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <h3 className="text-sm font-semibold mb-2">Production eval</h3>
                    <pre className="text-xs overflow-auto">{JSON.stringify(selectedEval.scores, null, 2)}</pre>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold mb-2">User goal</h3>
                  <p className="rounded-xl bg-secondary/40 border border-border/50 p-3 text-sm">
                    {selectedRun.user_goal}
                  </p>
                </div>

                {selectedRun.errors?.length > 0 && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Errors
                    </h3>
                    <pre className="text-xs overflow-auto mt-2">{JSON.stringify(selectedRun.errors, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Execution trace</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[420px] pr-3">
                  <div className="space-y-2">
                    {(selectedRun.telemetry_events || selectedRun.run_state?.telemetry || []).map((event) => (
                      <div key={event.id} className="rounded-xl border border-border/50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">{event.type}</p>
                          <span className="text-[11px] text-muted-foreground">{event.stage}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{event.message}</p>
                        {event.data && Object.keys(event.data).length > 0 && (
                          <pre className="text-[11px] bg-secondary/40 rounded-lg p-2 mt-2 overflow-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border/50 p-3">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
