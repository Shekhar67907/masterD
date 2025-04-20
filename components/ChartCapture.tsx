import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import ViewShot from 'react-native-view-shot';

interface ChartCaptureProps {
  children: React.ReactNode;
  onCapture: (uri: string) => void;
}

export function ChartCapture({ children, onCapture }: ChartCaptureProps) {
  const viewShotRef = useRef<InstanceType<typeof ViewShot>>(null);

  const captureChart = async () => {
    const ref = viewShotRef.current;
    if (ref && typeof ref.capture === 'function') {
      try {
        const uri = await ref.capture();
        if (uri) {
          onCapture(uri);
        }
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    } else {
      console.warn('ViewShot ref not ready or capture not a function.');
    }
  };

  useEffect(() => {
    captureChart();
  }, []);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 0.8 }}
    >
      <View style={{ backgroundColor: '#fff' }}>
        {children}
      </View>
    </ViewShot>
  );
}
