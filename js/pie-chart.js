d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv").then(data => {
    createPieChart(data);
});

const createPieChart = (data) => {
    const width = 400, height = 400, margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Convert Mean to number
    data.forEach(d => {
        d.Mean = +d["Labelled energy consumption (kWh/year)"];
    });

    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Prepare data for pie
    const pie = d3.pie()
        .value(d => d.Mean);

    const data_ready = pie(data);

    // Color scale: red, yellow, blue for three techs
    const techs = data.map(d => d["Screen Tech"]);
    const color = d3.scaleOrdinal()
        .domain(techs)
        .range(["red", "yellow", "blue"]);

    // Draw slices
    svg.selectAll('path')
        .data(data_ready)
        .join('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', d => color(d.data["Screen Tech"]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8);

    // Add labels for each tech and percentage
    svg.selectAll('text')
        .data(data_ready)
        .join('text')
        .text(d => {
            const percent = ((d.data.Mean / d3.sum(data, d => d.Mean)) * 100).toFixed(1);
            return `${d.data["Screen Tech"]}\n${percent}%`;
        })
        .attr("transform", d => {
            const pos = d3.arc().innerRadius(0).outerRadius(radius * 0.7).centroid(d);
            return `translate(${pos[0]},${pos[1]})`;
        })
        .style("text-anchor", "middle")
        .style("font-size", "13px")
        .style("font-weight", "bold")
        .style("fill", "#333");

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(-${width/2 - 10},-${height/2 - 10})`);

    techs.forEach((tech, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 22)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(tech));
        legend.append("text")
            .attr("x", 25)
            .attr("y", i * 22 + 13)
            .text(tech)
            .style("font-size", "13px")
            .attr("fill", "#333");
    });
}