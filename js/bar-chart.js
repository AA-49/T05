d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv").then(data => {
    console.log(data); 
    createBarChart(data);
});

const createBarChart = (data) => {
    const margin = { top: 20, right: 20, bottom: 80, left: 60 };
    const width = 600;
    const height = 380;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (!data || data.length === 0) return;

    // try to detect fields (fallback to common names used in other files)
    const techKey = data.columns.find(c => /screen[_\s]?tech/i.test(c)) || data.columns[0];
    const meanKey = data.columns.find(c => /mean|labelled|energy/i.test(c)) || data.columns[1];

    // parse numbers and normalize
    const parsed = data.map(d => {
        return {
            tech: d[techKey],
            mean: +d[meanKey]
        };
    }).filter(d => d.tech != null && !isNaN(d.mean));

    if (parsed.length === 0) return;

    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const inner = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(parsed.map(d => d.tech))
        .range([0, innerWidth])
        .padding(0.25);

    const yMax = d3.max(parsed, d => d.mean);
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([innerHeight, 0])
        .nice();

    // color: prefer red/yellow/blue for up to 3 techs, otherwise use scheme
    const uniqueTechs = Array.from(new Set(parsed.map(d => d.tech)));
    const colorRange = uniqueTechs.length <= 3 ? ["red", "yellow", "blue"] : d3.schemeTableau10;
    const color = d3.scaleOrdinal()
        .domain(uniqueTechs)
        .range(colorRange);

    // axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    inner.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end")
        .attr("dx", "-0.6em")
        .attr("dy", "0.2em");

    inner.append("g")
        .call(yAxis);

    // bars
    inner.selectAll("rect")
        .data(parsed)
        .join("rect")
        .attr("x", d => xScale(d.tech))
        .attr("y", d => yScale(d.mean))
        .attr("width", xScale.bandwidth())
        .attr("height", d => innerHeight - yScale(d.mean))
        .attr("fill", d => color(d.tech))
        .attr("stroke", "black")
        .attr("stroke-width", "1px");
};