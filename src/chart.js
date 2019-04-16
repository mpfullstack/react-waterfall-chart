import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max } from 'd3-array';

const ASPECT_RATIO = 5/6;

class Chart {
  constructor(params) {
    this.id = params.id;
    this.data = params.data;
    this.width = params.options.width;
    this.height = this.getChartHeight();
    this.tickFormat = params.options.tickFormat;
    this.valuesFormat = params.options.valuesFormat;
    this.type = params.options.type || 'cumulative';
  }

  update(data, width) {
    this.data = data;
    this.width = width || this.width;
    this.height = this.getChartHeight();
    this.empty();
    this.render();
  }

  getChartHeight() {
    return this.width * ASPECT_RATIO;
  }

  empty() {
    select(`.${this.id}`).html('');
  }

  destroy() {
    select(`.${this.id}`).remove();
  }

  render() {
    const margin = {top: 20, right: 30, bottom: 30, left: 60};
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;
    const padding = 0.3;

    const x = scaleBand()
      .rangeRound([0, width])
      .padding(padding);

    const y = scaleLinear()
      .range([height, 0]);

    const xAxis =  axisBottom(x);

    const yAxis = axisLeft(y)
      .tickFormat((d) => {
        if( this.tickFormat instanceof Function )
          return this.tickFormat(d);
        else
          return d;
      });

    const chart = select(`.${this.id}`)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(this.data.map(d => d.name));
    y.domain([0, max(this.data, d =>d.end)]);

    chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxis);

    // For each item in data append a g.bar element
    const totalItems = this.data.length;
    const bar = chart.selectAll(".bar")
      .data(this.data)
      .enter().append("g")
      .attr("class", (d, i) => `bar ${d.class || `bar${i}`}${i === this.data.length-1 ? ' last' : ''}`)
      .attr('style', d => d.color ? `fill:${d.color};` : '')
      .attr("transform", d => "translate(" + x(d.name) + ",0)");

    // Render the bars
    bar
      .append("rect")
      .attr("y", d => y( Math.max(d.start, d.end) ))
      .attr("height", d => Math.abs( y(d.start) - y(d.end) ))
      .attr("width", x.bandwidth());

    // Render the values on top of bars
    bar
      .append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", d => {
        if( d.start > d.end ) {
          if( d.end >= 0 && d.end <= 10 )
            return y(d.start) - 7;
          else
            return y(d.end) + 14;
        } else {
          return y(d.end) - 7;
        }
      })
      .text(d => {
        if( this.valuesFormat instanceof Function )
          return this.valuesFormat(d.end - d.start);
        else
          return d.end - d.start;
      });

    // Render the dashed lines
    bar
      .filter((d,i) => i < this.data.length-1)
      .append("line")
      .attr("class", "connector")
      .attr("x1", x.bandwidth() + 5)
      .attr("y1", d => y(d.end))
      .attr("x2", x.bandwidth() / (1 - padding) - 5)
      .attr("y2", d => y(d.end));
  }
}

export default Chart;
