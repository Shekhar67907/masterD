import React, { useState, useCallback } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Platform, View } from 'react-native';
import { Download } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import { ChartCapture } from './ChartCapture';

interface DownloadReportButtonProps {
  onDownload: () => Promise<string>;
  controlCharts: React.ReactNode;
  histogram: React.ReactNode;
  distribution: React.ReactNode;
  isLoading: boolean;
  disabled?: boolean;
}

export function DownloadReportButton({ 
  onDownload, 
  controlCharts,
  histogram,
  distribution,
  isLoading, 
  disabled 
}: DownloadReportButtonProps) {
  const [chartImages, setChartImages] = useState<{
    controlCharts?: string;
    histogram?: string;
    distribution?: string;
  }>({});
  const [capturing, setCapturing] = useState(false);

  const handleChartCapture = useCallback((chartType: string) => (uri: string) => {
    setChartImages(prev => ({ ...prev, [chartType]: uri }));
  }, []);

  const generatePDF = async (html: string) => {
    setCapturing(true);
    try {
      // Wait for all charts to be captured
      await new Promise(resolve => setTimeout(resolve, 1500));

      let finalHtml = html;
      
      if (chartImages.controlCharts) {
        finalHtml = finalHtml.replace(
          '<!-- CONTROL_CHARTS_PLACEHOLDER -->',
          `<img src="data:image/png;base64,${chartImages.controlCharts}" style="width: 100%; max-width: 100%; height: auto; margin: 20px 0;" />`
        );
      }
      
      if (chartImages.histogram) {
        finalHtml = finalHtml.replace(
          '<!-- HISTOGRAM_PLACEHOLDER -->',
          `<img src="data:image/png;base64,${chartImages.histogram}" style="width: 100%; max-width: 100%; height: auto; margin: 20px 0;" />`
        );
      }
      
      if (chartImages.distribution) {
        finalHtml = finalHtml.replace(
          '<!-- DISTRIBUTION_PLACEHOLDER -->',
          `<img src="data:image/png;base64,${chartImages.distribution}" style="width: 100%; max-width: 100%; height: auto; margin: 20px 0;" />`
        );
      }

      return await Print.printToFileAsync({
        html: finalHtml,
        base64: false
      });
    } finally {
      setCapturing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const html = await onDownload();
      const { uri } = await generatePDF(html);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `spc-analysis-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        link.click();
      } else {
        const fileName = `spc-analysis-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        const destinationUri = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri
        });

        await Sharing.shareAsync(destinationUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Download SPC Analysis Report'
        });

        // Clean up temporary files
        await FileSystem.deleteAsync(uri, { idempotent: true });
        await FileSystem.deleteAsync(destinationUri, { idempotent: true });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  };

  return (
    <View>
      <View style={{ position: 'absolute', opacity: 0, zIndex: -1 }}>
        <ChartCapture onCapture={handleChartCapture('controlCharts')}>
          {controlCharts}
        </ChartCapture>
        <ChartCapture onCapture={handleChartCapture('histogram')}>
          {histogram}
        </ChartCapture>
        <ChartCapture onCapture={handleChartCapture('distribution')}>
          {distribution}
        </ChartCapture>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          (disabled || isLoading || capturing) && styles.buttonDisabled
        ]}
        onPress={handleDownload}
        disabled={disabled || isLoading || capturing}
      >
        {(isLoading || capturing) ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Download size={20} color="#fff" />
            <Text style={styles.buttonText}>Download Report</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});