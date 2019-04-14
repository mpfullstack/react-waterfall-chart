import styled from 'styled-components';

const WaterfallBarChartWrapper = styled.div`
  width: 100%;
  max-width: ${props => props.width};
  .bar {
    & line.connector {
      stroke: grey;
      stroke-dasharray: 3;
    }

    & text {
      fill: #666;
      font: 12px sans-serif;
      text-anchor: middle;
    }
  }

  .axis text {
    font: 11px 'Open Sans', 'Roboto', sans-serif;
    fill: #666;
  }

  .axis path,
  .axis line {
    fill: none;
    stroke: #999;
    shape-rendering: crispEdges;
  }
`;

export default WaterfallBarChartWrapper;
