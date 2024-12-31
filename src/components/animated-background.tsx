interface AnimatedBackgroundProps {
  type: 'blue' | 'orange' | 'green' | 'purple' | 'gold';
}

export function AnimatedBackground({ type }: AnimatedBackgroundProps) {
  return (
    <div className={`animated-background gradient-background ${type}`}>
      <div className="animated-background__gradient animated-background__gradient--before" />
      <div className="animated-background__gradient animated-background__gradient--after" />
    </div>
  );
} 