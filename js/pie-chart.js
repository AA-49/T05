d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv").then(data => {
    createPieChart(data);
});

const createPieChart = (data) => {
    const width = 400, height = 400, margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Parse numbers and normalise keys to match CSV
    data.forEach(d => {
        d.Mean = +d["Mean(Labelled energy consumption (kWh/year))"];
        d.Tech = d.Screen_Tech;
    });

    const total = d3.sum(data, d => d.Mean);

    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const uniqueTechs = Array.from(new Set(data.map(d => d.Tech)));

    const color = d3.scaleOrdinal()
        .domain(uniqueTechs)
        .range(["red", "yellow", "blue"]);

    const pie = d3.pie()
        .value(d => d.Mean)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
        .padAngle(0.02);

    const labelArc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 0.6);

    const slices = svg.selectAll("g.slice")
        .data(pie(data))
        .join("g")
        .attr("class", "slice");

    slices.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.Tech))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.9);

    // Labels: two-line (tech, percent)
    slices.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("fill", "#222")
        .each(function(d) {
            const percent = ((d.data.Mean / total) * 100).toFixed(1) + "%";
            // create tspans for two lines
            d3.select(this).append("tspan")
                .attr("x", 0)
                .attr("dy", "-0.2em")
                .style("font-size", "12px")
                .text(d.data.Tech);
            d3.select(this).append("tspan")
                .attr("x", 0)
                .attr("dy", "1.2em")
                .style("font-size", "11px")
                .style("font-weight", "500")
                .text(percent)
                .style("opacity", (+percent.replace("%","") < 5) ? 0.7 : 1);
        });

    // Legend to the right
    const legend = svg.append("g")
        .attr("transform", `translate(${radius + 20}, ${-radius})`);

    uniqueTechs.forEach((tech, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 22})`);
        g.append("rect")
            .attr("width", 16)
            .attr("height", 16)
            .attr("fill", color(tech));
        g.append("text")
            .attr("x", 22)
            .attr("y", 12)
            .text(tech)
            .style("font-size", "13px")
            .attr("fill", "#222");
    });
}