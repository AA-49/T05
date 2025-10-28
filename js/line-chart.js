d3.csv("data/Ex5_ARE_Spot_Prices.csv").then(data => {
    createLineChart(data);
});

const createLineChart = (data) => {
    const margin = {top: 20, right: 80, bottom: 50, left: 60};
    const width = 800;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const innerChart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // region column names in the CSV
    const regions = [
        "Queensland ($ per megawatt hour)",
        "New South Wales ($ per megawatt hour)",
        "Victoria ($ per megawatt hour)",
        "South Australia ($ per megawatt hour)",
        "Tasmania ($ per megawatt hour)",
        "Snowy ($ per megawatt hour)"
    ];

    // Build stats per year: min, max, avg across regions (ignore empty/non-numeric)
    const yearStats = data.map(d => {
        const year = +d.Year;
        const nums = regions
            .map(r => {
                const v = d[r];
                const n = v === undefined || v === "" ? NaN : +v;
                return Number.isFinite(n) ? n : null;
            })
            .filter(n => n !== null);
        return {
            Year: year,
            min: d3.min(nums),
            max: d3.max(nums),
            avg: d3.mean(nums)
        };
    }).sort((a,b) => a.Year - b.Year);

    const firstYear = d3.min(yearStats, d => d.Year);
    const lastYear = d3.max(yearStats, d => d.Year);

    const xScale = d3.scaleLinear()
        .domain([firstYear, lastYear])
        .range([0, innerWidth]);

    const maxPrice = d3.max(yearStats, d => d.max);
    const yScale = d3.scaleLinear()
        .domain([0, maxPrice * 1.1])
        .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    innerChart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

    innerChart
        .append("g")
        .call(yAxis);

    // Area between min and max
    const area = d3.area()
        .x(d => xScale(d.Year))
        .y0(d => yScale(d.min))
        .y1(d => yScale(d.max))
        .curve(d3.curveMonotoneX);

    innerChart.append("path")
        .datum(yearStats)
        .attr("d", area)
        .attr("fill", "#c2b6d9")
        .attr("opacity", 0.4);

    // Average line
    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.avg))
        .curve(d3.curveMonotoneX);

    innerChart.append("path")
        .datum(yearStats)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#703B69")
        .attr("stroke-width", 2);

    // Optional min and max dashed lines
    const maxLine = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.max))
        .curve(d3.curveMonotoneX);

    const minLine = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.min))
        .curve(d3.curveMonotoneX);

    innerChart.append("path")
        .datum(yearStats)
        .attr("d", maxLine)
        .attr("fill", "none")
        .attr("stroke", "#2E8B57")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3");

    innerChart.append("path")
        .datum(yearStats)
        .attr("d", minLine)
        .attr("fill", "none")
        .attr("stroke", "#B22222")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 3");

    // Labels for average, max, min on the last year
    const last = yearStats.find(d => d.Year === lastYear);
    if (last) {
        const x = xScale(last.Year) + 8; // small offset so text doesn't overlap point
        innerChart.append("text")
            .attr("x", x)
            .attr("y", yScale(last.avg))
            .text(`Average: ${last.avg.toFixed(1)}`)
            .attr("fill", "#703B69")
            .attr("dominant-baseline", "middle")
            .style("font-weight", 600);

        innerChart.append("text")
            .attr("x", x)
            .attr("y", yScale(last.max) - 8)
            .text(`Max: ${last.max.toFixed(1)}`)
            .attr("fill", "#2E8B57")
            .attr("dominant-baseline", "baseline");

        innerChart.append("text")
            .attr("x", x)
            .attr("y", yScale(last.min) + 12)
            .text(`Min: ${last.min.toFixed(1)}`)
            .attr("fill", "#B22222")
            .attr("dominant-baseline", "hanging");
    }

    // Axis labels
    svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 6)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", `translate(12, ${margin.top + innerHeight/2}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .text("Price ($/MWh)");
}