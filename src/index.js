import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Chart from './chart';
import windowSize from 'react-window-size';
import WaterfallBarChartWrapper from './waterfallBarChartWrapper.style';

class WaterfallBarChart extends Component {
  constructor(props) {
    super(props);
    this.getChartWidth = this.getChartWidth.bind(this);
    this.chart = null;
    this.chartId = `chart_${new Date().getTime()}`;
  }

  getChartWidth() {
    const { options={} } = this.props;
    const parentWidth = document.getElementById(`${this.chartId}_container`).offsetWidth;
    if( options.width )
      return Math.min(options.width, parentWidth);
    else
      return parentWidth;
  }

  componentDidMount() {
    const { data, tickFormat, valuesFormat } = this.props;
    this.chart = new Chart({
      id: this.chartId,
      width: this.getChartWidth(),
      data,
      tickFormat,
      valuesFormat
    });
    this.chart.render();
  }

  componentDidUpdate() {
    const { data } = this.props;
    this.chart.update(data, this.getChartWidth());
  }

  componentWillUnmount() {
    if( this.chart )
      this.chart.destroy();
    this.chart = null;
  }

  render() {
    const { options={} } = this.props;
    return (
      <WaterfallBarChartWrapper id={`${this.chartId}_container`} width={options.width ? `${options.width}px` : 'none'}>
        <svg className={this.chartId}></svg>
      </WaterfallBarChartWrapper>
    );
  }
}

WaterfallBarChart.propTypes = {
  options: PropTypes.object,
  data: PropTypes.object.isRequired
}

export default windowSize(WaterfallBarChart);
