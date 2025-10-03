d3.csv("data/Ex5_ARE_Spot_Prices.csv").then(data => {
    // Filter out rows where Region is "notTas-Snowy"
    const filteredData = data.filter(d => d.Region !== "notTas-Snowy");
    createLineChart(filteredData);
});

const createLineChart = (data) => {
    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Use a unique selector for the chart container
    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const innerChart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert Year and Average to numbers
    data.forEach(d => {
        d.Year = +d.Year;
        d.Average = +d.Average;
    });

    const firstYear = d3.min(data, d => d.Year);
    const lastYear = d3.max(data, d => d.Year);

    const xScale = d3.scaleLinear()
        .domain([firstYear, lastYear])
        .range([0, innerWidth]);

    const maxPrice = d3.max(data, d => d.Average);
    const yScale = d3.scaleLinear()
        .domain([0, maxPrice * 1.1])
        .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    innerChart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

    innerChart
        .append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Average));

    // Draw the line
    innerChart
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#703B69")
        .attr("stroke-width", 2)
        .attr("d", line);

    //Circles for each data point
    innerChart
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Average))
        .attr("r", 4)
        .attr("fill", "#703B69")
        .attr("opacity", 0.7);

    svg
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 10)
        .text("Year");

    svg
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", margin.left - 40)
        .attr("y", margin.top)
        .attr("transform", `rotate(-90,${margin.left - 40},${margin.top})`)
        .text("Average Price");
}