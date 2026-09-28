/**
 * Keep only a few dashboard section requests in flight.
 * Later sections wait, so the first graphs can paint before the rest start.
 */
const MAX_CONCURRENT = 2;

type Job = {
  cancelled: boolean;
  run: () => void;
};

let active = 0;
const pending: Job[] = [];

function pump() {
  while (active < MAX_CONCURRENT && pending.length > 0) {
    const job = pending.shift();
    if (!job || job.cancelled) continue;
    job.run();
  }
}

/** Queue `start` until a slot is free. Call the returned function to drop a job that has not started. */
export function enqueueSectionFetch(start: (release: () => void) => void): () => void {
  let settled = false;
  const release = () => {
    if (settled) return;
    settled = true;
    active = Math.max(0, active - 1);
    pump();
  };

  const job: Job = {
    cancelled: false,
    run() {
      active += 1;
      try {
        start(release);
      } catch {
        release();
      }
    },
  };

  pending.push(job);
  pump();

  return () => {
    job.cancelled = true;
  };
}
