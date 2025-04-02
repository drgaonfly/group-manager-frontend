import useSocketCountdown from "../hooks/useSocketCountdown";

interface CountdownProps {
  socketEvent: string;
  className?: string;
  format?: "full" | "compact";
  showZeroValues?: boolean; // Controls whether to show zero hours/minutes
  prefix?: string; // Optional text to display before the countdown
  suffix?: string; // Optional text to display after the countdown
}

const Countdown = ({
  socketEvent,
  className = "",
  format = "full",
  showZeroValues = false,
  prefix = "",
  suffix = "",
}: CountdownProps) => {
  const countdown = useSocketCountdown(socketEvent, format, showZeroValues);

  return (
    <div className={className}>
      {prefix}
      {countdown}
      {suffix}
    </div>
  );
};

export default Countdown;
