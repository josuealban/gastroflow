export function pollBranchProvisioning({ branchId, fetchProgress, onProgress, onError, maxPolls = 30, intervalMs = 4000, schedule = setTimeout }) {
  let cancelled = false;
  let polls = 0;
  let timer;
  const tick = async () => {
    if (cancelled || polls >= maxPolls) return;
    polls += 1;
    try {
      const progress = await fetchProgress(branchId);
      if (cancelled) return;
      onProgress(progress);
      if (progress.branchStatus === 'ACTIVE' || progress.branchStatus === 'FAILED' || progress.jobStatus === 'COMPLETED' || progress.jobStatus === 'FAILED') return;
    } catch (error) {
      if (!cancelled) onError(error);
    }
    if (!cancelled && polls < maxPolls) timer = schedule(tick, intervalMs);
  };
  void tick();
  return () => { cancelled = true; if (timer !== undefined) clearTimeout(timer); };
}
