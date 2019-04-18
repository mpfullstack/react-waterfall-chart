import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { max, min } from 'd3-array';

const ASPECT_RATIO = 5/6;

class Chart {
  constructor(params) {
    this.id = params.id;
    this.width = params.options.width;
    this.height = this.getChartHeight();
    this.tickFormat = params.options.tickFormat;
    this.valuesFormat = params.options.valuesFormat;
    this.type = params.options.type || 'cumulative';
    this.data = this.adaptData(params.data);
  }

  update({data, options, width}) {
    this.updateOptions(options);
    this.width = width || this.width;
    this.height = this.getChartHeight();
    this.data = this.adaptData(data);
    this.empty();
    this.render();
  }

  updateOptions(options) {
    this.tickFormat = options.tickFormat || this.tickFormat;
    this.valuesFormat = options.valuesFormat || this.valuesFormat;
    this.type = options.type || this.type;
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

  adaptData(data) {
    /* Cumulative data type
    -------------------------------------------------------
    {
      name: <String> (Required)
      value: <Number> (Required)
      class: <String>
      color: <String>
    }
    */

    /* Custom data type
    -------------------------------------------------------
    {
      name: <String> (Required)
      value: <Number> (Required)
      class: <String>
      color: <String>
      start: <Number> (Required)
      end: <Number> (Required)
    }
    */

    if( this.type === 'cumulative' ) {
      const adaptedData = data.reduce((accumulator, item, i) => {
        const sum = accumulator.sum + item.value;
        const adaptedItem = Object.assign({}, item, {
          start: accumulator.sum,
          end: accumulator.sum + item.value
        });
        //TODO: Assign right color based on positive or negative value
        accumulator.sum = sum;
        accumulator.items.push(adaptedItem);
        return accumulator;
      }, {
        sum: 0,
        items: []
      });
      adaptedData.items.push({
        name: 'Total',
        value: adaptedData.sum,
        class: 'total',
        color: 'green',
        start: 0,
        end: adaptedData.sum
      });
      return adaptedData.items;
    } else {
      return data;
    }
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
    const minDomain = min([{end: 0}, ...this.data], d => d.end);
    const maxDomain = max(this.data, d => d.end);
    y.domain([minDomain, maxDomain]);

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
          if( d.end >= minDomain && d.end <= (minDomain + 20) )
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
