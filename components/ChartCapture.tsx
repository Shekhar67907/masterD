import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

interface ChartCaptureProps {
  children: React.ReactNode;
  onCapture: (uri: string) => void;
}

export function ChartCapture({ children, onCapture }: ChartCaptureProps) {
  const viewShotRef = useRef<ViewShot>(null);

  const captureChart = async () => {
    // Add a small delay to ensure chart is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, {
          format: 'png',
          quality: 1,
          result: 'base64'
        });
        onCapture(uri);
      }
    } catch (error) {
      console.error('Error capturing chart:', error);
    }
  };

  useEffect(() => {
    captureChart();
  }, []);

  return (
    <ViewShot
      ref={viewShotRef}
      options={{
        format: 'png',
        quality: 1,
        result: 'base64'
      }}
    >
      <View style={{ backgroundColor: '#fff', padding: 16 }}>
        {children}
      </View>
    </ViewShot>
  );
}