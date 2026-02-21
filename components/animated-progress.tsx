import { Animated } from "react-native";
import { ProgressBar } from "react-native-paper";

interface Props {
  progress: Animated.Value;
  color: string;
}

export default function AnimatedProgress({
  progress,
  color,
}: Props) {
  return (
    <Animated.View>
      <ProgressBar
        progress={progress as any}
        color={color}
        style={{
          height: 8,
          borderRadius: 4,
          marginTop: 8,
        }}
      />
    </Animated.View>
  );
}