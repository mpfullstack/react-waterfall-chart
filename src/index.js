/**
 * @author Marc Perez <info@marcperez.cat>
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import windowSize from 'react-window-size';
import Chart from './chart';
import { shallowEqual } from './utils'
import WaterfallBarChartWrapper from './waterfallBarChartWrapper.style';

/**
 * A component that renders a waterfall bar chart style
 */
class WaterfallBarChart extends Component {
  constructor(props) {
    super(props);
    this.getChartWidth = this.getChartWidth.bind(this);
    this.chart = null;
    this.chartId = `chart_${new Date().getTime()}`;
    this.width = null;
  }

  /**
	 * Get the chart width picking the minimum value between options.width props if defined or parent width
	 * @returns {number}
	 */
  getChartWidth() {
    const { options = {} } = this.props;
    const parentWidth = document.getElementById(`${this.chartId}_container`).offsetWidth;
    if( options.width ) {
      this.width = Math.min(options.width, parentWidth);
    } else {
      this.width = parentWidth;
    }
    return this.width;
  }

  componentDidMount() {
    const { data, options = {} } = this.props;
    this.chart = new Chart({
      id: this.chartId,
      data,
      options: Object.assign({}, options, {width: this.getChartWidth()})
    });
    this.chart.render();
  }

  componentDidUpdate(prevProps, prevState) {
    const { data, options } = this.props;
    const previousWidth = this.width;
    const width = this.getChartWidth();
    // Avoid unnecessary renders by checking for data, options and width changes
    if(
      !shallowEqual(data, prevProps.data)
      ||
      !shallowEqual(options, prevProps.options)
      ||
      previousWidth !== width
    ) {
      this.chart.update({data, options, width});
    }
  }

  componentWillUnmount() {
    if( this.chart )
      this.chart.destroy();
    this.chart = null;
  }

  render() {
    const { options = {} } = this.props;
    return (
      <WaterfallBarChartWrapper id={`${this.chartId}_container`} width={options.width ? `${options.width}px` : 'none'}>
        <svg className={this.chartId}></svg>
      </WaterfallBarChartWrapper>
    );
  }
}

/**
* The component prop types.
*/
WaterfallBarChart.propTypes = {
  /**
  * The chart options.
  * @prop {object} options - The object containting the chart options.
  * @prop {number} options.width - The chart width.
  * @prop {string} options.type [custom|cumulative] - The type of the chart data.
  * @prop {string} options.defaultIncrementColor - The bar color used by default when value is positive.
  * @prop {string} options.defaultDecrementColor - The bar color used by default when value is negative.
  * @prop {string} options.defaultTotalColor - The bar color used by default in the cumulative total bar.
  * @prop {string} options.cumulativeTotalLabel - The text used in the x axis label for the cumulative total bar.
  * @prop {function(number)} options.tickFormat - A callback function to format the y axis values. It receives the
  * number of the y axis tick.
  * @prop {function(number, object)} options.valuesFormat - A callback function to format the chart bar values. It
  * receives the value as first arg and the data item as second arg.
  */
  options: PropTypes.object,
  /**
  * The chart data.
  */
  data: PropTypes.array.isRequired
}

export default windowSize(WaterfallBarChart);
