import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface WorkoutSession {
  filename?: string;
  startTime: string;
  endTime: string;
  duration: number;
  data: Array<{
    speed: number;
    heartRate: number;
    rpm: number;
    resistance: number;
    distance: number;
    calories: number;
    watt: number;
    time: number;
    timestamp: number;
  }>;
  summary: {
    maxSpeed: number;
    averageSpeed: number;
    maxWatt: number;
    averageWatt: number;
    totalDistance: number;
    totalCalories: number;
    maxHeartRate: number;
    averageHeartRate: number;
  };
  aiAnalysis?: {
    timestamp: string;
    analysis: string;
    recommendations: string[];
    performance_score: number;
    zones_analysis: {
      heart_rate_zones: string;
      power_zones: string;
      endurance_assessment: string;
    };
  };
}

export class PDFExportService {
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  async exportWorkoutReport(session: WorkoutSession): Promise<void> {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let currentY = margin;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("iConsole+ Workout Report", margin, currentY);

    currentY += 15;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Generated: ${this.formatDate(new Date().toISOString())}`,
      margin,
      currentY
    );

    currentY += 10;
    pdf.text(
      `Session Date: ${this.formatDate(session.startTime)}`,
      margin,
      currentY
    );

    currentY += 20;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Session Summary", margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const summaryData = [
      ["Duration", this.formatDuration(session.duration)],
      ["Total Distance", `${session.summary.totalDistance.toFixed(1)} km`],
      ["Total Calories", `${session.summary.totalCalories}`],
      ["Average Speed", `${session.summary.averageSpeed.toFixed(1)} km/h`],
      ["Max Speed", `${session.summary.maxSpeed.toFixed(1)} km/h`],
      ["Average Power", `${session.summary.averageWatt.toFixed(0)} W`],
      ["Max Power", `${session.summary.maxWatt.toFixed(0)} W`],
      [
        "Average Heart Rate",
        `${session.summary.averageHeartRate.toFixed(0)} bpm`,
      ],
      ["Max Heart Rate", `${session.summary.maxHeartRate.toFixed(0)} bpm`],
    ];

    const colWidth = (pageWidth - 2 * margin) / 2;
    summaryData.forEach((row, index) => {
      const rowY = currentY + (index % 5) * 8;
      const colX = margin + Math.floor(index / 5) * colWidth;

      pdf.setFont("helvetica", "bold");
      pdf.text(row[0] + ":", colX, rowY);
      pdf.setFont("helvetica", "normal");
      pdf.text(row[1], colX + 40, rowY);
    });

    currentY += 45;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Performance Charts Analysis", margin, currentY);
    currentY += 15;

    const chartConfigs = [
      {
        selector: ".chart-heart-rate",
        title: "Heart Rate Zones Analysis",
        description: `This chart shows your heart rate distribution across different training zones during the workout. 
        Different colors represent: Blue (Rest <100 bpm), Green (Fat Burn 100-130 bpm), Yellow (Cardio 130-160 bpm), 
        Orange (Peak 160-180 bpm), Red (Maximum >180 bpm). Maximum HR: ${
          session.summary.maxHeartRate
        } bpm, 
        Average HR: ${session.summary.averageHeartRate.toFixed(0)} bpm.`,
      },
      {
        selector: ".chart-power",
        title: "Power Output Profile",
        description: `Power output measured in watts throughout your workout session. This metric indicates the actual 
        mechanical power you generated while cycling. Higher values indicate more intense effort. Maximum Power: 
        ${
          session.summary.maxWatt
        }W, Average Power: ${session.summary.averageWatt.toFixed(0)}W. 
        Consistent power output indicates good pacing strategy.`,
      },
      {
        selector: ".chart-speed-cadence",
        title: "Speed & Cadence Performance",
        description: `Blue bars show your speed (km/h) while cyan overlay shows cadence (RPM - revolutions per minute). 
        Optimal cadence typically ranges from 80-100 RPM for most cyclists. Speed reflects your virtual distance 
        covered based on power and resistance. Maximum Speed: ${session.summary.maxSpeed.toFixed(
          1
        )} km/h, 
        Average Speed: ${session.summary.averageSpeed.toFixed(1)} km/h.`,
      },
      {
        selector: ".chart-resistance",
        title: "Resistance Level Profile",
        description: `Shows the resistance level changes throughout your workout. Higher resistance levels require 
        more force to maintain the same cadence, simulating uphill cycling or headwind conditions. This chart 
        helps analyze workout intensity patterns and training load distribution over time.`,
      },
    ];

    for (const chartConfig of chartConfigs) {
      const chartElement = document.querySelector(
        chartConfig.selector
      ) as HTMLElement;
      if (chartElement) {
        try {
          if (currentY > pageHeight - 120) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(chartConfig.title, margin, currentY);
          currentY += 10;

          const canvas = await html2canvas(chartElement, {
            backgroundColor: "#1f2937",
            scale: 1,
            useCORS: true,
            allowTaint: true,
            width: chartElement.offsetWidth,
            height: chartElement.offsetHeight,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add chart image with proper proportions
          const maxChartHeight = 120; // Increased height for better visibility
          const finalHeight = Math.min(imgHeight, maxChartHeight);

          pdf.addImage(imgData, "PNG", margin, currentY, imgWidth, finalHeight);
          currentY += finalHeight + 10;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          const descriptionLines = pdf.splitTextToSize(
            chartConfig.description,
            pageWidth - 2 * margin
          );
          pdf.text(descriptionLines, margin, currentY);
          currentY += descriptionLines.length * 3.5 + 15;
        } catch (error) {
          console.warn(
            `Failed to capture chart ${chartConfig.selector}:`,
            error
          );
        }
      }
    }

    if (session.aiAnalysis) {
      if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("AI Performance Analysis", margin, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Performance Score: ${session.aiAnalysis.performance_score}/100`,
        margin,
        currentY
      );
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const analysisLines = pdf.splitTextToSize(
        session.aiAnalysis.analysis,
        pageWidth - 2 * margin
      );
      pdf.text(analysisLines, margin, currentY);
      currentY += analysisLines.length * 4 + 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Recommendations:", margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      session.aiAnalysis.recommendations.forEach((rec, index) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }
        const recLines = pdf.splitTextToSize(
          `${index + 1}. ${rec}`,
          pageWidth - 2 * margin - 10
        );
        pdf.text(recLines, margin + 5, currentY);
        currentY += recLines.length * 4 + 3;
      });

      currentY += 10;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Zone Analysis:", margin, currentY);
      currentY += 8;

      const zoneData = [
        [
          "Heart Rate Zones",
          session.aiAnalysis.zones_analysis.heart_rate_zones,
        ],
        ["Power Zones", session.aiAnalysis.zones_analysis.power_zones],
        [
          "Endurance Assessment",
          session.aiAnalysis.zones_analysis.endurance_assessment,
        ],
      ];

      pdf.setFontSize(10);
      zoneData.forEach(([title, content]) => {
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(title + ":", margin, currentY);
        currentY += 5;

        pdf.setFont("helvetica", "normal");
        const contentLines = pdf.splitTextToSize(
          content,
          pageWidth - 2 * margin
        );
        pdf.text(contentLines, margin, currentY);
        currentY += contentLines.length * 4 + 8;
      });
    }

    // Add metrics guide
    currentY = this.addMetricsGuide(
      pdf,
      margin,
      pageWidth,
      pageHeight,
      currentY
    );

    pdf.addPage();
    currentY = margin;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Workout Data", margin, currentY);
    currentY += 15;

    const headers = [
      "Time",
      "Speed",
      "HR",
      "RPM",
      "Resistance",
      "Power",
      "Distance",
      "Calories",
    ];
    const columnWidth = (pageWidth - 2 * margin) / headers.length;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");

    headers.forEach((header, index) => {
      pdf.text(header, margin + index * columnWidth, currentY);
    });
    currentY += 8;

    pdf.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
    currentY += 2;

    pdf.setFont("helvetica", "normal");
    const sampleRate = Math.max(1, Math.floor(session.data.length / 50));

    session.data
      .filter((_, index) => index % sampleRate === 0)
      .forEach((dataPoint, index) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin + 20;
        }

        const rowData = [
          this.formatTime(dataPoint.time),
          `${dataPoint.speed.toFixed(1)}`,
          `${dataPoint.heartRate}`,
          `${dataPoint.rpm}`,
          `${dataPoint.resistance}`,
          `${dataPoint.watt}`,
          `${dataPoint.distance.toFixed(2)}`,
          `${dataPoint.calories}`,
        ];

        rowData.forEach((data, colIndex) => {
          pdf.text(data, margin + colIndex * columnWidth, currentY);
        });

        currentY += 6;
      });

    const fileName = `workout-report-${session.startTime.split("T")[0]}.pdf`;
    pdf.save(fileName);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  private addMetricsGuide(
    pdf: any,
    margin: number,
    pageWidth: number,
    pageHeight: number,
    currentY: number
  ): number {
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Metrics Guide & Training Zones", margin, currentY);
    currentY += 12;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const guides = [
      {
        title: "Heart Rate Zones:",
        items: [
          "Zone 1 (Rest): <100 bpm - Recovery and warm-up",
          "Zone 2 (Fat Burn): 100-130 bpm - Aerobic base building",
          "Zone 3 (Cardio): 130-160 bpm - Aerobic fitness",
          "Zone 4 (Peak): 160-180 bpm - Lactate threshold",
          "Zone 5 (Max): >180 bpm - Neuromuscular power",
        ],
      },
      {
        title: "Power Metrics:",
        items: [
          "Functional Threshold Power (FTP): Sustainable power for 1 hour",
          "Power-to-Weight Ratio: Critical for climbing performance",
          "Normalized Power: Intensity-adjusted average power",
          "Training Stress Score: Workout intensity and duration",
        ],
      },
      {
        title: "Performance Indicators:",
        items: [
          "Cadence: 80-100 RPM optimal for most cyclists",
          "Speed: Virtual speed based on power and resistance",
          "Calories: Estimated energy expenditure",
          "Distance: Virtual distance covered during session",
        ],
      },
    ];

    guides.forEach((guide) => {
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(guide.title, margin, currentY);
      currentY += 6;

      pdf.setFont("helvetica", "normal");
      guide.items.forEach((item) => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }
        const lines = pdf.splitTextToSize(
          `• ${item}`,
          pageWidth - 2 * margin - 5
        );
        pdf.text(lines, margin + 5, currentY);
        currentY += lines.length * 4 + 2;
      });
      currentY += 6;
    });

    return currentY;
  }
}

export const pdfExportService = new PDFExportService();
