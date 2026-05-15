interface InsightFooterProps {
  tone: 'concern' | 'positive' | 'neutral';
  text: string;
}

const labels = { concern: 'Concern', positive: 'Positive', neutral: 'Insight' };

export function InsightFooter({ tone, text }: InsightFooterProps) {
  return (
    <>
      <strong className={tone}>{labels[tone]}:</strong> {text}
    </>
  );
}
