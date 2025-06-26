import { Area, Bar, Column, Line, Pie, Scatter, Sankey } from '@ant-design/plots';
import { Empty } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
interface ChartConfig {
  chart_type:
  | 'LINE'
  | 'COLUMN'
  | 'BAR'
  | 'PIE'
  | 'DONUT'
  | 'SCATTER'
  | 'AREA'
  | 'MULTI_LINE'
  | 'STACK_AREA'
  | 'STACKED_COLUMN'
  | 'GROUPED_COLUMN'
  | 'GROUP_AND_STACK_COLUMN'
  | 'SANKEY'
  | 'SVG';
}

interface propsType {
  tableData: any;
  chart_config: ChartConfig;
  index?: any;
}

const Chart: React.FC<propsType> = ({ tableData, chart_config, index }) => {
  const [svgContent, setSvgContent] = useState<any>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Format tableData
  const format_data = tableData;
  const data = format_data?.map((item) => {
    let newItem: Record<string, any> = {};
    for (let key in item) {
      if (typeof item[key] === 'number') {
        const formattext = parseFloat(item[key].toFixed(2));
        newItem[key] = formattext;
      } else {
        newItem[key] = item[key];
      }
    }
    return newItem;
  });

  // Handle fetching and rendering SVG
  useEffect(() => {
    if (chart_config.chart_type === 'SVG' && tableData && tableData.length > 0) {
      const loadSvg = async () => {
        try {
          const response = await fetch(`/genai_ui/svg/${tableData[0]?.fileName}`);
          const svgText = await response.text();
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          setSvgContent(svgDoc.documentElement); // Save the SVG content
        } catch (error) {
          console.error('Error fetching SVG file:', error);
        }
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadSvg(); // Load the SVG when it enters the viewport
            observer.unobserve(entry.target); // Stop observing after loading
          }
        });
      }, { threshold: 0.1 });

      const chartContainer = document.getElementById(`chart-container-${index}`);
      if (chartContainer) {
        observer.observe(chartContainer);
      }

      return () => {
        if (chartContainer) {
          observer.unobserve(chartContainer); // Cleanup observer
        }
      };
    }
  }, [chart_config, tableData, index]);

  // Define config for non-SVG charts
  const config = {
    data,
    padding: 'auto',
    scale: { color: { palette: 'tableau10' } },
    xAxis: {
      tickCount: 5,
    },
    // tooltip: { channel: 'y', valueFormatter: '.2f' },
    tooltip: { channel: 'y' },
    ...chart_config,
  };

  console.log('config',config)

  // Function to get color based on maxOccupants (used for SVG color)
  const getColorBasedOnMaxOccupants = (maxOccupants: number) => {
    if (maxOccupants >= 0 && maxOccupants <= 3) return '#FF0000'; // red
    if (maxOccupants >= 4 && maxOccupants <= 7) return '#ff6600'; // orange
    return '#008000'; // green
  };

  // Update SVG colors based on data
  const updateSvgColors = (svg: any, itemData: any) => {
    const paths = svg.querySelectorAll('path');
    paths.forEach((path) => {
      const pathId = path.getAttribute('id');
      const matchedData = itemData.find((item: any) => item.objectId === pathId);
      if (matchedData) {
        const color = getColorBasedOnMaxOccupants(matchedData[chart_config?.yField]);
        path.setAttribute('style', 'fill: ' + color + ' !important;');
      }
    });
    return svg; // Return the updated SVG element
  };

  const renderSvgChart = () => {
    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!svgContainerRef.current) return;

      const container = svgContainerRef.current;
      const svg = container.querySelector('svg');
      if (!svg) return;

      const scaleStep = 0.1; // Adjust scale increment for smooth zoom
      const { offsetX, offsetY } = event.nativeEvent;
      const rect = container.getBoundingClientRect();

      const cursorX = offsetX / container.clientWidth;
      const cursorY = offsetY / container.clientHeight;

      let scale = parseFloat(svg.getAttribute('data-scale') || '1');
      scale = Math.max(0.5, Math.min(5, scale + (event.deltaY > 0 ? -scaleStep : scaleStep))); // Zoom limit between 0.5x and 5x
      svg.setAttribute('data-scale', scale.toString());

      const viewBox = svg.viewBox.baseVal;
      const centerX = viewBox.x + cursorX * viewBox.width;
      const centerY = viewBox.y + cursorY * viewBox.height;

      viewBox.width = container.clientWidth / scale;
      viewBox.height = container.clientHeight / scale;
      viewBox.x = centerX - cursorX * viewBox.width;
      viewBox.y = centerY - cursorY * viewBox.height;
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      const container = svgContainerRef.current;
      if (!container) return;

      const svg = container.querySelector('svg');
      if (!svg) return;

      let startX = event.clientX;
      let startY = event.clientY;

      const viewBox = svg.viewBox.baseVal;
      const initialX = viewBox.x;
      const initialY = viewBox.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (startX - moveEvent.clientX) * (viewBox.width / container.clientWidth);
        const dy = (startY - moveEvent.clientY) * (viewBox.height / container.clientHeight);

        viewBox.x = initialX + dx;
        viewBox.y = initialY + dy;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    if (svgContent && tableData.length > 0) {
      const updatedSvg = updateSvgColors(svgContent, tableData);
      return (
        <div
          className="svg-container"
          ref={svgContainerRef}
          style={{
            width: '100%',
            height: '500px', // Adjust as needed
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid #ddd', // Optional, for visibility
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <svg
            style={{
              width: '100%',
              height: '100%',
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${updatedSvg.viewBox.baseVal.width} ${updatedSvg.viewBox.baseVal.height}`}
            preserveAspectRatio="xMidYMid meet"
            dangerouslySetInnerHTML={{ __html: updatedSvg.outerHTML }}
          />
        </div>
      );
    }
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  };

  // Render charts based on type
  const charttype = () => {
    if (chart_config.chart_type === 'LINE') {
      return <Line {...config} />;
    } else if (chart_config.chart_type === 'MULTI_LINE') {
      return <Line {...config} />;
    } else if (chart_config.chart_type === 'BAR') {
      return <Bar {...config} />;
    } else if (chart_config.chart_type === 'COLUMN') {
      return <Column {...config} />;
    } else if (chart_config.chart_type === 'PIE') {
      return <Pie {...config} />;
    } else if (chart_config.chart_type === 'DONUT') {
      return <Pie {...config} />;
    } else if (chart_config.chart_type === 'SCATTER') {
      return <Scatter {...config} />;
    } else if (chart_config.chart_type === 'AREA') {
      return <Area {...config} />;
    } else if (chart_config.chart_type === 'STACK_AREA') {
      return <Area {...config} />;
    } else if (chart_config.chart_type === 'STACKED_COLUMN') {
      return <Column {...config} />;
    } else if (chart_config.chart_type === 'GROUPED_COLUMN') {
      return <Column {...config} />;
    } else if (chart_config.chart_type === 'GROUP_AND_STACK_COLUMN') {
      return <Column {...config} />;
    } else if (chart_config.chart_type === 'SANKEY') {
      return <Sankey {...config} />;
    } else if (chart_config.chart_type === 'SVG') {
      return renderSvgChart();
    }
  };

  if (data && data.length > 0) {
    return <div id={`chart-container-${index}`}>{charttype()}</div>;
  } else {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
};

export default Chart;
