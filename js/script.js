const width = 1000;
const height = 500;
const margin = 30;
const svg  = d3.select('#scatter-plot')
    .attr('width', width)
    .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let radius = 'gdp';
let year = '2000';
let colorParam = 'region';

// These variables will be useful in Part 2 & 3
const params = ['child-mortality', 'fertility-rate', 'gdp', 'life-expectancy', 'population'];
const colors = ['aqua', 'lime', 'gold', 'hotpink'];

const x = d3.scaleLinear().range([margin*2, width-margin]);
const y = d3.scaleLinear().range([height-margin, margin]);


const xLable = svg.append('text').attr('transform', `translate(${width/2}, ${height})`);
const yLable = svg.append('text').attr('transform', `translate(${margin/2}, ${height/2}) rotate(-90)`);

// Part 1: similar to rows above, set the 'transform' attribute for axis
const xAxis = svg.append('g').attr('transform', `translate(${0}, ${height-30})`); // .attr('transform', ...
const yAxis = svg.append('g').attr('transform', `translate(${margin*2}, ${0})`); // .attr('transform', ...


// Part 2: define color and radius scales
const r = d3.scaleSqrt().range([0,10]);
const color = d3.scaleOrdinal().range(colors);

// Part 2: add options to select element http://htmlbook.ru/html/select
// and add selected property for default value

// d3.select('#radius').selectAll('option')
//         ...


// Part 3: similar to above, but for axis
// ...


loadData().then(data => {
    // take a look at the data:
    console.log(data);

    // Part 2: set a 'domain' for color scale
    // for that we need to get all unique values of regions field with 'd3.nest'

    let regions = d3.nest().key(function(d) { return d[colorParam]; }).entries(data).map(d=> d.key);
    color.domain(regions);
    console.log(regions);
    console.log(color);
    console.log(r);
    d3.select('.slider').on('change', newYear);

    d3.select('#radius').on('change', newRadius);

    d3.select('#x_selector').on('change', newXAxis);

    d3.select('#y_selector').on('change', newYAxis);

    // Part 3: subscribe to axis selectors change
    // ...
    function newXAxis(){
        xParam = this.value;
        updateChart()
    }

    function newYAxis(){
        yParam = this.value;
        updateChart()
    }
    // change 'year' value
    function newYear(){
        year = this.value;
        updateChart()
    }

    function newRadius(){
        radius = this.value;
        updateChart()
        // Part 2: similar to 'newYear'
    }

    function updateChart(){
        xLable.text(xParam);
        yLable.text(yParam);
        d3.select('.year').text(year);

        // change the domain of 'x', transform String to Number using '+'
        let xRange = data.map(d=> +d[xParam][year]);
        x.domain([d3.min(xRange), d3.max(xRange)]);

        // call for axis
        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));

        // Part 1: create 'y axis' similary to 'x'
        // ...

        let yRange = data.map(d=> +d[yParam][year]);
        y.domain([d3.min(yRange), d3.max(yRange)]);

        // Part 2: change domain of new scale
        // ...

        let rRange = data.map(d=> +d[radius][year]);
        r.domain([d3.min(rRange), d3.max(rRange)]);

        // Part 1, 2: create and update points
        svg.selectAll('circle').remove();
        svg.selectAll('circle').data(data)
            .enter().append("circle")
            .attr("cx", function (d) { return x(+d[xParam][year]) })
            .attr("cy", function (d) { return y(+d[yParam][year]) })
            .attr("r", function (d) { return r(+d[radius][year]) })
            .style("fill", function (d) { return color(d[colorParam]) });

        //     ...
    }

    // draw a chart for the first time
    updateChart();
});

async function loadData() {
    const population = await d3.csv('data/pop.csv');
    const rest = {
        'gdp': await d3.csv('data/gdppc.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expect.csv'),
        'fertility-rate': await d3.csv('data/tfr.csv')
    };
    const data = population.map(d=>{
        return {
            geo: d.geo,
            country: d.country,
            region: d.region,
            population: {...d},
            ...Object.values(rest).map(v=>v.find(r=>r.geo===d.geo)).reduce((o, d, i)=>({...o, [Object.keys(rest)[i]]: d }), {})

        }
    });
    return data
}